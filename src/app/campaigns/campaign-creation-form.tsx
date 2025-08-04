
'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
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
import { initialSolutions } from '@/app/solutions/data';
import type { GenerateCampaignContentOutput } from '@/ai/flows/generate-campaign-content';

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

interface CampaignCreationFormProps {
    onStartCampaign: (campaignData: {
        solutionName: string;
        leadProfile: string;
        emailScript: string;
        callScript: string;
    }) => void;
}

export function CampaignCreationForm({ onStartCampaign }: CampaignCreationFormProps) {
  const [state, formAction] = useActionState(handleGenerateCampaignContent, initialState);
  const { toast } = useToast();
  const [emailScript, setEmailScript] = useState('');
  const [callScript, setCallScript] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GenerateCampaignContentOutput | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const solutionRef = useRef<string>('');
  const leadProfileRef = useRef<string>('');


  useEffect(() => {
    if (state.data) {
      setEmailScript(state.data.emailScript);
      setCallScript(state.data.callScript);
      setGeneratedContent(state.data);
    }
    if (state.message === 'success' || state.message === 'error') {
        const formData = new FormData(formRef.current!);
        solutionRef.current = formData.get('solution') as string;
        leadProfileRef.current = formData.get('leadProfile') as string;
    }
  }, [state]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${type} script has been copied.`,
    });
  };
  
  const handleStartCampaign = () => {
    if (!solutionRef.current || !leadProfileRef.current) return;

    onStartCampaign({
        solutionName: solutionRef.current,
        leadProfile: leadProfileRef.current,
        emailScript,
        callScript
    });

    toast({
        title: "Campaign Started!",
        description: "Your outreach campaign is now running.",
    });

    // Reset form state
    formRef.current?.reset();
    setGeneratedContent(null);
    setEmailScript('');
    setCallScript('');
  }
  
  const handleFormAction = (formData: FormData) => {
      formAction(formData);
  }

  return (
    <div className="space-y-6">
      <form ref={formRef} action={handleFormAction} className="space-y-4">
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
                    <SelectItem value="Tech startups in Silicon Valley">
                    Tech startups in Silicon Valley
                    </SelectItem>
                    <SelectItem value="E-commerce businesses in Europe">
                    E-commerce businesses in Europe
                    </SelectItem>
                    <SelectItem value="Financial services companies in New York">
                    Financial services companies in New York
                    </SelectItem>
                </SelectContent>
                </Select>
            </div>
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

      {generatedContent && (
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
