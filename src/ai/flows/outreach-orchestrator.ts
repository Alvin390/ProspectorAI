
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


export async function runOrchestrator(
  input: OutreachOrchestratorInput
): Promise<OutreachOrchestratorOutput> {
  return outreachOrchestratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'outreachOrchestratorPrompt',
  input: { schema: OutreachOrchestratorInputSchema },
  output: { schema: OutreachOrchestratorOutputSchema },
  prompt: `You are an expert AI Sales Strategist and Campaign Manager. Your primary goal is to intelligently orchestrate an outreach campaign to book meetings.

You are given a software solution, a lead profile, and a list of potential leads. Your task is to analyze this information and create a strategic outreach plan.

**Instructions:**
1.  **Analyze the Solution and Profile:** Deeply understand the product's value proposition and the ideal customer's pain points.
2.  **Evaluate Each Lead:** For each lead in the provided list, decide on the most effective initial outreach step.
3.  **Choose the Action:** You can choose between "EMAIL", "CALL", or "DO_NOTHING".
    *   Choose "EMAIL" for leads where a written, detailed first touch seems most appropriate.
    *   Choose "CALL" for leads that seem like a very high-value match where a direct conversation could be impactful.
    *   Use your judgment. You do not have to contact every lead. If a lead seems like a poor fit despite being on the list, choose "DO_NOTHING".
4.  **Provide Reasoning:** For each decision, provide a concise justification. For example, "Initial outreach via email to provide value upfront" or "Direct call is warranted due to the perfect match with the lead profile."
5.  **Return the Plan:** Your final output must be a structured plan detailing the chosen action for each lead. This plan will be executed by other AI agents.

**Context:**
---
**Software Solution Description:**
{{{solutionDescription}}}
---
**Ideal Lead Profile:**
{{{leadProfile}}}
---
**Potential Leads to Analyze:**
{{#each potentialLeads}}
- ID: {{id}}, Name: {{name}}, Company: {{company}}, Contact: {{contact}}
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
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
