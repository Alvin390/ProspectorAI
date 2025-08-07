
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

// Define the expected response type from the LLM
interface LLMResponse {
    agentResponseText: string;
    leadResponseText: string;
    isHangUp: boolean;
}

// Cache for storing generated audio to avoid regenerating the same responses
const audioCache = new Map<string, string>();

// Generate a cache key for audio
const getAudioCacheKey = (text: string, isAgent: boolean): string => {
  return `${isAgent ? 'agent' : 'lead'}:${text.substring(0, 100)}`;
};

export async function conversationalCall(input: ConversationalCallInput): Promise<ConversationalCallOutput> {
  try {
    console.log('Starting conversational call with input:', JSON.stringify({
      ...input,
      conversationHistory: input.conversationHistory?.map((h, i) => 
        `[${i}] ${h.role}: ${h.text.substring(0, 50)}${h.text.length > 50 ? '...' : ''}`
      )
    }, null, 2));
    
    // 1. First get the text responses from the LLM
    const textResponse = await conversationalCallFlow(input);
    
    console.log('AI response generated:', {
      agentResponse: textResponse.agentResponseText.substring(0, 100) + (textResponse.agentResponseText.length > 100 ? '...' : ''),
      leadResponse: textResponse.leadResponseText.substring(0, 100) + (textResponse.leadResponseText.length > 100 ? '...' : ''),
      isHangUp: textResponse.isHangUp
    });
    
    // If there was an error in the text generation, return early
    if (textResponse.error) {
      console.error('Error in text generation:', textResponse.error);
      return {
        agentResponseText: textResponse.agentResponseText,
        agentResponseAudio: '',
        leadResponseText: textResponse.leadResponseText,
        leadResponseAudio: '',
        isHangUp: true,
        error: textResponse.error
      };
    }
    
    // 2. Generate audio with retry logic and better voice selection
    const generateAudioWithRetry = async (text: string, isAgent: boolean, retries = 2): Promise<string> => {
      if (!text.trim()) return '';
      
      const cacheKey = getAudioCacheKey(text, isAgent);
      if (audioCache.has(cacheKey)) {
        console.log(`Using cached audio for ${isAgent ? 'agent' : 'lead'}`);
        return audioCache.get(cacheKey)!;
      }
      
      try {
        console.log(`Generating ${isAgent ? 'agent' : 'lead'} audio (${text.length} chars)`);
        const voice = isAgent ? 'achernar' : 'achird';
        const result = await textToSpeech({
          text: text,
          voice: voice,
        });
        
        if (!result?.media) {
          throw new Error('No media data received');
        }
        
        const audioData = `data:audio/wav;base64,${result.media}`;
        audioCache.set(cacheKey, audioData);
        return audioData;
        
      } catch (error) {
        console.error(`Error generating ${isAgent ? 'agent' : 'lead'} audio (${retries} retries left):`, error);
        if (retries > 0) {
          console.log(`Retrying ${isAgent ? 'agent' : 'lead'} audio generation...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries))); // Exponential backoff
          return generateAudioWithRetry(text, isAgent, retries - 1);
        }
        throw error;
      }
    };

    // 3. Generate audio for both responses with error handling
    let agentAudio = '';
    let leadAudio = '';
    
    try {
      // Generate agent audio first
      agentAudio = await generateAudioWithRetry(textResponse.agentResponseText, true);
      
      // Small delay before generating lead audio to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Then generate lead audio
      leadAudio = await generateAudioWithRetry(textResponse.leadResponseText, false);
      
    } catch (error) {
      console.error('Audio generation error:', error);
      // Continue with empty audio rather than failing the entire request
    }

    // 4. Construct the final response
    const result: ConversationalCallOutput = {
      agentResponseText: textResponse.agentResponseText,
      agentResponseAudio: agentAudio,
      leadResponseText: textResponse.leadResponseText,
      leadResponseAudio: leadAudio,
      isHangUp: textResponse.isHangUp,
      ...(agentAudio === '' || leadAudio === '' ? { 
        warning: 'Some audio could not be generated. The conversation will continue without audio.' 
      } : {})
    };
    
    console.log('Conversation turn completed:', {
      agentAudioLength: agentAudio?.length || 0,
      leadAudioLength: leadAudio?.length || 0,
      isHangUp: result.isHangUp
    });
    
    return result;
    
  } catch (error) {
    console.error('Error in conversationalCall:', error);
    return {
      agentResponseText: 'I apologize, but I encountered an error processing this conversation.',
      agentResponseAudio: '',
      leadResponseText: 'I\'m having trouble with this call. Can we try again later?',
      leadResponseAudio: '',
      isHangUp: true,
      error: 'An error occurred while processing the conversation.'
    };
  }
}

const prompt = ai.definePrompt({
    name: 'conversationalCallPrompt',
    input: { schema: ConversationalCallInputSchema },
    output: { 
        schema: z.object({ 
            agentResponseText: z.string().describe("The AI sales agent's next response in the conversation."),
            leadResponseText: z.string().describe("The simulated lead's response based on their persona."),
            isHangUp: z.boolean().describe("Set to true if the lead wants to end the conversation."),
        }) 
    },
    model: googleAI.model('gemini-1.5-flash-latest'),
    prompt: `You are an expert AI puppeteer, controlling a conversation between an AI sales agent and a potential lead. Your task is to generate the next turn for both participants in a realistic and engaging way.

**IMPORTANT INSTRUCTIONS:**
1. You MUST respond with a valid JSON object matching this exact structure:
   {
     "agentResponseText": "The agent's response",
     "leadResponseText": "The lead's response",
     "isHangUp": false
   }
2. Do NOT include any other text outside the JSON object.
3. Keep responses concise and natural-sounding.

**1. The AI Sales Agent Persona (Your "Agent" Puppet):**
- **Persona:** Friendly, intelligent, and highly capable human colleague.
- **Primary Goal:** To book a meeting with the lead.
- **Behavior:**
    - Never reveals they are an AI.
    - Builds rapport before pitching.
    - Keeps responses short and conversational.
    - Guides conversation toward booking a meeting.

**2. The Lead Persona (Your "Lead" Puppet):**
- **Persona:** Based on this profile: {{leadProfile}}
- **Behavior:**
    - Responds naturally based on the profile.
    - May be interested, neutral, or dismissive.
    - Asks relevant questions about the solution.

**3. The Solution Being Pitched:**
{{solutionDescription}}

**4. Conversation History So Far:**
{{#each conversationHistory}}
**{{role}}**: {{text}}
{{/each}}

**5. Your Task:**
Generate the next exchange in the conversation. The agent should respond naturally to the lead's last statement, and the lead should respond to the agent in a way that reflects their persona.

**6. Required Output Format (JSON):**
{
  "agentResponseText": "The agent's next response",
  "leadResponseText": "The lead's response to the agent",
  "isHangUp": false
}`,
});

// Define an intermediate schema for the flow that doesn't include audio
const ConversationalCallTextOnlyOutputSchema = z.object({
  agentResponseText: z.string(),
  leadResponseText: z.string(),
  isHangUp: z.boolean(),
  error: z.string().optional(),
});

type ConversationalCallTextOnlyOutput = z.infer<typeof ConversationalCallTextOnlyOutputSchema>;

const conversationalCallFlow = ai.defineFlow(
  {
    name: 'conversationalCallFlow',
    inputSchema: ConversationalCallInputSchema,
    outputSchema: ConversationalCallTextOnlyOutputSchema,
  },
  async (input): Promise<ConversationalCallTextOnlyOutput> => {
    try {
      // 1. Get the next turn of dialogue from the LLM
      const llmResponse = await prompt(input);
      
      // 2. Return the text-only response (audio will be added later)
      return {
        agentResponseText: llmResponse.output?.agentResponseText?.trim() || 
          "I'm sorry, I seem to have lost my train of thought. Could you please repeat that?",
        leadResponseText: llmResponse.output?.leadResponseText?.trim() || 
          "I'm not sure how to respond to that. Could you rephrase?",
        isHangUp: llmResponse.output?.isHangUp ?? false,
      };
      
    } catch (error) {
      console.error('Error in conversationalCallFlow:', error);
      // Return a graceful error response
      return {
        agentResponseText: "I'm having trouble processing this conversation. Let's try that again.",
        leadResponseText: "I'm having some technical difficulties. Could we try this again later?",
        isHangUp: true,
        error: 'Error generating conversation response: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }
);
