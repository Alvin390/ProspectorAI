'use server';

// The AI campaign generator flow.
//
// - generateCampaignContent - A function that generates personalized email and call scripts for a multi-channel outreach campaign.

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
