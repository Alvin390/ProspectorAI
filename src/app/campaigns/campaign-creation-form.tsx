'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleGenerateCampaignContent } from '@/app/actions';
import { Terminal, Copy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Generating...' : 'Generate Campaign Content'}
    </Button>
  );
}

export function CampaignCreationForm() {
  const [state, formAction] = useActionState(handleGenerateCampaignContent, initialState);
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${type} script has been copied.`,
    });
  };

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="value-proposition">Your Value Proposition</Label>
          <Textarea
            id="value-proposition"
            name="valueProposition"
            placeholder="e.g., We help companies increase their sales by 20% in the first quarter through our automated outreach platform..."
            rows={3}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-profile">Lead Profile</Label>
          <Select name="leadProfile" required>
            <SelectTrigger id="lead-profile">
              <SelectValue placeholder="Select a lead profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile-1">
                Tech startups in Silicon Valley
              </SelectItem>
              <SelectItem value="profile-2">
                E-commerce businesses in Europe
              </SelectItem>
              <SelectItem value="profile-3">
                Financial services companies in New York
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Script</CardTitle>
                <CardDescription>A personalized email for your campaign.</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(state.data!.emailScript, 'Email')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                value={state.data.emailScript}
                className="h-64 text-sm text-muted-foreground"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Call Script</CardTitle>
                <CardDescription>A concise script for AI-powered calls.</CardDescription>
              </div>
               <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(state.data!.callScript, 'Call')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                value={state.data.callScript}
                className="h-64 text-sm text-muted-foreground"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
