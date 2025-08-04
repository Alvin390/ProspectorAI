
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleGenerateLeadProfile } from '@/app/actions';
import { Terminal } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Solution } from '@/app/solutions/data';

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

interface LeadProfilingFormProps {
  solutions: Solution[];
}

export function LeadProfilingForm({ solutions }: LeadProfilingFormProps) {
  const [state, formAction] = useActionState(handleGenerateLeadProfile, initialState);
  const [description, setDescription] = useState('');

  const handleSolutionChange = (value: string) => {
    const solution = solutions.find((s) => s.name === value);
    if (solution) {
      setDescription(solution.description);
    } else {
      setDescription('');
    }
  };

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="solution">Select a Solution (Optional)</Label>
            <Select name="solution" onValueChange={handleSolutionChange}>
              <SelectTrigger id="solution">
                <SelectValue placeholder="Select a solution..." />
              </SelectTrigger>
              <SelectContent>
                {solutions.map((solution) => (
                  <SelectItem key={solution.name} value={solution.name}>
                    {solution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="or-divider">Or</Label>
            <p className="text-sm text-muted-foreground pt-2">
              Describe your ideal customer directly.
            </p>
          </div>
        </div>

        <Textarea
          name="description"
          placeholder="e.g., B2B SaaS companies in the fintech sector with annual revenue over $10M and using HubSpot..."
          rows={4}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
