// The AI campaign generator flow.
//
// - generateCampaignContent - A function that generates personalized email and call scripts for a multi-channel outreach campaign.
// - GenerateCampaignContentInput - The input type for the generateCampaignContent function.
// - GenerateCampaignContentOutput - The return type for the generateCampaignContent function.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCampaignContentInputSchema = z.object({
  solutionDescription: z
    .string()
    .describe('A detailed description of the software solution or product being offered.'),
  leadProfile: z.string().describe('The generated lead profile.'),
});
export type GenerateCampaignContentInput = z.infer<
  typeof GenerateCampaignContentInputSchema
>;

const GenerateCampaignContentOutputSchema = z.object({
  emailScript: z.string().describe('The personalized email script.'),
  callScript: z.string().describe('The personalized call script.'),
});
export type GenerateCampaignContentOutput = z.infer<
  typeof GenerateCampaignContentOutputSchema
>;

export async function generateCampaignContent(
  input: GenerateCampaignContentInput
): Promise<GenerateCampaignContentOutput> {
  return generateCampaignContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCampaignContentPrompt',
  input: {schema: GenerateCampaignContentInputSchema},
  output: {schema: GenerateCampaignContentOutputSchema},
  prompt: `You are an AI assistant specializing in generating personalized outreach campaign content.

  Based on the provided software solution description and lead profile, create an engaging email script and a concise call script.

  Solution Description: {{{solutionDescription}}}
  Lead Profile: {{{leadProfile}}}

  Generate the email and call scripts based on this information.
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
