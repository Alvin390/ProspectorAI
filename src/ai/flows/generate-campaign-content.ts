
'use server';

/**
 * @fileOverview The AI campaign generator flow.
 *
 * - generateCampaignContent - A function that generates personalized email and call scripts for a multi-channel outreach campaign.
 */

import {ai} from '@/ai/genkit';
import {
    GenerateCampaignContentInputSchema,
    type GenerateCampaignContentInput,
    GenerateCampaignContentOutputSchema,
    type GenerateCampaignContentOutput
} from './generate-campaign-content.schema';
import { googleAI } from '@genkit-ai/googleai';


export async function generateCampaignContent(
  input: GenerateCampaignContentInput
): Promise<GenerateCampaignContentOutput> {
  console.log('Starting campaign content generation for lead profile:', input.leadProfile);
  try {
    const result = await generateCampaignContentFlow({
      ...input,
      enrichment: input.enrichment,
    });
    console.log('Campaign content generated successfully.');
    return result;
  } catch (error) {
      console.error('Critical error in generateCampaignContent:', error);
      // Return a fallback object or rethrow
      throw new Error('Failed to generate campaign content.');
  }
}

const prompt = ai.definePrompt({
  name: 'generateCampaignContentPrompt',
  input: {schema: GenerateCampaignContentInputSchema},
  output: {schema: GenerateCampaignContentOutputSchema},
  model: googleAI.model('gemini-1.5-pro-latest'),
  prompt: `You are an expert sales strategist and copywriter, embodying the persona of a helpful, intelligent peer. Your primary goal is to secure a meeting by creating hyper-personalized, empathetic, and human-like outreach scripts.

You will be given a description of a software solution, a detailed profile of a target lead, and **specific enrichment data about this individual contact**. Your task is to use this enrichment data to create a unique, compelling outreach sequence tailored *specifically* to this person.

**Enrichment Data (Use this for hyper-personalization):**
LinkedIn: {{{enrichment.linkedin}}}
Job Title: {{{enrichment.jobTitle}}}
Interests: {{{enrichment.interests}}}
Recent News: {{{enrichment.recentNews}}}

**Core Instructions:**
1.  **Hyper-Personalization is KEY:** Your main task is to *weave the enrichment data naturally* into your outreach. Do not just list the data; use it as a reason for your call or email. For example, if "Recent News" is "Company X launched a new AI initiative", your opening line should be "I saw the news about your new AI initiative and it prompted my call...".
2.  **Email Script - The "Value-First" Email:**
    *   **Subject Line:** Must be intriguing and specific. If possible, reference an interest or recent news item.
    *   **Opening:** Immediately establish relevance by referencing your research on the lead's company from the enrichment data. This is your hook.
    *   **The Pitch:** Connect your research to a highly probable pain point. Then, immediately and concisely pitch the solution's core value proposition. The lead should understand what you are offering at a first glance. This should be a brief, powerful summary of the solution.
    *   **Call-to-Action (CTA):** End with a low-friction question that invites a follow-up for more information, naturally leading toward a meeting. e.g., "Is exploring a new way to handle [task] a priority right now?"
3.  **Call Script - The "Direct and Respectful" Opener:**
    *   **Goal:** To disarm the lead, be respectful of their time, and earn the right to a brief conversation.
    *   **Opening:** Start with a calm, honest tone. "Hi [Lead Name], this is [Your Name]. I know I'm probably catching you out of the blue, but I was hoping you could spare me 30 seconds."
    *   **The Hook & Pitch:** This is critical. Immediately connect to the enrichment data with a specific observation. Follow this immediately with a one-sentence value proposition. For example: "The reason for my call is I saw [reference 'Recent News' or 'Interests'] and it sparked a thought. We provide [brief, one-sentence solution pitch]."
    *   **Permission & CTA:** "I don't know if this is a priority for you, but would it be a bad idea to chat for another minute about it?" This gives them control but presents a clear path to a meeting.

**Context:**
---
Solution Description: {{{solutionDescription}}}
Lead Profile: {{{leadProfile}}}
---
Generate the hyper-personalized outreach scripts now.`,
});

const generateCampaignContentFlow = ai.defineFlow(
  {
    name: 'generateCampaignContentFlow',
    inputSchema: GenerateCampaignContentInputSchema,
    outputSchema: GenerateCampaignContentOutputSchema,
  },
  async input => {
    console.log('Executing generateCampaignContentFlow...');
    try {
        const {output} = await prompt(input);
        if (!output) {
            throw new Error("AI prompt returned empty output.");
        }
        console.log('generateCampaignContentFlow executed successfully.');
        return output;
    } catch (error) {
        console.error('Error in generateCampaignContentFlow:', error);
        throw error; // Rethrow to be handled by the main function
    }
  }
);
