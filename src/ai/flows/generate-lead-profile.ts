
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
  console.log('Starting lead profile generation for description:', input.substring(0, 100) + '...');
  try {
      const result = await generateLeadProfileFlow(input);
      console.log('Lead profile generation successful. Suggested Name:', result.suggestedName);
      return result;
  } catch (error) {
      console.error('Critical error in generateLeadProfile:', error);
      throw new Error('Failed to generate lead profile.');
  }
}

const prompt = ai.definePrompt({
  name: 'generateLeadProfilePrompt',
  input: {schema: GenerateLeadProfileInputSchema},
  output: {schema: GenerateLeadProfileOutputSchema},
  prompt: `You are an expert market strategist and business analyst. Your task is to identify and describe a wide range of potential customer segments for a given solution, considering local, regional, and international markets.

Instead of focusing on a single ideal person, think as broadly and creatively as possible about all the types of organizations, businesses, institutions, and sectors that would benefit from this solution.

**Instructions:**
1.  **Analyze the Solution:** Based on the description provided, deeply understand the core problem it solves and the value it offers.
2.  **Identify Broad Segments:** Brainstorm a diverse list of potential customer segments. This should include various types of entities like companies (by size, industry), businesses, schools, hospitals, banks, non-profits, government institutions, etc. Consider their geographical scope: local businesses, regional chains, and international corporations.
3.  **Detail the Profile:** For the segments you identify, generate a comprehensive profile that includes:
    *   **Key Attributes:** Describe the common characteristics of these segments. Include their industry, potential size, common goals, and the specific pain points the solution would address for them.
    *   **Online Presence:** Describe where these organizations and their key decision-makers are likely to be found online. Mention professional networks (like LinkedIn), industry-specific forums, publications they might read, and conferences they might attend.
4.  **Suggest a Name:** Based on your analysis, create a short, descriptive, and memorable name for this profile (e.g., "Global E-commerce Brands," "US Regional Hospitals," "UK FinTech Startups"). This will be the 'suggestedName'.

**Context:**
---
**Solution Description:**
{{{$input}}}
---

Based on the provided context, generate the "suggestedName", "Key Attributes", and "Online Presence" for the wide range of potential customer segments, covering local, regional, and international possibilities.
`,
});

const generateLeadProfileFlow = ai.defineFlow(
  {
    name: 'generateLeadProfileFlow',
    inputSchema: GenerateLeadProfileInputSchema,
    outputSchema: GenerateLeadProfileOutputSchema,
  },
  async input => {
    console.log('Executing generateLeadProfileFlow...');
    try {
        const {output} = await prompt(input);
        if (!output) {
            throw new Error("AI prompt returned an empty output.");
        }
        console.log('generateLeadProfileFlow executed successfully.');
        return output;
    } catch (error) {
        console.error('Error within generateLeadProfileFlow:', error);
        throw error;
    }
  }
);
