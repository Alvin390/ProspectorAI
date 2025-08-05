import { z } from 'genkit';

/**
 * @fileOverview Schemas and types for the AI email follow-up agent.
 * 
 * - EmailFollowUpInput - The input type for the function.
 * - EmailFollowUpOutput - The return type for the function.
 */

export const EmailFollowUpInputSchema = z.object({
  solutionDescription: z.string().describe('A detailed description of the software solution or product being offered.'),
  leadProfile: z.string().describe('The generated lead profile.'),
  interactionHistory: z.array(z.object({
      role: z.string().describe("The role in the interaction (e.g., 'user' for the AI agent, 'lead' for the person)."),
      text: z.string().describe("The content of the interaction (e.g., the body of the email).")
  })).describe('The entire interaction history, including all calls and emails.'),
});
export type EmailFollowUpInput = z.infer<typeof EmailFollowUpInputSchema>;

export const EmailFollowUpOutputSchema = z.object({
  responseEmailBody: z.string().describe('The AI-generated draft of the email reply. If no reply is needed, this can be an empty string.'),
  suggestedAction: z.enum(['REPLIED_AUTOMATICALLY', 'MEETING_SCHEDULED', 'MARK_AS_NOT_INTERESTED', 'NEEDS_ATTENTION'])
    .describe('The final status or next action determined by the AI. "NEEDS_ATTENTION" means a human must review.')
});
export type EmailFollowUpOutput = z.infer<typeof EmailFollowUpOutputSchema>;
