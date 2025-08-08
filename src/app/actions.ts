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
import type { LeadProfile } from './leads/data'; // Fix import here
import type { CallLog } from './calling/page';
import type { EmailLog } from './email/page';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

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
    const profiles: LeadProfile[] = JSON.parse(validated.profiles); // Replace all references to Profile with LeadProfile

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
        const result = await textToSpeech({
            text: validated.data,
            voice: 'en-US-Neural2-J' // Default voice
        });
        return { message: 'success', data: result, error: null };
    } catch (e: any) {
        console.error('Error in text-to-speech conversion:', e);
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
    console.log('Starting handleConversationalCall with form data:', Object.fromEntries(formData.entries()));

    // Validate required fields
    const requiredFields = ['solutionDescription', 'leadProfile', 'callScript', 'conversationHistory'];
    const missingFields = requiredFields.filter(field => !formData.has(field));

    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      console.error(errorMsg);
      return {
        ...prevState,
        message: 'error',
        error: errorMsg,
      };
    }

    // Parse and validate conversation history
    let conversationHistory: Array<{ role: 'agent' | 'lead'; text: string; audio: string }>;
    try {
      const parsed = JSON.parse(formData.get('conversationHistory') as string || '[]');
      if (!Array.isArray(parsed)) {
        throw new Error('conversationHistory must be an array');
      }

      // Validate and normalize the conversation history
      conversationHistory = parsed.map(item => {
        const role = item.role === 'agent' || item.role === 'lead' ? item.role : 'agent';
        return {
          role,
          text: String(item.text || ''),
          audio: item.audio ? String(item.audio) : '',
        };
      });
    } catch (parseError) {
      const errorMsg = 'Invalid conversation history format';
      console.error(errorMsg, parseError);
      return {
        ...prevState,
        message: 'error',
        error: errorMsg,
      };
    }

    const solutionDescription = formData.get('solutionDescription') as string;
    const leadProfile = formData.get('leadProfile') as string;
    const callScript = formData.get('callScript') as string;

    // If this is the first turn, start with the call script
    if (conversationHistory.length === 0 && callScript) {
      console.log('Starting new conversation with call script');
      conversationHistory.push({
        role: 'agent',
        text: callScript,
        audio: '', // Will be filled in after audio generation
      });
    }

    console.log('Generating next conversation turn with history length:', conversationHistory.length);

    // Generate the next turn in the conversation
    const response = await conversationalCall({
      solutionDescription,
      leadProfile,
      callScript,
      conversationHistory: conversationHistory.map(({ role, text }) => ({
        role,
        text,
      })),
    });

    // Validate the response
    if (!response.agentResponseText || !response.leadResponseText) {
      throw new Error('Invalid response from conversational AI');
    }

    // Add the agent's response to history
    const newHistory = [
      ...conversationHistory,
      {
        role: 'agent' as const,
        text: response.agentResponseText,
        audio: response.agentResponseAudio,
      },
      {
        role: 'lead' as const,
        text: response.leadResponseText,
        audio: response.leadResponseAudio,
      },
    ];

    console.log('Successfully generated conversation turn');

    return {
      ...prevState,
      message: '',
      data: response,
      history: newHistory,
      error: null,
    };
  } catch (error) {
    console.error('Error in handleConversationalCall:', error);

    // Provide more detailed error information
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific error cases
      if (error.message.includes('unexpected response')) {
        errorMessage = 'The AI returned an unexpected response format. Please try again.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      }
    }

    return {
      ...prevState,
      message: 'error',
      error: errorMessage,
    };
  }
}

interface OrchestratorState {
    message: string;
    data: {
        orchestrationPlan: OutreachOrchestratorOutput;
        callLogs: CallLog[];
        emailLogs: EmailLog[];
    } | null;
    error: string | null;
}

const callStatuses: CallLog['status'][] = ['Meeting Booked', 'Not Interested', 'Follow-up Required'];
const emailStatuses: EmailLog['status'][] = ['sent', 'opened', 'replied', 'bounced'];

export async function handleRunOrchestrator(campaign: Campaign, solutions: Solution[], profiles: LeadProfile[]): Promise<OrchestratorState> { // Replace all references to Profile with LeadProfile
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
        });

        // Generate mock logs based on the orchestration plan
        const callLogs: CallLog[] = [];
        const emailLogs: EmailLog[] = [];
        const solutionName = solution.name || 'Unknown Solution';

        // Use Promise.all to generate email content in parallel for efficiency
        const emailContentPromises = result.outreachPlan
            .filter(step => step.action === 'EMAIL')
            .map(step => {
                // We create a unique lead profile string for each lead for more personalization
                 const leadInfo = {
                    name: step.leadId.split('-')[0] || 'Unknown Lead',
                    company: step.leadId.split('-')[1] || 'Unknown Company',
                };
                const personalizedLeadProfile = `Name: ${leadInfo.name}\nCompany: ${leadInfo.company}\n${leadProfileString}`;
                return generateCampaignContent({
                    solutionDescription: solution.description,
                    leadProfile: personalizedLeadProfile
                });
            });

        const emailContents = await Promise.all(emailContentPromises);
        let emailContentIndex = 0;

        result.outreachPlan.forEach((step, index) => {
             const lead = {
                id: step.leadId,
                name: step.leadId.split('-')[0] || 'Unknown Lead',
                company: step.leadId.split('-')[1] || 'Unknown Company',
                contact: `contact@${(step.leadId.split('-')[1] || 'domain').toLowerCase().replace(/\s+/g, '')}.com`
            }

            if (step.action === 'CALL') {
                callLogs.push({
                    id: `call-${campaign.id}-${index}`,
                    leadId: lead.id,
                    campaignId: campaign.id,
                    status: 'Meeting Booked',
                    summary: `AI summary for call to ${lead.name}. ${step.reasoning}`,
                    scheduledTime: Timestamp.now(),
                    createdAt: Timestamp.now(),
                    createdBy: campaign.id
                });
            } else if (step.action === 'EMAIL') {
                 const content = emailContents[emailContentIndex++];
                 if (content) {
                    emailLogs.push({
                        id: `email-${campaign.id}-${index}`,
                        leadId: lead.id,
                        campaignId: campaign.id,
                        subject: content.emailScript.split('\n')[0].replace('Subject: ', ''),
                        content: content.emailScript,
                        status: emailStatuses[index % emailStatuses.length],
                        createdAt: Timestamp.now(),
                        createdBy: campaign.id,
                        sentAt: Timestamp.now()
                    });
                 }
            }
        });

        return {
            message: 'success',
            data: {
                orchestrationPlan: result,
                callLogs,
                emailLogs
            },
            error: null
        };

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

// No changes needed for context/provider errors.
