import { z } from 'genkit';

/**
 * @fileOverview Schemas and types for the lead finder AI agent.
 *
 * - FindLeadsInput - The input type for the findLeads function.
 * - FindLeadsOutput - The return type for the findLeads function.
 */

export const FindLeadsInputSchema = z.object({
    leadProfile: z.string().describe('The profile of the ideal lead, including attributes and online presence.')
});
export type FindLeadsInput = z.infer<typeof FindLeadsInputSchema>;

export const FindLeadsOutputSchema = z.object({
  potentialLeads: z.array(z.object({
    id: z.string().describe("A unique identifier for the lead, combining name and company (e.g., 'Alex Johnson-Innovate Inc.')."),
    name: z.string().describe("The full name of the contact person."),
    company: z.string().describe("The name of the company."),
    contact: z.string().describe("The contact information, either an email or a phone number.")
  })).describe("A list of 5 to 10 potential leads that perfectly match the profile."),
});
export type FindLeadsOutput = z.infer<typeof FindLeadsOutputSchema>;
