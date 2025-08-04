'use server';

/**
 * @fileOverview A conversational AI agent for making outreach calls.
 * 
 * - conversationalCall - A function that handles a turn in a conversation.
 * - ConversationalCallInput - The input type for the function.
 * - ConversationalCallOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { textToSpeech } from './text-to-speech';

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


export async function conversationalCall(input: ConversationalCallInput): Promise<ConversationalCallOutput> {
  return conversationalCallFlow(input);
}

const prompt = ai.definePrompt({
    name: 'conversationalCallPrompt',
    input: { schema: ConversationalCallInputSchema },
    output: { schema: z.object({ response: z.string() }) },
    prompt: `You are an expert AI sales development representative. Your goal is to book a meeting with the user.

You are friendly, professional, and concise. You are making a cold call.

Strictly adhere to the following instructions:
- Analyze the provided solution description, lead profile, and initial call script to understand the context.
- Your primary objective is to book a meeting. All your responses should guide the conversation toward this goal.
- Keep your responses short and natural, like a real human conversation.
- Use the conversation history to understand the context and avoid repeating yourself.
- Address the user's latest response directly.

START OF CONTEXT
---
Solution Description: {{{solutionDescription}}}
---
Lead Profile: {{{leadProfile}}}
---
Initial Call Script/Talking Points: {{{callScript}}}
---
END OF CONTEXT

CONVERSATION HISTORY:
{{#each conversationHistory}}
**{{role}}**: {{text}}
{{/each}}

The user (the lead) has just said:
**user**: "{{userResponse}}"

Based on all the above, what is your immediate, concise response?
`,
});


const conversationalCallFlow = ai.defineFlow(
  {
    name: 'conversationalCallFlow',
    inputSchema: ConversationalCallInputSchema,
    outputSchema: ConversationalCallOutputSchema,
  },
  async (input) => {

    const llmResponse = await prompt(input);
    const responseText = llmResponse.output?.response ?? "I'm sorry, I'm having trouble responding right now. Could you repeat that?";
    
    // Generate the audio for the response
    const ttsOutput = await textToSpeech(responseText);

    return {
      responseText,
      audioResponse: ttsOutput.media,
    };
  }
);
