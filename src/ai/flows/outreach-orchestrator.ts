
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
    type OutreachOrchestratorOutput
} from './outreach-orchestrator.schema';
import { z } from 'zod';
import { findLeadsTool } from './find-leads';
import { addLeads } from '@/app/data-provider';
import { generateCampaignContent } from './generate-campaign-content';

export async function runOrchestrator(
  input: OutreachOrchestratorInput
): Promise<OutreachOrchestratorOutput> {
  return outreachOrchestratorFlow(input);
}

const OrchestratorPromptInputSchema = z.object({
  solutionDescription: z.string(),
  leads: z.array(z.object({
    id: z.string(),
    name: z.string(),
    company: z.string(),
    contact: z.string(),
  })),
});

const prompt = ai.definePrompt({
  name: 'outreachOrchestratorPrompt',
  input: { schema: OrchestratorPromptInputSchema },
  output: { schema: OutreachOrchestratorOutputSchema },
  prompt: `You are an expert AI Sales Strategist and Campaign Manager. Your primary goal is to intelligently orchestrate an outreach campaign to book meetings.

You are given a software solution and a list of highly qualified leads. Your task is to:
1.  Analyze each lead in the context of the solution.
2.  Decide on the most effective initial outreach step for each lead. You can choose between "EMAIL", "CALL", or "DO_NOTHING".
    *   Choose "EMAIL" for leads where a written, detailed first touch seems most appropriate to provide value upfront.
    *   Choose "CALL" for leads that seem like a very high-value match where a direct conversation could be impactful.
    *   Use your judgment. You do not have to contact every lead. If a lead seems like a poor fit despite being on the list, choose "DO_NOTHING".
4.  For each decision, provide a concise justification. For example, "Initial outreach via email to provide value upfront" or "Direct call is warranted due to the perfect match with the lead profile."
5.  Return the final structured plan detailing the chosen action for each lead. This plan will be executed by other AI agents.

**Context:**
---
**Software Solution Description:**
{{{solutionDescription}}}
---
**List of Qualified Leads:**
{{#each leads}}
- **ID:** {{id}}
- **Name:** {{name}}
- **Company:** {{company}}
- **Contact:** {{contact}}
{{/each}}
---

Based on all the provided context, generate the strategic outreach plan.
  `,
});

const outreachOrchestratorFlow = ai.defineFlow(
  {
    name: 'outreachOrchestratorFlow',
    inputSchema: OutreachOrchestratorInputSchema,
    outputSchema: OutreachOrchestratorOutputSchema,
  },
  async (input) => {
    // 1. Find the leads first using the tool
    const leadsOutput = await findLeadsTool({ leadProfile: input.leadProfile });

    if (!leadsOutput || leadsOutput.potentialLeads.length === 0) {
      // If no leads are found, return an empty plan
      return {
        campaignId: input.campaignId,
        outreachPlan: [],
      };
    }
    // Persist enriched leads to Firestore
    await addLeads(leadsOutput.potentialLeads);
    // 2. Generate general scripts for campaign review (solution + lead profile only)
    await generateCampaignContent({
        solutionDescription: input.solutionDescription,
        leadProfile: input.leadProfile,
    });
    // 3. Pass the found leads to the prompt to get the strategic plan
    const promptResult = await prompt({
        solutionDescription: input.solutionDescription,
        leads: leadsOutput.potentialLeads,
    });
    const output = promptResult?.output;
    // 4. For each lead in the outreach plan, if action is EMAIL, generate and collect hyperpersonalized email (handled outside this flow)
    // 5. Return only the fields required by the schema
    return {
      campaignId: input.campaignId,
      outreachPlan: Array.isArray(output?.outreachPlan) ? output.outreachPlan : [],
    };
  }
);
