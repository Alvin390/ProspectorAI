
'use server';

/**
 * @fileOverview An AI agent for intelligently handling email follow-ups.
 * 
 * - handleEmailFollowUp - A function that analyzes an email thread and drafts a response.
 */

import { ai } from '@/ai/genkit';
import {
    EmailFollowUpInputSchema,
    type EmailFollowUpInput,
    EmailFollowUpOutputSchema,
    type EmailFollowUpOutput
} from './email-follow-up.schema';

export async function handleEmailFollowUp(input: EmailFollowUpInput): Promise<EmailFollowUpOutput> {
  return emailFollowUpFlow(input);
}

const prompt = ai.definePrompt({
    name: 'emailFollowUpPrompt',
    input: { schema: EmailFollowUpInputSchema },
    output: { schema: EmailFollowUpOutputSchema },
    prompt: `You are an expert AI sales development representative. Your goal is to book a meeting by handling email conversations intelligently.

Strictly adhere to the following instructions:
- Analyze the entire context: the solution description, the lead profile, and the full email thread. This is your knowledge base.
- **Adapt Your Tone:** Use the Lead Profile to inform your writing style. If the lead is from a formal industry (e.g., finance, law), your tone should be more professional and structured. If they are from a more casual industry (e.g., tech startups), your tone can be more relaxed but must remain professional.
- Your primary objective is to book a meeting. All your responses should guide the conversation toward this goal.
- Keep your email response professional, concise, and human-like.
- Directly address the lead's last email. If they ask questions, answer them using the provided context.
- Be adaptive. Do not use generic templates. Your reply must be tailored to the specific conversation.
- Based on your analysis, determine the most logical next action. If the lead is positive, suggest scheduling a meeting. If they are clearly not interested, mark them as such. If a simple reply is needed, generate one.

START OF CONTEXT
---
Solution Description: {{{solutionDescription}}}
---
Lead Profile: {{{leadProfile}}}
---
END OF CONTEXT

EMAIL THREAD:
{{#each emailThread}}
---
From: {{from}}
{{content}}
---
{{/each}}

Based on the full email thread and context, draft a response and recommend the next action.
`,
});


const emailFollowUpFlow = ai.defineFlow(
  {
    name: 'emailFollowUpFlow',
    inputSchema: EmailFollowUpInputSchema,
    outputSchema: EmailFollowUpOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
