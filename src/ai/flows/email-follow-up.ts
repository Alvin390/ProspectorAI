
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
    prompt: `You are an expert AI sales development representative, acting as an autonomous agent. Your goal is to handle email conversations to book a meeting, without human intervention unless absolutely necessary.

**Core Instructions:**
1.  **Full Autonomy:** Your primary directive is to manage this email thread by yourself. You will generate a reply and determine the conversation's status.
2.  **Context is Everything:** Deeply analyze the solution description, the lead profile, and the *entire* email thread. Your response must be a logical continuation of the conversation.
3.  **Human-like Tone & Style:** Adapt your writing style to match the lead's tone and the context from their professional profile. Be professional, concise, and empathetic. Avoid robotic language.
4.  **Goal-Oriented Replies:** Every reply you draft should be a strategic step towards booking a meeting. Answer questions, address objections, and gracefully guide the conversation forward.
5.  **Exception Handling (Crucial):** You must escalate to a human by setting 'suggestedAction' to 'NEEDS_ATTENTION' ONLY in the following cases:
    *   The lead asks a specific, complex question that cannot be answered from the provided "Solution Description."
    *   The lead asks for something you are not authorized to do (e.g., offer a discount, discuss legal terms).
    *   The conversation's intent is ambiguous and you cannot determine the correct next step.
    *   If you escalate, 'responseEmailBody' should be empty, as a human will take over.
6.  **Determine the Outcome:**
    *   If you can reply, draft the response in 'responseEmailBody' and set 'suggestedAction' to 'REPLIED_AUTOMATICALLY'.
    *   If the lead agrees to a meeting, set 'suggestedAction' to 'MEETING_SCHEDULED' and draft a confirmation email.
    *   If the lead is clearly not interested, set 'suggestedAction' to 'MARK_AS_NOT_INTERESTED' and set 'responseEmailBody' to an empty string.

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

Based on your instructions, analyze the thread and provide the 'responseEmailBody' and the 'suggestedAction'.
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
