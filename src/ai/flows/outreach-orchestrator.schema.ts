import { z } from 'genkit';

/**
 * @fileOverview Schemas for the Outreach Orchestrator AI agent.
 *
 * - OutreachOrchestratorInput - The input type for the orchestrator flow.
 * - OutreachOrchestratorOutput - The return type for the orchestrator flow.
 */

export const OutreachOrchestratorInputSchema = z.object({
  campaignId: z.string().describe("The ID of the campaign to be orchestrated."),
  solutionDescription: z.string().describe("A detailed description of the software solution or product being offered."),
  leadProfile: z.string().describe("The generated profile of the ideal lead."),
});
export type OutreachOrchestratorInput = z.infer<typeof OutreachOrchestratorInputSchema>;


export const OutreachOrchestratorOutputSchema = z.object({
  campaignId: z.string(),
  outreachPlan: z.array(z.object({
      leadId: z.string(),
      action: z.enum(["EMAIL", "CALL", "FOLLOW_UP", "DO_NOTHING"]).describe("The next action to take for this lead."),
      reasoning: z.string().describe("A brief explanation for why this action was chosen."),
      enrichment: z.object({
        linkedin: z.string().optional(),
        jobTitle: z.string().optional(),
        interests: z.array(z.string()).optional(),
        recentNews: z.string().optional(),
    }).optional().describe("Enrichment data to be passed to the content generation step.")
  })).describe("A step-by-step plan of the actions the orchestrator has decided to take."),
});
export type OutreachOrchestratorOutput = z.infer<typeof OutreachOrchestratorOutputSchema>;
