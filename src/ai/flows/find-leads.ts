
'use server';

/**
 * @fileOverview A lead finding AI agent that simulates searching the web.
 *
 * - findLeadsFlow - A function that generates a list of plausible leads based on a profile.
 */

import { ai } from '@/ai/genkit';
import {
    FindLeadsInputSchema,
    type FindLeadsInput,
    FindLeadsOutputSchema,
    type FindLeadsOutput
} from './find-leads.schema';

// This is the tool that the orchestrator will call.
// It is defined as a flow.
export const findLeadsFlow = ai.defineFlow(
  {
    name: 'findLeadsFlow',
    inputSchema: FindLeadsInputSchema,
    outputSchema: FindLeadsOutputSchema,
  },
  async (leadProfile) => {

    const prompt = `You are a world-class market research assistant. Your task is to find potential leads based on a given customer profile.

    Analyze the following lead profile, which includes key attributes and online presence details. Based on this profile, generate a list of 5-10 highly plausible potential leads.
    
    For each lead, you must provide:
    - A full name (e.g., "Alex Johnson")
    - A company name (e.g., "Innovate Inc.")
    - A unique ID combining the name and company (e.g., "Alex Johnson-Innovate Inc.")
    - Contact information (a plausible email or phone number).
    
    The leads you generate should be a perfect fit for the profile provided. Use your training data which includes a vast index of the public web to generate realistic-sounding individuals and companies.
    
    ---
    **Lead Profile to Analyze:**
    ${leadProfile}
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
);
