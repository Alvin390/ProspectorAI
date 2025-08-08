'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleGenerateLeadProfile } from '@/app/actions';
import { Terminal, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Solution } from '@/app/solutions/data';
import type { GenerateLeadProfileOutput } from '@/ai/flows/generate-lead-profile.schema';
import type { LeadProfile } from './data';

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
  onProfileSaveAction: (profileData: Partial<LeadProfile>, data: GenerateLeadProfileOutput) => void; // Rename for TS71007
  editingProfile?: LeadProfile | null; // Fix type here
  onCancelAction: () => void; // Rename for TS71007
}

export function LeadProfilingForm({ solutions, onProfileSaveAction, editingProfile, onCancelAction }: LeadProfilingFormProps) {
  const [state, formAction] = useActionState(handleGenerateLeadProfile, initialState);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [generatedData, setGeneratedData] = useState<GenerateLeadProfileOutput | null>(null);

  useEffect(() => {
    if (editingProfile) {
        setName(editingProfile.name || '');
        setDescription(editingProfile.description || '');
        setGeneratedData(editingProfile.profileData || null);
    } else {
        setName('');
        setDescription('');
        setGeneratedData(null);
    }
  }, [editingProfile]);

  useEffect(() => {
    if (state.data && state.message === 'success') {
      setGeneratedData(state.data);
      // Pre-fill the name with the AI's suggestion
      if (state.data.suggestedName) {
        setName(state.data.suggestedName);
      }
    }
  }, [state]);

  const handleSolutionChange = (solutionId: string) => {
    const solution = solutions.find((s) => s.id === solutionId);
    if (solution) {
      setDescription(solution.description);
    } else {
      setDescription('');
    }
  };

  const handleSaveClick = () => {
    if (generatedData && name && description) {
        const profileData: Partial<LeadProfile> = {
            id: editingProfile?.id,
            name: name,
            description: description,
        };
        onProfileSaveAction(profileData, generatedData);
        // Reset form after saving
        setName('');
        setDescription('');
        setGeneratedData(null);
        state.message = '';
        state.data = null;
        state.error = null;
    }
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
         <div className="space-y-2">
            <Label htmlFor="solution">Base Profile on a Solution (Optional)</Label>
            <p className="text-sm text-muted-foreground">Select a solution to pre-fill the description.</p>
            <Select name="solution" onValueChange={handleSolutionChange}>
              <SelectTrigger id="solution">
                <SelectValue placeholder="Select a solution..." />
              </SelectTrigger>
              <SelectContent>
                {solutions.map((solution) => (
                  <SelectItem key={solution.id} value={solution.id}>
                    {solution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>

        <div className='space-y-2'>
            <Label htmlFor="description">Or Describe Your Ideal Customer</Label>
            <Textarea
            name="description"
            id="description"
            placeholder="e.g., B2B SaaS companies in the fintech sector with annual revenue over $10M and using HubSpot..."
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            />
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

      {generatedData && (
         <>
            <div className='space-y-2 pt-4'>
                <Label htmlFor='profile-name'>Profile Name</Label>
                <p className="text-sm text-muted-foreground">Give this generated profile a short, memorable name. The AI has suggested one for you.</p>
                <Input
                    id="profile-name"
                    placeholder="e.g., NY FinTech Startups"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="grid gap-4 md:grid-cols-2 pt-4">
            <Card>
                <CardHeader>
                <CardTitle>Key Attributes</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                {generatedData.attributes}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>Online Presence</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                {generatedData.onlinePresence}
                </CardContent>
            </Card>
            </div>
            <div className="flex justify-end gap-2">
                {editingProfile && <Button variant="outline" onClick={onCancelAction}>Cancel</Button>}
                <Button onClick={handleSaveClick} disabled={!name}>
                    <Save className="mr-2 h-4 w-4" />
                    {editingProfile ? 'Update Profile' : 'Save New Profile'}
                </Button>
            </div>
        </>
      )}
    </div>
  );
}

// No changes needed if DataProvider wraps the app.
