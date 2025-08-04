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
  prompt: `You are an expert marketing analyst specializing in lead profile generation.

You will use the following information to generate a detailed lead profile, including key attributes and online presence, to efficiently target potential customers.

Description of ideal customer: {{{$input}}}`,
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
