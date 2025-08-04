'use server';

import {
  generateLeadProfile,
} from '@/ai/flows/generate-lead-profile';
import type { GenerateLeadProfileOutput } from '@/ai/flows/generate-lead-profile.schema';
import {
  generateCampaignContent,
} from '@/ai/flows/generate-campaign-content';
import type { GenerateCampaignContentOutput } from '@/ai/flows/generate-campaign-content.schema';
import { 
  textToSpeech,
} from '@/ai/flows/text-to-speech';
import type { TextToSpeechOutput } from '@/ai/flows/text-to-speech.schema';
import {
    conversationalCall,
} from '@/ai/flows/conversational-call';
import type { ConversationalCallInput, ConversationalCallOutput } from '@/ai/flows/conversational-call.schema';
import { z } from 'zod';
import { initialSolutions } from './solutions/data';

interface LeadProfileFormState {
  message: string;
  data: GenerateLeadProfileOutput | null;
  error: string | null;
}

export async function handleGenerateLeadProfile(
  prevState: LeadProfileFormState,
  formData: FormData
): Promise<LeadProfileFormState> {
  const schema = z.string().min(10, 'Description is too short');
  const description = formData.get('description') as string;

  const validated = schema.safeParse(description);
  if (!validated.success) {
    return {
      message: 'error',
      data: null,
      error: validated.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const result = await generateLeadProfile(validated.data);
    return { message: 'success', data: result, error: null };
  } catch (e: any) {
    return { message: 'error', data: null, error: e.message || 'An unknown error occurred.' };
  }
}

interface CampaignContentFormState {
  message: string;
  data: GenerateCampaignContentOutput | null;
  error: string | null;
}

export async function handleGenerateCampaignContent(
  prevState: CampaignContentFormState,
  formData: FormData
): Promise<CampaignContentFormState> {
  const schema = z.object({
    solution: z.string().min(1, 'Please select a solution'),
    leadProfile: z.string().min(1, 'Please select a lead profile'),
  });

  const validated = schema.safeParse({
    solution: formData.get('solution'),
    leadProfile: formData.get('leadProfile'),
  });

  if (!validated.success) {
    return {
      message: 'error',
      data: null,
      error: validated.error.errors.map((e) => e.message).join(', '),
    };
  }
  
  try {
    const solution = initialSolutions.find(s => s.name === validated.data.solution);
    if (!solution) {
      return { message: 'error', data: null, error: 'Selected solution not found.' };
    }

    const result = await generateCampaignContent({
        solutionDescription: solution.description,
        leadProfile: validated.data.leadProfile
    });
    return { message: 'success', data: result, error: null };
  } catch (e: any) {
    return { message: 'error', data: null, error: e.message || 'An unknown error occurred.' };
  }
}

interface TextToSpeechState {
    message: string;
    data: TextToSpeechOutput | null;
    error: string | null;
}

export async function handleTextToSpeech(
    prevState: TextToSpeechState,
    formData: FormData
): Promise<TextToSpeechState> {
    const schema = z.string().min(1, 'Script is empty');
    const script = formData.get('script') as string;

    const validated = schema.safeParse(script);
    if (!validated.success) {
        return {
            message: 'error',
            data: null,
            error: validated.error.errors.map((e) => e.message).join(', '),
        };
    }

    try {
        const result = await textToSpeech(validated.data);
        return { message: 'success', data: result, error: null };
    } catch (e: any) {
        return { message: 'error', data: null, error: e.message || 'An unknown error occurred.' };
    }
}

interface ConversationalCallState {
    message: string;
    data: ConversationalCallOutput | null;
    error: string | null;
}

export async function handleConversationalCall(
    prevState: ConversationalCallState,
    formData: FormData
): Promise<ConversationalCallState> {
    const schema = z.object({
        solutionDescription: z.string(),
        leadProfile: z.string(),
        callScript: z.string(),
        conversationHistory: z.array(z.object({
            role: z.string(),
            text: z.string(),
        })),
        userResponse: z.string(),
    });

    try {
        const validated = schema.parse({
            solutionDescription: formData.get('solutionDescription'),
            leadProfile: formData.get('leadProfile'),
            callScript: formData.get('callScript'),
            conversationHistory: JSON.parse(formData.get('conversationHistory') as string),
            userResponse: formData.get('userResponse'),
        });

        const result = await conversationalCall(validated);
        return { message: 'success', data: result, error: null };

    } catch (e: any) {
         if (e instanceof z.ZodError) {
             return { message: 'error', data: null, error: e.errors.map(err => err.message).join(', ') };
         }
        return { message: 'error', data: null, error: e.message || 'An unknown error occurred.' };
    }
}
