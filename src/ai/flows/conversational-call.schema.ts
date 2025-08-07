import { z } from 'genkit';

/**
 * @fileOverview Schemas and types for the conversational AI agent.
 * 
 * - ConversationalCallInput - The input type for the function.
 * - ConversationalCallOutput - The return type for the function.
 */

export const ConversationalCallInputSchema = z.object({
  solutionDescription: z.string().describe('A detailed description of the software solution or product being offered.'),
  leadProfile: z.string().describe('The generated lead profile, which dictates the persona of the person being called.'),
  callScript: z.string().describe("The opening script for the AI sales agent."),
  conversationHistory: z.array(z.object({
      role: z.enum(["agent", "lead"]).describe("The role, either 'agent' for the AI sales agent or 'lead' for the person being called."),
      text: z.string().describe("The text of the conversation turn.")
  })).describe('The history of the conversation so far, starting with the agent\'s opening line.'),
});
export type ConversationalCallInput = z.infer<typeof ConversationalCallInputSchema>;

export const ConversationalCallOutputSchema = z.object({
  agentResponseText: z.string().describe('The text of the AI agent\'s response.'),
  agentResponseAudio: z.string().describe("The generated audio for the agent's response as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
  leadResponseText: z.string().describe("The text of the simulated lead's response."),
  leadResponseAudio: z.string().describe("The generated audio for the lead's response as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
  isHangUp: z.boolean().describe("A boolean indicating if the lead has hung up the call, ending the conversation."),
  error: z.string().optional().describe("An optional error message if an error occurred during the conversation."),
  warning: z.string().optional().describe("An optional warning message if a warning occurred during the conversation."),
});
export type ConversationalCallOutput = z.infer<typeof ConversationalCallOutputSchema>;
