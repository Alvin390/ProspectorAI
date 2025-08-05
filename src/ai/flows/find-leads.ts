
'use server';

/**
 * @fileOverview A lead finding AI agent that simulates searching the web.
 *
 * - findLeads - A function that generates a list of plausible leads based on a profile.
 */

import { ai } from '@/ai/genkit';
import {
    type FindLeadsInput,
    FindLeadsOutputSchema,
    type FindLeadsOutput
} from './find-leads.schema';

export async function findLeads(input: FindLeadsInput): Promise<FindLeadsOutput> {
    const prompt = `You are a sophisticated lead discovery engine, an ultra agent blending the roles of a world-class market research assistant and a proactive discovery tool. Your purpose is to synthesize ideal customer profiles from your vast training data, which includes a comprehensive index of the public web.

    Your task is to analyze the following ideal customer profile. Based on this profile, simulate a deep search for decision-makers (like VPs, Directors, CTOs) and company contact points. Think as if you are parsing 'About Us' pages, 'Contact' pages, and professional networking profiles.
    
    From your analysis, generate a list of 5-10 highly plausible potential leads. These leads should be a perfect fit for the profile.
    
    For each lead, you must provide:
    - A full name (e.g., "Alex Johnson")
    - A company name (e.g., "Innovate Inc.")
    - A unique ID combining the name and company (e.g., "Alex Johnson-Innovate Inc.")
    - Plausible contact information (a professional email address or a phone number).
    
    ---
    **Ideal Customer Profile to Analyze:**
    ${input.leadProfile}
    ---
    
    Generate the list of potential leads now.`;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: {
        schema: FindLeadsOutputSchema,
      },
    });

    return llmResponse.output!;
}
