
'use server';

/**
 * @fileOverview A conversational AI agent for making outreach calls.
 * 
 * - conversationalCall - A function that handles a turn in a conversation.
 */

import { ai } from '@/ai/genkit';
import { textToSpeech } from './text-to-speech';
import {
    ConversationalCallInputSchema,
    type ConversationalCallInput,
    ConversationalCallOutputSchema,
    type ConversationalCallOutput
} from './conversational-call.schema';
import { z } from 'genkit';


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
- Analyze the provided solution description, lead profile, and initial call script to understand the context. This context is your entire knowledge base.
- Your primary objective is to book a meeting. All your responses should guide the conversation toward this goal.
- Keep your responses short and natural, like a real human conversation. Do not sound like a robot.
- Use the conversation history to understand the flow of the conversation and avoid repeating yourself.
- Address the user's latest response directly and intelligently. If they ask a question, answer it using the context provided.
- Be adaptive. Do not just stick to the script. The script is for your opening lines. Use the full context to handle the conversation dynamically.

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

Based on all the above, what is your immediate, concise, and intelligent response?
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
