
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Solution } from '@/app/solutions/data';
import type { GenerateLeadProfileOutput } from '@/ai/flows/generate-lead-profile.schema';
import type { Profile } from './page';

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
  onProfileSave: (profileData: Partial<Profile>, data: GenerateLeadProfileOutput) => void;
  editingProfile?: Profile | null;
  onCancel: () => void;
}

export function LeadProfilingForm({ solutions, onProfileSave, editingProfile, onCancel }: LeadProfilingFormProps) {
  const [state, formAction] = useActionState(handleGenerateLeadProfile, initialState);
  const [description, setDescription] = useState('');
  const [generatedData, setGeneratedData] = useState<GenerateLeadProfileOutput | null>(null);

  useEffect(() => {
    if (editingProfile) {
        setDescription(editingProfile.description || '');
        setGeneratedData(editingProfile.profileData || null);
    } else {
        setDescription('');
        setGeneratedData(null);
    }
  }, [editingProfile]);

  useEffect(() => {
    if (state.data && state.message === 'success') {
      setGeneratedData(state.data);
    }
  }, [state]);

  const handleSolutionChange = (value: string) => {
    const solution = solutions.find((s) => s.name === value);
    if (solution) {
      setDescription(solution.description);
    } else {
      setDescription('');
    }
  };
  
  const handleSaveClick = () => {
    if (generatedData) {
        const profileData: Partial<Profile> = {
            id: editingProfile?.id,
            description: description,
        };
        onProfileSave(profileData, generatedData);
        // Reset form after saving
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

      {generatedData && (
         <>
            <div className="grid gap-4 md:grid-cols-2">
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
                {editingProfile && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
                <Button onClick={handleSaveClick}>
                    <Save className="mr-2 h-4 w-4" />
                    {editingProfile ? 'Update Profile' : 'Save New Profile'}
                </Button>
            </div>
        </>
      )}
    </div>
  );
}
