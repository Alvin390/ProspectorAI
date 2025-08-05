
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
import { googleAI } from '@genkit-ai/googleai';


export async function conversationalCall(input: ConversationalCallInput): Promise<ConversationalCallOutput> {
  return conversationalCallFlow(input);
}

const prompt = ai.definePrompt({
    name: 'conversationalCallPrompt',
    input: { schema: ConversationalCallInputSchema },
    output: { schema: z.object({ 
        agentResponse: z.string().describe("The AI sales agent's next response in the conversation."),
        leadResponse: z.string().describe("The simulated lead's response to the agent. This should be based on the lead's persona from their profile. It can range from interested to dismissive."),
        isHangUp: z.boolean().describe("Set to true if the lead's response indicates they are ending the conversation (e.g., 'I'm not interested, goodbye', 'I have to go')."),
     }) },
    // Use a faster model for conversational turnarounds.
    model: googleAI.model('gemini-1.5-flash-latest'),
    prompt: `You are an expert AI puppeteer, controlling a conversation between an AI sales agent and a potential lead. Your task is to generate the next turn for both participants in a realistic and engaging way.

**1. The AI Sales Agent Persona (Your "Agent" Puppet):**
- **Persona:** Friendly, intelligent, and highly capable human colleague.
- **Primary Goal:** To book a meeting with the lead.
- **Behavior:**
    - Never reveals they are an AI.
    - Doesn't rush; builds rapport first.
    - Listens actively, asks open-ended questions.
    - Is empathetic and adapts to the lead's tone.
    - Keeps responses short, natural, and conversational.
    - Every response strategically guides the conversation toward booking a meeting.

**2. The Lead Persona (Your "Lead" Puppet):**
- **Persona Source:** You must derive the lead's persona *exclusively* from the "Lead Profile" provided below. This profile dictates their personality, potential pain points, and likely reaction to the sales call.
- **Behavior:**
    - If the profile suggests they are a busy executive, their responses should be curt and direct.
    - If the profile suggests they are technical, they might ask specific questions.
    - If the profile suggests they are from a casual startup culture, their tone can be more informal.
    - Their responses should be realistic. They might be skeptical, busy, interested, or dismissive.

**3. Your Task:**
Based on the provided context and the full conversation history, generate the very next \`agentResponse\` and \`leadResponse\`.

---
**Solution Description (What the agent is offering):**
{{{solutionDescription}}}
---
**Lead Profile (The persona for the lead you are controlling):**
{{{leadProfile}}}
---

**Full Conversation History (The story so far):**
{{#each conversationHistory}}
**{{role}}**: {{text}}
{{/each}}

---
GENERATE THE NEXT TURN IN THE CONVERSATION:
`,
});


const conversationalCallFlow = ai.defineFlow(
  {
    name: 'conversationalCallFlow',
    inputSchema: ConversationalCallInputSchema,
    outputSchema: ConversationalCallOutputSchema,
  },
  async (input) => {
    
    // 1. Get the next turn of dialogue from the LLM
    const llmResponse = await prompt(input);
    const agentResponseText = llmResponse.output?.agentResponse ?? "I'm sorry, I seem to have lost my train of thought.";
    const leadResponseText = llmResponse.output?.leadResponse ?? "Sorry, you're breaking up. I have to go.";
    const isHangUp = llmResponse.output?.isHangUp ?? true;

    // 2. Generate audio for both responses in parallel for efficiency
    const [agentAudio, leadAudio] = await Promise.all([
      textToSpeech(agentResponseText),
      textToSpeech(leadResponseText)
    ]);

    return {
      agentResponseText,
      agentResponseAudio: agentAudio.media,
      leadResponseText,
      leadResponseAudio: leadAudio.media,
      isHangUp,
    };
  }
);
