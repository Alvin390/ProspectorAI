
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
  prompt: `You are an expert sales strategist and copywriter with a deep understanding of human psychology. Your primary goal is to get a meeting booked by creating hyper-personalized, intelligent, and human-like outreach scripts. You do NOT use generic templates.

You will be given a description of the software solution being offered and a detailed profile of a target lead segment. Your task is to create a unique, compelling outreach sequence tailored specifically to THIS lead profile.

**Core Instructions:**
1.  **Deep Analysis:** First, deeply analyze the solution's value proposition and the lead's specific attributes, industry, and likely pain points. Find the single most compelling intersection between their problem and your solution. This is your "hook".
2.  **Email Script - The "Why You, Why Now" Email:**
    *   **Subject Line:** Must be intriguing, specific, and low-threat. Avoid generic sales-y subjects. Think "Question about [Their Company/Project]" or a relevant, non-obvious observation.
    *   **Opening:** Immediately establish relevance and show you've done your research. Reference something specific from their profile (e.g., their company's recent project, their role, a post they shared).
    *   **Body:** Connect your research to a highly probable pain point they are facing. Frame the problem concisely. Then, briefly introduce the solution as a specific remedy to *that* pain point. Use natural, peer-to-peer language.
    *   **Call-to-Action (CTA):** End with a low-friction, interest-gauging question. Instead of "Can we meet?", try "Is this something you're thinking about?" or "Would it be valuable to see how we're solving [problem] for companies like yours?".
3.  **Call Script - The Conversational Opener:**
    *   **Goal:** The goal is NOT to pitch. It is to start a conversation and earn the right to continue.
    *   **Opening:** Start with a calm, confident tone. "Hi [Lead Name], this is [Your Name]. I know my call is unexpected, but I was hoping for a brief moment of your time."
    *   **The Hook:** Immediately connect to your research. "I was just looking at [Their Company's recent news/project] and it sparked a thought about [the specific pain point you identified]."
    *   **Permission & Value Prop:** "We work with other [Lead's Industry] leaders on this, helping them [achieve specific outcome]. I don't know if this is a priority for you, but would it make sense to have a brief chat about it?" This gives them an easy "out" but also presents a clear value proposition.
4.  **Tone:** Be confident, respectful, and concise. Write like a human, not a marketing robot. Avoid buzzwords and jargon.

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
