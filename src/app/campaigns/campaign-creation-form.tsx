
'use client';

import { useActionState, useState, useEffect } from 'react';
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
import { Terminal, Copy, Rocket } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { initialSolutions } from '@/app/solutions/data';

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
  const [emailScript, setEmailScript] = useState('');
  const [callScript, setCallScript] = useState('');

  useEffect(() => {
    if (state.data) {
      setEmailScript(state.data.emailScript);
      setCallScript(state.data.callScript);
    }
  }, [state.data]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${type} script has been copied.`,
    });
  };
  
  const handleStartCampaign = () => {
    toast({
        title: "Campaign Started!",
        description: "Your outreach campaign is now running.",
    })
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="solution">Solution</Label>
                <Select name="solution" required>
                    <SelectTrigger id="solution">
                        <SelectValue placeholder="Select a solution" />
                    </SelectTrigger>
                    <SelectContent>
                        {initialSolutions.map(solution => (
                            <SelectItem key={solution.name} value={solution.name}>{solution.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
        </div>
        <div className="flex items-center space-x-2 pt-2">
            <Switch id="continuous-campaign" name="continuous" />
            <Label htmlFor="continuous-campaign">Continuous Campaign</Label>
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
        <>
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
                  onClick={() => copyToClipboard(emailScript, 'Email')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={emailScript}
                  onChange={(e) => setEmailScript(e.target.value)}
                  className="h-64 text-sm"
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
                  onClick={() => copyToClipboard(callScript, 'Call')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={callScript}
                  onChange={(e) => setCallScript(e.target.value)}
                  className="h-64 text-sm"
                />
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleStartCampaign}>
              <Rocket className="mr-2 h-4 w-4" />
              Start Campaign
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
