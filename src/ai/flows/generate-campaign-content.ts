
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


export async function generateCampaignContent(
  input: GenerateCampaignContentInput
): Promise<GenerateCampaignContentOutput> {
  return generateCampaignContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCampaignContentPrompt',
  input: {schema: GenerateCampaignContentInputSchema},
  output: {schema: GenerateCampaignContentOutputSchema},
  prompt: `You are an expert sales strategist and copywriter, embodying the persona of a helpful, intelligent peer. Your primary goal is to secure a meeting by creating hyper-personalized, empathetic, and human-like outreach scripts.

You will be given a description of a software solution and a detailed profile of a target lead. Your task is to create a unique, compelling outreach sequence tailored *specifically* to this individual.

**Core Instructions:**
1.  **Analyze and Adapt Tone:** Your first step is to analyze the Lead Profile to determine the appropriate tone and style. For a "NY Financial Services" lead, your tone should be more formal and professional. For a "Silicon Valley Startup" lead, it can be more casual and innovative. Always maintain professionalism.
2.  **Email Script - The "Value-First" Email:**
    *   **Subject Line:** Must be intriguing and specific. Avoid generic marketing phrases.
    *   **Opening:** Immediately establish relevance by referencing your research on the lead's company or their recent activity.
    *   **The Pitch:** Connect your research to a highly probable pain point. Then, immediately and concisely pitch the solution's core value proposition. The lead should understand what you are offering at a first glance. This should be a brief, powerful summary of the solution.
    *   **Call-to-Action (CTA):** End with a low-friction question that invites a follow-up for more information, naturally leading toward a meeting. e.g., "Is exploring a new way to handle [task] a priority right now?"
3.  **Call Script - The "Direct and Respectful" Opener:**
    *   **Goal:** To disarm the lead, be respectful of their time, and earn the right to a brief conversation.
    *   **Opening:** Start with a calm, honest tone. "Hi [Lead Name], this is [Your Name]. I'll be upfront, this is a cold call, so feel free to hang up if this isn't a good time."
    *   **The Hook & Pitch:** Immediately connect to your research with a specific observation. Follow this immediately with a one-sentence value proposition that explains what your solution does and how it helps companies like theirs. "But the reason I'm calling is I saw [Their Company's recent news] and it sparked a thought. We provide [brief, one-sentence solution pitch]."
    *   **Permission & CTA:** "I don't know if this is a priority for you, but would it be a bad idea to chat for a few minutes about it?" This gives them control but presents a clear path to a meeting.

**Context:**
---
**Software Solution Description:**
{{{solutionDescription}}}
---
**Lead Profile (Your Target):**
{{{leadProfile}}}
---

Based on this specific context, generate the unique 'emailScript' and 'callScript'.
  `,
});

const generateCampaignContentFlow = ai.defineFlow(
  {
    name: 'generateCampaignContentFlow',
    inputSchema: GenerateCampaignContentInputSchema,
    outputSchema: GenerateCampaignContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
