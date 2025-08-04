
'use server';

/**
 * @fileOverview A lead profile generator AI agent.
 *
 * - generateLeadProfile - A function that handles the lead profile generation process.
 */

import {ai} from '@/ai/genkit';
import {
    GenerateLeadProfileInputSchema,
    type GenerateLeadProfileInput,
    GenerateLeadProfileOutputSchema,
    type GenerateLeadProfileOutput
} from './generate-lead-profile.schema';

export async function generateLeadProfile(input: GenerateLeadProfileInput): Promise<GenerateLeadProfileOutput> {
  return generateLeadProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLeadProfilePrompt',
  input: {schema: GenerateLeadProfileInputSchema},
  output: {schema: GenerateLeadProfileOutputSchema},
  prompt: `You are an expert market strategist and business analyst. Your task is to identify and describe a wide range of potential customer segments for a given solution.

Instead of focusing on a single ideal person, think broadly about all the types of organizations, businesses, institutions, and sectors that would benefit from this solution.

**Instructions:**
1.  **Analyze the Solution:** Based on the description provided, deeply understand the core problem it solves and the value it offers.
2.  **Identify Broad Segments:** Brainstorm a list of diverse potential customer segments. This should include various types of entities like companies (by size, industry), businesses, schools, hospitals, banks, non-profits, government institutions, etc.
3.  **Detail the Profile:** For the segments you identify, generate a comprehensive profile that includes:
    *   **Key Attributes:** Describe the common characteristics of these segments. Include their industry, potential size, common goals, and the specific pain points the solution would address for them.
    *   **Online Presence:** Describe where these organizations and their key decision-makers are likely to be found online. Mention professional networks (like LinkedIn), industry-specific forums, publications they read, and conferences they might attend.

**Context:**
---
**Solution Description:**
{{{$input}}}
---

Based on the provided context, generate the "Key Attributes" and "Online Presence" for the wide range of potential customer segments.
`,
});

const generateLeadProfileFlow = ai.defineFlow(
  {
    name: 'generateLeadProfileFlow',
    inputSchema: GenerateLeadProfileInputSchema,
    outputSchema: GenerateLeadProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
