
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
import {
    runOrchestrator,
} from '@/ai/flows/outreach-orchestrator';
import type { OutreachOrchestratorOutput } from '@/ai/flows/outreach-orchestrator.schema';
import {
    handleEmailFollowUp
} from '@/ai/flows/email-follow-up';
import type { EmailFollowUpInput, EmailFollowUpOutput } from '@/ai/flows/email-follow-up.schema';
import { z } from 'zod';
import type { Campaign } from './campaigns/page';
import type { Solution } from './solutions/data';
import type { Profile } from './leads/data';

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
    solutionId: z.string().min(1, 'Please select a solution'),
    leadProfileId: z.string().min(1, 'Please select a lead profile'),
    solutions: z.string(),
    profiles: z.string(),
  });

  try {
    const validated = schema.parse({
      solutionId: formData.get('solutionId'),
      leadProfileId: formData.get('leadProfileId'),
      solutions: formData.get('solutions'),
      profiles: formData.get('profiles'),
    });

    const solutions: Solution[] = JSON.parse(validated.solutions);
    const profiles: Profile[] = JSON.parse(validated.profiles);
    
    const solution = solutions.find(s => s.id === validated.solutionId);
    if (!solution) {
      return { message: 'error', data: null, error: 'Selected solution not found.' };
    }

    const profile = profiles.find(p => p.id === validated.leadProfileId);
     if (!profile || !profile.profileData) {
      return { message: 'error', data: null, error: 'Selected lead profile or its data not found.' };
    }

    // Convert profileData object to a string for the AI prompt
    const leadProfileString = `Attributes: ${profile.profileData.attributes}\nOnline Presence: ${profile.profileData.onlinePresence}`;

    const result = await generateCampaignContent({
        solutionDescription: solution.description,
        leadProfile: leadProfileString
    });
    return { message: 'success', data: result, error: null };
  } catch (e: any) {
     if (e instanceof z.ZodError) {
        return {
          message: 'error',
          data: null,
          error: e.errors.map((e) => e.message).join(', '),
        };
      }
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
    history: { role: 'user' | 'model'; text: string; audio?: string; }[];
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
        userResponse: z.string().min(1, 'User response cannot be empty'),
    });

    try {
        const validated = schema.parse({
            solutionDescription: formData.get('solutionDescription'),
            leadProfile: formData.get('leadProfile'),
            callScript: formData.get('callScript'),
            conversationHistory: JSON.parse(formData.get('conversationHistory') as string),
            userResponse: formData.get('userResponse'),
        });

        const newHistory = [...validated.conversationHistory, { role: 'user', text: validated.userResponse }];

        const inputForAI: ConversationalCallInput = {
          ...validated,
          conversationHistory: newHistory,
        };
        
        const result = await conversationalCall(inputForAI);
        
        const aiResponse = { role: 'model' as const, text: result.responseText, audio: result.audioResponse };
        
        return { 
            message: 'success', 
            data: result, 
            error: null,
            history: [...newHistory, aiResponse]
        };

    } catch (e: any) {
         if (e instanceof z.ZodError) {
             return { ...prevState, message: 'error', data: null, error: e.errors.map(err => err.message).join(', ') };
         }
        return { ...prevState, message: 'error', data: null, error: e.message || 'An unknown error occurred.' };
    }
}

interface OrchestratorState {
    message: string;
    data: OutreachOrchestratorOutput | null;
    error: string | null;
}

const mockLeads = [
    { id: 'alex johnson-Innovate Inc.', name: 'Alex Johnson', company: 'Innovate Inc.', contact: 'contact@innovateinc.com' },
    { id: 'brenda smith-Solutions LLC', name: 'Brenda Smith', company: 'Solutions LLC', contact: 'pm@solutions.llc' },
    { id: 'carlos gomez-Synergy Corp', name: 'Carlos Gomez', company: 'Synergy Corp', contact: 'info@synergycorp.io' },
    { id: 'david chen-DataDriven Co.', name: 'David Chen', company: 'DataDriven Co.', contact: '+1-555-0103' },
    { id: 'emily white-Growth Partners', name: 'Emily White', company: 'Growth Partners', contact: 'emily@growth.partners' }
];

export async function handleRunOrchestrator(campaign: Campaign, solutions: Solution[], profiles: Profile[]): Promise<OrchestratorState> {
    const solution = solutions.find(s => s.id === campaign.solutionId);
    if (!solution) {
        return { message: 'error', data: null, error: 'Solution definition not found for this campaign.' };
    }

    const profile = profiles.find(p => p.id === campaign.leadProfileId);
    if (!profile || !profile.profileData) {
        return { message: 'error', data: null, error: 'Lead profile data not found for this campaign.' };
    }

    const leadProfileString = `Attributes: ${profile.profileData.attributes}\nOnline Presence: ${profile.profileData.onlinePresence}`;

    try {
        const result = await runOrchestrator({
            campaignId: campaign.id,
            solutionDescription: solution.description,
            leadProfile: leadProfileString,
            potentialLeads: mockLeads // Using mock leads for demonstration
        });
        
        console.log('Orchestrator Result:', JSON.stringify(result, null, 2));

        return { message: 'success', data: result, error: null };
    } catch (e: any) {
        return { message: 'error', data: null, error: e.message || 'An unknown error occurred while running the orchestrator.' };
    }
}

interface EmailFollowUpState {
    message: string;
    data: EmailFollowUpOutput | null;
    error: string | null;
}

export async function handleAIEmailFollowUp(
    input: EmailFollowUpInput
): Promise<EmailFollowUpState> {
    try {
        const result = await handleEmailFollowUp(input);
        return { message: 'success', data: result, error: null };
    } catch (e: any) {
        return { message: 'error', data: null, error: e.message || 'An unknown error occurred.' };
    }
}
