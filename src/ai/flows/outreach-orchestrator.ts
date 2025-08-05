
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
import { findLeads } from './find-leads';
import { FindLeadsInputSchema, FindLeadsOutputSchema } from './find-leads.schema';
import { z } from 'zod';


export async function runOrchestrator(
  input: OutreachOrchestratorInput
): Promise<OutreachOrchestratorOutput> {
  return outreachOrchestratorFlow(input);
}

const findLeadsTool = ai.defineTool(
    {
        name: 'findLeads',
        description: 'Finds a list of potential leads based on a profile.',
        inputSchema: FindLeadsInputSchema,
        outputSchema: FindLeadsOutputSchema,
    },
    async (input) => findLeads(input)
);


const prompt = ai.definePrompt({
  name: 'outreachOrchestratorPrompt',
  input: { schema: OutreachOrchestratorInputSchema },
  output: { schema: OutreachOrchestratorOutputSchema },
  tools: [findLeadsTool],
  prompt: `You are an expert AI Sales Strategist and Campaign Manager. Your primary goal is to intelligently orchestrate an outreach campaign to book meetings.

You are given a software solution and an ideal lead profile. Your task is to:
1.  First, use the findLeads tool with the 'leadProfile' to generate a list of potential leads that match the provided profile.
2.  Once you have the list of leads, analyze each one in the context of the solution.
3.  Decide on the most effective initial outreach step for each lead. You can choose between "EMAIL", "CALL", or "DO_NOTHING".
    *   Choose "EMAIL" for leads where a written, detailed first touch seems most appropriate.
    *   Choose "CALL" for leads that seem like a very high-value match where a direct conversation could be impactful.
    *   Use your judgment. You do not have to contact every lead. If a lead seems like a poor fit despite being on the list, choose "DO_NOTHING".
4.  For each decision, provide a concise justification. For example, "Initial outreach via email to provide value upfront" or "Direct call is warranted due to the perfect match with the lead profile."
5.  Return the final structured plan detailing the chosen action for each lead. This plan will be executed by other AI agents.

**Context:**
---
**Software Solution Description:**
{{{solutionDescription}}}
---
**Ideal Lead Profile:**
{{{leadProfile}}}
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
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
