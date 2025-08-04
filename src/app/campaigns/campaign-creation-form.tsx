
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
import type { Campaign } from './page';

const initialState = {
  message: '',
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? 'Generating...' : 'Generate Campaign Content'}
    </Button>
  );
}

interface CampaignCreationFormProps {
    onCampaignSubmit: (campaignData: Omit<Campaign, 'id' | 'status'>) => void;
    editingCampaign: Campaign | null;
    clearEditing: () => void;
}

export function CampaignCreationForm({ onCampaignSubmit, editingCampaign, clearEditing }: CampaignCreationFormProps) {
  const [state, formAction] = useActionState(handleGenerateCampaignContent, initialState);
  const { toast } = useToast();
  const [emailScript, setEmailScript] = useState('');
  const [callScript, setCallScript] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GenerateCampaignContentOutput | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  
  const [selectedSolution, setSelectedSolution] = useState<string>('');
  const [selectedLeadProfile, setSelectedLeadProfile] = useState<string>('');

  useEffect(() => {
    if (editingCampaign) {
      setSelectedSolution(editingCampaign.solutionName);
      setSelectedLeadProfile(editingCampaign.leadProfile);
      setEmailScript(editingCampaign.emailScript);
      setCallScript(editingCampaign.callScript);
      setGeneratedContent({ // To show the textareas
        emailScript: editingCampaign.emailScript,
        callScript: editingCampaign.callScript,
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
      // Reset form when not editing
      formRef.current?.reset();
      setGeneratedContent(null);
      setEmailScript('');
      setCallScript('');
      setSelectedSolution('');
      setSelectedLeadProfile('');
    }
  }, [editingCampaign]);


  useEffect(() => {
    if (state.data) {
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
  
  const handleSubmitCampaign = () => {
    if (!isEditing && (!selectedSolution || !selectedLeadProfile)) {
        toast({
            title: 'Missing Information',
            description: 'Please select a solution and a lead profile.',
            variant: 'destructive'
        });
        return;
    }

    onCampaignSubmit({
        solutionName: selectedSolution,
        leadProfile: selectedLeadProfile,
        emailScript,
        callScript
    });

    toast({
        title: isEditing ? "Campaign Updated!" : "Campaign Started!",
        description: isEditing ? "Your campaign has been successfully updated." : "Your outreach campaign is now running.",
    });

    // Reset form state after submission
    if (isEditing) {
      clearEditing();
    } 
    formRef.current?.reset();
    setGeneratedContent(null);
    setEmailScript('');
    setCallScript('');
    setSelectedSolution('');
    setSelectedLeadProfile('');
    setIsEditing(false);
  }

  return (
    <div className="space-y-6">
      <form ref={formRef} action={formAction} className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          // Only call the AI generation action if content hasn't been generated yet
          if (!generatedContent) {
            formAction(formData);
          }
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="solution">Solution</Label>
                <Select name="solution" required value={selectedSolution} onValueChange={setSelectedSolution} disabled={isEditing}>
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
                <Select name="leadProfile" required value={selectedLeadProfile} onValueChange={setSelectedLeadProfile} disabled={isEditing}>
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
        <div className="flex flex-col md:flex-row gap-2">
           {!isEditing && !generatedContent && <SubmitButton />}
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
          <div className="flex justify-end gap-2">
            {isEditing && <Button variant="outline" onClick={() => {
              clearEditing();
              // Also reset the form view
              setGeneratedContent(null);
            }}>Cancel</Button>}
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
