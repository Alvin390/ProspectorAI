
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
  prompt: `You are an expert AI copywriter specializing in high-conversion sales outreach. Your task is to create a compelling, personalized outreach sequence for a potential lead.

You will be given a description of the software solution being offered and a detailed profile of the target lead.

Your output must be a JSON object containing two distinct, ready-to-use scripts: 'emailScript' and 'callScript'.

**Instructions:**
1.  **Email Script:**
    *   Craft a concise, engaging, and personalized email.
    *   The subject line must be attention-grabbing and relevant.
    *   The body should immediately establish relevance to the lead's role or company, reference a likely pain point (inferred from their profile), and briefly introduce the solution as a potential remedy.
    *   End with a clear, low-friction call-to-action, like asking a question to gauge interest, not immediately asking for a meeting.
2.  **Call Script:**
    *   Write a short, professional, and friendly script for an initial cold call.
    *   It should include a clear opening, a brief value proposition directly tied to the lead's profile, and a question to open the conversation.
    *   This is the script the AI agent will use as its opening statement for an automated call.

**Context:**
---
**Software Solution Description:**
{{{solutionDescription}}}
---
**Lead Profile:**
{{{leadProfile}}}
---

Based on the provided context, generate the 'emailScript' and 'callScript'.
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
