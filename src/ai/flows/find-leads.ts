
'use server';

/**
 * @fileOverview A lead finding AI agent that simulates searching the web.
 *
 * - findLeads - A function that generates a list of plausible leads based on a profile.
 */

import { ai } from '@/ai/genkit';
import { FindLeadsInput, FindLeadsInputSchema, FindLeadsOutputSchema } from './find-leads.schema';

export const findLeadsTool = ai.defineTool(
    {
        name: 'findLeads',
        description: `This tool finds potential leads based on a provided customer profile. It simulates a deep search of the public web, professional networks, and company contact pages to generate a list of 5-10 highly plausible decision-makers who are a perfect fit for the profile.`,
        inputSchema: FindLeadsInputSchema,
        outputSchema: FindLeadsOutputSchema,
    },
    async (input) => {
        console.log('Executing findLeadsTool with profile:', input.leadProfile);
        const prompt = `You are a sophisticated lead discovery engine. Your purpose is to synthesize ideal customer profiles from your vast training data, which includes a comprehensive index of the public web.

        Your task is to analyze the following ideal customer profile. Based on this profile, simulate a deep search for decision-makers (like VPs, Directors, CTOs) and company contact points. Think as if you are parsing 'About Us' pages, 'Contact' pages, and professional networking profiles.
        
        From your analysis, generate a list of 5-10 highly plausible potential leads. These leads should be a perfect fit for the profile.
        
        For each lead, you must provide:
        - A full name (e.g., "Alex Johnson")
        - A company name (e.g., "Innovate Inc.")
        - A unique ID combining the name and company (e.g., "Alex Johnson-Innovate Inc.")
        - Plausible contact information (a professional email address or a phone number).
        - **Crucially, generate plausible "enrichment" data for each lead. This is the most important part. Simulate finding specific details like their job title, a link to a fictional LinkedIn profile, recent company news (e.g., "Innovate Inc. just launched a new product"), and professional interests (e.g., "AI in FinTech"). This data is critical for personalizing outreach.**
        
        ---
        **Ideal Customer Profile to Analyze:**
        ${input.leadProfile}
        ---
        
        Generate the list of potential leads with detailed enrichment data now.`;

        try {
            const llmResponse = await ai.generate({
                prompt: prompt,
                output: {
                    schema: FindLeadsOutputSchema,
                },
            });

            if (!llmResponse.output) {
                console.error('findLeadsTool LLM response was empty.');
                throw new Error('Failed to generate leads from LLM.');
            }
            console.log(`findLeadsTool successful, found ${llmResponse.output.potentialLeads.length} potential leads.`);
            return llmResponse.output;
        } catch (error) {
            console.error('Error in findLeadsTool LLM call:', error);
            throw error; // Re-throw to be handled by the orchestrator
        }
    }
);

export async function findLeads(input: FindLeadsInput) {
    console.log('Initiating real lead search for profile:', input.leadProfile);
    try {
        // In a real app, this would hit an external API. For now, we hit our own API route.
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/find-leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leadProfile: input.leadProfile }),
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error('Failed to fetch leads from API. Status:', res.status, 'Body:', errorBody);
            throw new Error(`Failed to fetch leads. Status: ${res.status}`);
        }

        const data = await res.json();
        if (data.error || !data.potentialLeads) {
            console.error('API returned an error while finding leads:', data.error || 'Unknown API error');
            throw new Error(data.error || 'Failed to fetch leads from API');
        }

        console.log(`Successfully found ${data.potentialLeads.length} leads via API.`);
        return data;
    } catch (error) {
        console.error('Critical error in findLeads function:', error);
        throw error;
    }
}
