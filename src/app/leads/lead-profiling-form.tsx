'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleGenerateLeadProfile } from '@/app/actions';
import { Terminal } from 'lucide-react';

const initialState = {
  message: '',
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Generating...' : 'Generate Profile'}
    </Button>
  );
}

export function LeadProfilingForm() {
  const [state, formAction] = useActionState(handleGenerateLeadProfile, initialState);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <Textarea
          name="description"
          placeholder="e.g., B2B SaaS companies in the fintech sector with annual revenue over $10M and using HubSpot..."
          rows={4}
          required
        />
        <SubmitButton />
      </form>

      {state.error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Key Attributes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
              {state.data.attributes}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Online Presence</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
              {state.data.onlinePresence}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
