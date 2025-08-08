
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
import type { Solution } from '@/app/solutions/data';
import type { GenerateCampaignContentOutput } from '@/ai/flows/generate-campaign-content.schema';
import type { Campaign } from './page';
import type { LeadProfile } from '@/app/leads/data'; // Fix import here

const initialState = {
  message: '',
  data: null,
  error: null,
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} className="w-full md:w-auto">
      {pending ? 'Generating...' : 'Generate Campaign Content'}
    </Button>
  );
}

interface CampaignCreationFormProps {
    solutions: Solution[];
    profiles: LeadProfile[]; // Fix type here
    onCampaignSubmit: (campaignData: Omit<Campaign, 'id' | 'status'>) => void;
    editingCampaign: Campaign | null;
    clearEditing: () => void;
}

export function CampaignCreationForm({ solutions, profiles, onCampaignSubmit, editingCampaign, clearEditing }: CampaignCreationFormProps) {
  const [state, formAction] = useActionState(handleGenerateCampaignContent, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedSolutionId, setSelectedSolutionId] = useState<string>('');
  const [selectedLeadProfileId, setSelectedLeadProfileId] = useState<string>('');
  const [emailScript, setEmailScript] = useState('');
  const [callScript, setCallScript] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GenerateCampaignContentOutput | null>(null);

  const isEditing = !!editingCampaign;

  useEffect(() => {
    if (editingCampaign) {
      setSelectedSolutionId(editingCampaign.solutionId);
      setSelectedLeadProfileId(editingCampaign.leadProfileId);
      setEmailScript(editingCampaign.emailScript);
      setCallScript(editingCampaign.callScript);
      setGeneratedContent({
        emailScript: editingCampaign.emailScript,
        callScript: editingCampaign.callScript,
      });
      // Clear action state to prevent re-showing old errors
      state.message = '';
    } else {
      // Reset form when not editing or when editingCampaign is cleared
      resetFormState();
    }
  }, [editingCampaign]);


  useEffect(() => {
    if (state.message === 'success' && state.data) {
      setEmailScript(state.data.emailScript);
      setCallScript(state.data.callScript);
      setGeneratedContent(state.data);
    }
    if (state.message === 'error') {
      toast({
        title: 'Error generating content',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${type} script has been copied.`,
    });
  };

  const resetFormState = () => {
    if (formRef.current) {
        formRef.current.reset();
    }
    setGeneratedContent(null);
    setEmailScript('');
    setCallScript('');
    setSelectedSolutionId('');
    setSelectedLeadProfileId('');
    state.message = ''; // Important to clear state message
    state.data = null;
    state.error = null;
    if (isEditing) {
        clearEditing();
    }
  }

  const handleSubmitCampaign = () => {
    const campaignData = {
        solutionId: selectedSolutionId,
        leadProfileId: selectedLeadProfileId,
        emailScript,
        callScript
    };

    if (!campaignData.solutionId || !campaignData.leadProfileId || !campaignData.emailScript || !campaignData.callScript) {
        toast({
            title: 'Missing Information',
            description: 'Please select a solution and lead profile, generate content, and ensure scripts are not empty.',
            variant: 'destructive'
        });
        return;
    }

    onCampaignSubmit(campaignData);

    toast({
        title: isEditing ? "Campaign Updated!" : "Campaign Started!",
        description: isEditing ? "Your campaign has been successfully updated." : "Your outreach campaign is now running.",
    });

    resetFormState();
  }

  return (
    <div className="space-y-6">
      <form action={formAction} ref={formRef} className="space-y-4">
        <input type="hidden" name="solutions" value={JSON.stringify(solutions)} />
        <input type="hidden" name="profiles" value={JSON.stringify(profiles)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="solution">Solution</Label>
                <Select name="solutionId" required value={selectedSolutionId} onValueChange={setSelectedSolutionId} disabled={!!generatedContent}>
                    <SelectTrigger id="solution">
                        <SelectValue placeholder="Select a solution" />
                    </SelectTrigger>
                    <SelectContent>
                        {solutions.map(solution => (
                            <SelectItem key={solution.id} value={solution.id}>{solution.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="lead-profile">Lead Profile</Label>
                <Select name="leadProfileId" required value={selectedLeadProfileId} onValueChange={setSelectedLeadProfileId} disabled={!!generatedContent}>
                <SelectTrigger id="lead-profile">
                    <SelectValue placeholder="Select a lead profile" />
                </SelectTrigger>
                <SelectContent>
                    {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
           {!isEditing && <SubmitButton disabled={!!generatedContent || !selectedSolutionId || !selectedLeadProfileId} />}
        </div>
      </form>

      {state.error && !generatedContent && (
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
          <div className="flex justify-end gap-2 mt-4">
            {isEditing ? (
              <Button variant="outline" onClick={clearEditing}>Cancel</Button>
            ) : (
                <Button variant="outline" onClick={resetFormState}>
                    Generate New
                </Button>
            )}
            <Button onClick={handleSubmitCampaign}>
              <Rocket className="mr-2 h-4 w-4" />
              {isEditing ? 'Update Campaign' : 'Start Campaign'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// No changes needed if DataProvider wraps the app.
