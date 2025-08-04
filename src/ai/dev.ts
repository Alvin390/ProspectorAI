import { config } from 'dotenv';
config();

import '@/ai/flows/generate-lead-profile.ts';
import '@/ai/flows/generate-campaign-content.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/conversational-call.ts';
import '@/ai/flows/outreach-orchestrator.ts';
import '@/ai/flows/email-follow-up.ts';
import '@/ai/flows/conversational-call.schema';
import '@/ai/flows/generate-campaign-content.schema';
import '@/ai/flows/generate-lead-profile.schema';
import '@/ai/flows/text-to-speech.schema';
import '@/ai/flows/outreach-orchestrator.schema';
import '@/ai/flows/email-follow-up.schema';
