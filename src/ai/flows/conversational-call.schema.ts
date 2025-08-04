import { z } from 'genkit';

/**
 * @fileOverview Schemas and types for the conversational AI agent.
 * 
 * - ConversationalCallInput - The input type for the function.
 * - ConversationalCallOutput - The return type for the function.
 */

export const ConversationalCallInputSchema = z.object({
  solutionDescription: z.string().describe('A detailed description of the software solution or product being offered.'),
  leadProfile: z.string().describe('The generated lead profile.'),
  callScript: z.string().describe('The initial script or key talking points for the call.'),
  conversationHistory: z.array(z.object({
      role: z.string().describe("The role, either 'user' for the lead or 'model' for the AI agent."),
      text: z.string().describe("The text of the conversation turn.")
  })).describe('The history of the conversation so far.'),
  userResponse: z.string().describe("The latest response from the lead (the user).")
});
export type ConversationalCallInput = z.infer<typeof ConversationalCallInputSchema>;

export const ConversationalCallOutputSchema = z.object({
  responseText: z.string().describe('The text of the AI agent\'s response.'),
  audioResponse: z.string().describe("The generated audio for the response as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type ConversationalCallOutput = z.infer<typeof ConversationalCallOutputSchema>;
