'use server';

import {
  generateLeadProfile,
  type GenerateLeadProfileOutput,
} from '@/ai/flows/generate-lead-profile';
import {
  generateCampaignContent,
  type GenerateCampaignContentOutput,
} from '@/ai/flows/generate-campaign-content';
import { z } from 'zod';

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
    valueProposition: z.string().min(10, 'Value proposition is too short'),
    leadProfile: z.string().min(1, 'Please select a lead profile'),
  });

  const validated = schema.safeParse({
    valueProposition: formData.get('valueProposition'),
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
    const result = await generateCampaignContent({
        valueProposition: validated.data.valueProposition,
        leadProfile: validated.data.leadProfile
    });
    return { message: 'success', data: result, error: null };
  } catch (e: any) {
    return { message: 'error', data: null, error: e.message || 'An unknown error occurred.' };
  }
}
