import {z} from 'genkit';

/**
 * @fileOverview Schemas and types for the lead profile generator AI agent.
 *
 * - GenerateLeadProfileInput - The input type for the generateLeadProfile function.
 * - GenerateLeadProfileOutput - The return type for the generateLeadProfile function.
 */

export const GenerateLeadProfileInputSchema = z.string().describe('The description of the ideal customer.');
export type GenerateLeadProfileInput = z.infer<typeof GenerateLeadProfileInputSchema>;

export const GenerateLeadProfileOutputSchema = z.object({
  suggestedName: z
    .string()
    .describe('A short, descriptive name for this generated profile (e.g., "NY FinTech Startups").'),
  attributes: z
    .string()
    .describe('Key attributes of the ideal customer, including demographics, interests, and professional background.'),
  onlinePresence: z
    .string()
    .describe('Information about the ideal customer online presence, including social media profiles, website, and online communities.'),
});
export type GenerateLeadProfileOutput = z.infer<typeof GenerateLeadProfileOutputSchema>;
