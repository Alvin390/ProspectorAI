import {z} from 'genkit';

/**
 * @fileOverview Schemas and types for the AI campaign generator flow.
 *
 * - GenerateCampaignContentInput - The input type for the generateCampaignContent function.
 * - GenerateCampaignContentOutput - The return type for the generateCampaignContent function.
 */

export const GenerateCampaignContentInputSchema = z.object({
  solutionDescription: z
    .string()
    .describe('A detailed description of the software solution or product being offered.'),
  leadProfile: z.string().describe('The generated lead profile.'),
  enrichment: z
    .object({
      linkedin: z.string().optional().describe('LinkedIn profile URL or summary.'),
      jobTitle: z.string().optional().describe('Job title of the contact.'),
      interests: z.string().optional().describe('Known interests or topics.'),
      recentNews: z.string().optional().describe('Recent company news or updates.'),
    })
    .optional()
    .describe('Extra enrichment data for hyper-personalization.'),
});
export type GenerateCampaignContentInput = z.infer<
  typeof GenerateCampaignContentInputSchema
>;

export const GenerateCampaignContentOutputSchema = z.object({
  emailScript: z.string().describe('The personalized email script.'),
  callScript: z.string().describe('The personalized call script.'),
});
export type GenerateCampaignContentOutput = z.infer<
  typeof GenerateCampaignContentOutputSchema
>;
