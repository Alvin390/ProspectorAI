
'use server';

/**
 * @fileOverview The AI Outreach Orchestrator agent.
 * This agent acts as the "brain" for a campaign, deciding the sequence of actions to take.
 *
 * - runOrchestrator - A function that generates an outreach plan for a given campaign and list of leads.
 */

import { ai } from '@/ai/genkit';
import {
    OutreachOrchestratorInputSchema,
    type OutreachOrchestratorInput,
    OutreachOrchestratorOutputSchema,
} from './outreach-orchestrator.schema';
import { z } from 'zod';
import { findLeadsTool } from './find-leads';
import { addLeads } from '@/app/actions';
import { generateCampaignContent } from './generate-campaign-content';

export async function runOrchestrator(
  input: OutreachOrchestratorInput
): Promise<OutreachOrchestratorOutput> {
  console.log(`Starting orchestrator for campaign ID: ${input.campaignId}`);
  try {
    const result = await outreachOrchestratorFlow(input);
    console.log(`Orchestrator finished for campaign ID: ${input.campaignId}. Plan generated with ${result.outreachPlan.length} steps.`);
    return result;
  } catch (error) {
    console.error(`Critical error in runOrchestrator for campaign ID ${input.campaignId}:`, error);
    throw new Error('Orchestrator failed to execute.');
  }
}

const OrchestratorPromptInputSchema = z.object({
  solutionDescription: z.string(),
  leads: z.array(z.object({
    id: z.string(),
    name: z.string(),
    company: z.string(),
    contact: z.string(),
    enrichment: z.object({
        linkedin: z.string().optional(),
        jobTitle: z.string().optional(),
        interests: z.array(z.string()).optional(),
        recentNews: z.string().optional(),
    }).optional(),
  })),
});

const prompt = ai.definePrompt({
  name: 'outreachOrchestratorPrompt',
  input: { schema: OrchestratorPromptInputSchema },
  output: { schema: OutreachOrchestratorOutputSchema },
  prompt: `You are an expert AI Sales Strategist and Campaign Manager. Your primary goal is to intelligently orchestrate an outreach campaign to book meetings.

You are given a software solution and a list of highly qualified leads, complete with enrichment data. Your task is to:
1.  Analyze each lead and their enrichment data in the context of the solution.
2.  Decide on the most effective initial outreach step for each lead. You can choose between "EMAIL", "CALL", or "DO_NOTHING".
    *   Choose "EMAIL" for leads where a written, detailed first touch seems most appropriate to provide value upfront.
    *   Choose "CALL" for leads that seem like a very high-value match where a direct conversation could be impactful.
    *   Use your judgment. You do not have to contact every lead. If a lead seems like a poor fit despite being on the list, choose "DO_NOTHING".
4.  For each decision, provide a concise justification. For example, "Initial outreach via email to provide value upfront" or "Direct call is warranted due to the perfect match with the lead profile."
5.  **Crucially, you must pass the original 'enrichment' data for each lead through to the final plan.** This data is essential for the next AI agent to personalize the outreach content.
6.  Return the final structured plan detailing the chosen action and the enrichment data for each lead.

**Context:**
---
**Software Solution Description:**
{{{solutionDescription}}}
---
**List of Qualified Leads with Enrichment Data:**
{{#each leads}}
- **ID:** {{id}}
- **Name:** {{name}}
- **Company:** {{company}}
- **Contact:** {{contact}}
- **Enrichment Data:** {{json enrichment}}
{{/each}}
---

Based on all the provided context, generate the strategic outreach plan, ensuring you include the enrichment data for each step.
  `,
});

const outreachOrchestratorFlow = ai.defineFlow(
  {
    name: 'outreachOrchestratorFlow',
    inputSchema: OutreachOrchestratorInputSchema,
    outputSchema: OutreachOrchestratorOutputSchema,
  },
  async (input) => {
    console.log('Executing outreachOrchestratorFlow...');
    try {
        // 1. Find the leads first using the tool
        console.log('Step 1: Finding leads...');
        const leadsOutput = await findLeadsTool({ leadProfile: input.leadProfile });

        if (!leadsOutput || leadsOutput.potentialLeads.length === 0) {
          console.warn('No potential leads found. Ending orchestrator flow early.');
          return {
            campaignId: input.campaignId,
            outreachPlan: [],
          };
        }
        console.log(`Step 1 Complete: Found ${leadsOutput.potentialLeads.length} leads.`);
        
        // Persist enriched leads to Firestore
        console.log('Step 2: Persisting leads to database...');
        await addLeads(leadsOutput.potentialLeads);
        console.log('Step 2 Complete: Leads persisted.');

        // 3. Pass the found leads to the prompt to get the strategic plan
        console.log('Step 3: Generating strategic outreach plan...');
        const promptResult = await prompt({
            solutionDescription: input.solutionDescription,
            leads: leadsOutput.potentialLeads,
        });
        
        const output = promptResult?.output;
        if (!output) {
            throw new Error("Orchestrator prompt returned empty output.");
        }
        console.log('Step 3 Complete: Strategic plan generated.');

        // 4. Return the full plan as required by the schema
        return {
          campaignId: input.campaignId,
          outreachPlan: Array.isArray(output?.outreachPlan) ? output.outreachPlan : [],
        };
    } catch (error) {
        console.error('Error within outreachOrchestratorFlow:', error);
        throw error;
    }
  }
);
