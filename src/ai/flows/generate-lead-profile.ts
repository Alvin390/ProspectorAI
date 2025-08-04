'use server';

/**
 * @fileOverview A lead profile generator AI agent.
 *
 * - generateLeadProfile - A function that handles the lead profile generation process.
 * - GenerateLeadProfileInput - The input type for the generateLeadProfile function.
 * - GenerateLeadProfileOutput - The return type for the generateLeadProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLeadProfileInputSchema = z.string().describe('The description of the ideal customer.');
export type GenerateLeadProfileInput = z.infer<typeof GenerateLeadProfileInputSchema>;

const GenerateLeadProfileOutputSchema = z.object({
  attributes: z
    .string()
    .describe('Key attributes of the ideal customer, including demographics, interests, and professional background.'),
  onlinePresence: z
    .string()
    .describe('Information about the ideal customer online presence, including social media profiles, website, and online communities.'),
});
export type GenerateLeadProfileOutput = z.infer<typeof GenerateLeadProfileOutputSchema>;

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
