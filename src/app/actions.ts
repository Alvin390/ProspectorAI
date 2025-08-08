
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
import type { LeadProfile } from './leads/data';
import type { CallLog } from './calling/page';
import type { EmailLog } from './email/page';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase/firestore';


interface LeadProfileFormState {
  message: string;
  data: GenerateLeadProfileOutput | null;
  error: string | null;
}

export async function handleGenerateLeadProfile(
  prevState: LeadProfileFormState,
  formData: FormData
): Promise<LeadProfileFormState> {
  console.log("Action: handleGenerateLeadProfile", { prevState, formData: formData.get('description') });
  const schema = z.string().min(10, 'Description is too short');
  const description = formData.get('description') as string;

  const validated = schema.safeParse(description);
  if (!validated.success) {
    const error = validated.error.errors.map((e) => e.message).join(', ');
    console.error("Validation failed for lead profile generation:", error);
    return {
      message: 'error',
      data: null,
      error: error,
    };
  }

  try {
    const result = await generateLeadProfile(validated.data);
    console.log("Action: handleGenerateLeadProfile successful.");
    return { message: 'success', data: result, error: null };
  } catch (e: any) {
    console.error("Action: handleGenerateLeadProfile failed.", e);
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
  console.log("Action: handleGenerateCampaignContent", { prevState, formData: Object.fromEntries(formData) });
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
    const profiles: LeadProfile[] = JSON.parse(validated.profiles); // Replace all references to Profile with LeadProfile

    const solution = solutions.find(s => s.id === validated.solutionId);
    if (!solution) {
      throw new Error('Selected solution not found.');
    }

    const profile = profiles.find(p => p.id === validated.leadProfileId);
     if (!profile || !profile.profileData) {
      throw new Error('Selected lead profile or its data not found.');
    }

    // Convert profileData object to a string for the AI prompt
    const leadProfileString = `Attributes: ${profile.profileData.attributes}\nOnline Presence: ${profile.profileData.onlinePresence}`;

    const result = await generateCampaignContent({
        solutionDescription: solution.description,
        leadProfile: leadProfileString
    });
    console.log("Action: handleGenerateCampaignContent successful.");
    return { message: 'success', data: result, error: null };
  } catch (e: any) {
     if (e instanceof z.ZodError) {
        const error = e.errors.map((err) => err.message).join(', ');
        console.error("Validation failed for campaign content generation:", error);
        return { message: 'error', data: null, error };
      }
    console.error("Action: handleGenerateCampaignContent failed.", e);
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
    console.log("Action: handleTextToSpeech");
    const schema = z.string().min(1, 'Script is empty');
    const script = formData.get('script') as string;

    const validated = schema.safeParse(script);
    if (!validated.success) {
        const error = validated.error.errors.map((e) => e.message).join(', ');
        console.error("Validation failed for TTS:", error);
        return {
            message: 'error',
            data: null,
            error: error,
        };
    }

    try {
        const result = await textToSpeech({
            text: validated.data,
            voice: 'en-US-Neural2-J' // Default voice
        });
        console.log("Action: handleTextToSpeech successful.");
        return { message: 'success', data: result, error: null };
    } catch (e: any) {
        console.error('Action: handleTextToSpeech failed.', e);
        return {
            message: 'error',
            data: null,
            error: e.message || 'An unknown error occurred during text-to-speech conversion.'
        };
    }
}

interface ConversationalCallState {
    message: string;
    data: ConversationalCallOutput | null;
    error: string | null;
    history: { role: 'agent' | 'lead'; text: string; audio: string; }[];
}

export async function handleConversationalCall(
  prevState: ConversationalCallState,

  formData: FormData
): Promise<ConversationalCallState> {
  try {
    console.log('Action: handleConversationalCall');

    const requiredFields = ['solutionDescription', 'leadProfile', 'callScript', 'conversationHistory'];
    const missingFields = requiredFields.filter(field => !formData.has(field));

    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      console.error("Validation failed for conversational call:", errorMsg);
      return { ...prevState, message: 'error', error: errorMsg };
    }

    let conversationHistory: Array<{ role: 'agent' | 'lead'; text: string; audio: string }>;
    try {
      const parsed = JSON.parse(formData.get('conversationHistory') as string || '[]');
      if (!Array.isArray(parsed)) throw new Error('conversationHistory must be an array');
      conversationHistory = parsed.map(item => ({
        role: item.role === 'agent' || item.role === 'lead' ? item.role : 'agent',
        text: String(item.text || ''),
        audio: item.audio ? String(item.audio) : '',
      }));
    } catch (parseError) {
      const errorMsg = 'Invalid conversation history format';
      console.error(errorMsg, parseError);
      return { ...prevState, message: 'error', error: errorMsg };
    }

    const solutionDescription = formData.get('solutionDescription') as string;
    const leadProfile = formData.get('leadProfile') as string;
    const callScript = formData.get('callScript') as string;

    if (conversationHistory.length === 0 && callScript) {
      console.log('Starting new conversation with call script');
      conversationHistory.push({ role: 'agent', text: callScript, audio: '' });
    }

    console.log('Generating next conversation turn with history length:', conversationHistory.length);

    const response = await conversationalCall({
      solutionDescription,
      leadProfile,
      callScript,
      conversationHistory: conversationHistory.map(({ role, text }) => ({ role, text })),
    });

    if (!response.agentResponseText || !response.leadResponseText) {
      throw new Error('Invalid response from conversational AI');
    }

    const newHistory = [
      ...conversationHistory,
      { role: 'agent' as const, text: response.agentResponseText, audio: response.agentResponseAudio },
      { role: 'lead' as const, text: response.leadResponseText, audio: response.leadResponseAudio },
    ];

    console.log('Action: handleConversationalCall successful.');

    return { ...prevState, message: 'success', data: response, history: newHistory, error: null };
  } catch (error: any) {
    console.error('Action: handleConversationalCall failed.', error);
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) errorMessage = error.message;
    return { ...prevState, message: 'error', error: errorMessage };
  }
}

// Helper to convert Firestore Timestamps to serializable strings
const serializeTimestamps = (obj: any): any => {
    if (obj instanceof Timestamp) {
        return obj.toDate().toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(serializeTimestamps);
    }
    if (typeof obj === 'object' && obj !== null) {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            newObj[key] = serializeTimestamps(obj[key]);
        }
        return newObj;
    }
    return obj;
};

interface OrchestratorState {
    message: string;
    data: {
        orchestrationPlan: OutreachOrchestratorOutput;
        callLogs: any[]; // Use any[] after serialization
        emailLogs: any[]; // Use any[] after serialization
    } | null;
    error: string | null;
}

export async function handleRunOrchestrator(campaign: Campaign, solutions: Solution[], profiles: LeadProfile[]): Promise<OrchestratorState> {
    console.log(`Action: handleRunOrchestrator for campaign ID: ${campaign.id}`);
    const solution = solutions.find(s => s.id === campaign.solutionId);
    if (!solution) {
        const error = 'Solution definition not found for this campaign.';
        console.error(error);
        return { message: 'error', data: null, error };
    }

    const profile = profiles.find(p => p.id === campaign.leadProfileId);
    if (!profile || !profile.profileData) {
        const error = 'Lead profile data not found for this campaign.';
        console.error(error);
        return { message: 'error', data: null, error };
    }

    const leadProfileString = `Attributes: ${profile.profileData.attributes}\nOnline Presence: ${profile.profileData.onlinePresence}`;

    try {
        const result = await runOrchestrator({
            campaignId: campaign.id,
            solutionDescription: solution.description,
            leadProfile: leadProfileString,
        });

        console.log('Orchestrator run completed. Generating mock logs...');
        const callLogs: Omit<CallLog, 'id'>[] = [];
        const emailLogs: Omit<EmailLog, 'id'>[] = [];

        // Enrich the leads with campaign content in parallel
        const contentGenerationPromises = result.outreachPlan.map(step => {
             const lead = {
                id: step.leadId,
                name: step.leadId.split('-')[0] || 'Unknown Lead',
                company: step.leadId.split('-')[1] || 'Unknown Company',
            }
            if (step.action === 'EMAIL' || step.action === 'CALL') {
                 return generateCampaignContent({
                    solutionDescription: solution.description,
                    leadProfile: `Name: ${lead.name}\nCompany: ${lead.company}\n${leadProfileString}`,
                    enrichment: step.enrichment, // Pass enrichment data
                }).then(content => ({ ...step, content }));
            }
            return Promise.resolve(step);
        });

        const stepsWithContent = await Promise.all(contentGenerationPromises);
        
        stepsWithContent.forEach((step: any, index) => {
            const lead = {
                id: step.leadId,
                name: step.leadId.split('-')[0] || 'Unknown Lead',
                company: step.leadId.split('-')[1] || 'Unknown Company',
            };

            if (step.action === 'CALL' && step.content) {
                callLogs.push({
                    leadId: lead.id,
                    campaignId: campaign.id,
                    status: 'Meeting Booked', // Mock status
                    summary: `AI summary for call to ${lead.name}. ${step.reasoning}`,
                    scheduledTime: Timestamp.now(),
                    createdAt: Timestamp.now(),
                    createdBy: campaign.id, // Using campaign ID as mock creator
                });
            } else if (step.action === 'EMAIL' && step.content) {
                emailLogs.push({
                    leadId: lead.id,
                    campaignId: campaign.id,
                    subject: step.content.emailScript.split('\n')[0].replace('Subject: ', ''),
                    content: step.content.emailScript,
                    status: 'sent', // Mock status
                    createdAt: Timestamp.now(),
                    createdBy: campaign.id, // Using campaign ID as mock creator
                    sentAt: Timestamp.now(),
                    enrichment: step.enrichment,
                });
            }
        });

        console.log(`Generated ${callLogs.length} call logs and ${emailLogs.length} email logs.`);
        
        // Add to Firestore (original objects with Timestamps)
        if (callLogs.length > 0) await addCallLogs(callLogs);
        if (emailLogs.length > 0) await addEmailLogs(emailLogs);

        // Serialize data before returning to the client
        const serializedData = {
            orchestrationPlan: result,
            callLogs: serializeTimestamps(callLogs),
            emailLogs: serializeTimestamps(emailLogs),
        };

        return { message: 'success', data: serializedData, error: null };

    } catch (e: any) {
        console.error("Action: handleRunOrchestrator failed.", e);
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
    console.log("Action: handleAIEmailFollowUp");
    try {
        const result = await handleEmailFollowUp(input);
        console.log("Action: handleAIEmailFollowUp successful.");
        return { message: 'success', data: result, error: null };
    } catch (e: any) {
        console.error("Action: handleAIEmailFollowUp failed.", e);
        return { message: 'error', data: null, error: e.message || 'An unknown error occurred.' };
    }
}

async function addDocWithUser(collectionName: string, data: any) {
  const user = auth.currentUser;
  if (!user) {
    console.error("Error: User not authenticated. Cannot add document.");
    throw new Error("User not authenticated");
  }
  return await addDoc(collection(db, collectionName), {
      ...data,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
  });
}

// Standalone server action to add enriched leads to Firestore
export async function addLeads(newLeads: Partial<LeadProfile>[]) {
  try {
    console.log(`Action: addLeads. Attempting to add ${newLeads.length} leads.`);
    const promises = newLeads.map(lead => addDocWithUser(COLLECTIONS.LEADS, {
        ...lead,
        status: 'new',
      }));
    await Promise.all(promises);
    console.log(`Action: addLeads successful. Added ${newLeads.length} leads.`);
  } catch (error) {
    console.error("Action: addLeads failed.", error);
    // We don't rethrow here to prevent the entire orchestrator from failing
    // if one lead fails to save, but we log it as a critical error.
  }
}

// Standalone server action to add call logs to Firestore
export async function addCallLogs(newLogs: Omit<CallLog, 'id'>[]) {
    if (!auth.currentUser) {
        console.error("Cannot add call logs: user is not authenticated.");
        return;
    }
    console.log(`Action: addCallLogs. Attempting to add ${newLogs.length} logs.`);
    const promises = newLogs.map(log => addDocWithUser(COLLECTIONS.CALL_LOGS, log));
    await Promise.all(promises);
    console.log(`Action: addCallLogs successful.`);
}

// Standalone server action to add email logs to Firestore
export async function addEmailLogs(newLogs: Omit<EmailLog, 'id'>[]) {
    if (!auth.currentUser) {
        console.error("Cannot add email logs: user is not authenticated.");
        return;
    }
    console.log(`Action: addEmailLogs. Attempting to add ${newLogs.length} logs.`);
    const promises = newLogs.map(log => addDocWithUser(COLLECTIONS.EMAIL_LOGS, log));
    await Promise.all(promises);
    console.log(`Action: addEmailLogs successful.`);
}
