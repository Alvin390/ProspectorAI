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
  emailThread: z.array(z.object({
      from: z.string().describe("Who sent the email (e.g., 'user' for the AI, 'lead' for the person)."),
      content: z.string().describe("The body of the email.")
  })).describe('The entire email conversation history.'),
});
export type EmailFollowUpInput = z.infer<typeof EmailFollowUpInputSchema>;

export const EmailFollowUpOutputSchema = z.object({
  responseEmailBody: z.string().describe('The AI-generated draft of the email reply. If no reply is needed, this can be an empty string.'),
  suggestedAction: z.enum(['REPLIED_AUTOMATICALLY', 'MEETING_SCHEDULED', 'MARK_AS_NOT_INTERESTED', 'NEEDS_ATTENTION'])
    .describe('The final status or next action determined by the AI. "NEEDS_ATTENTION" means a human must review.')
});
export type EmailFollowUpOutput = z.infer<typeof EmailFollowUpOutputSchema>;
