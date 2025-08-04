
'use client';

import { useState, useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Phone, Send, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { handleConversationalCall } from '@/app/actions';

import type { Campaign } from '@/app/campaigns/page';
import type { Profile } from '@/app/leads/data';
import type { Solution } from '@/app/solutions/data';
import type { OutreachOrchestratorOutput } from '@/ai/flows/outreach-orchestrator.schema';
import type { ConversationalCallOutput } from '@/ai/flows/conversational-call.schema';

interface Message {
  role: 'user' | 'model';
  text: string;
  audio?: string;
}

const initialState = {
  message: '',
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Send Response
        </>
      )}
    </Button>
  );
}

export default function LiveCallPage() {
  const [state, formAction] = useActionState(handleConversationalCall, initialState);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [orchestrationPlan, setOrchestrationPlan] = useState<OutreachOrchestratorOutput | null>(null);

  const [conversation, setConversation] = useState<Message[]>([]);
  const [currentLeadResponse, setCurrentLeadResponse] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);


  useEffect(() => {
    const savedCampaigns = localStorage.getItem('campaigns');
    const savedSolutions = localStorage.getItem('solutions');
    const savedProfiles = localStorage.getItem('profiles');

    setCampaigns(savedCampaigns ? JSON.parse(savedCampaigns) : []);
    setSolutions(savedSolutions ? JSON.parse(savedSolutions) : []);
    setProfiles(savedProfiles ? JSON.parse(savedProfiles) : []);
  }, []);

  useEffect(() => {
    if (selectedCampaignId) {
      const plan = localStorage.getItem(`orchestrationPlan_${selectedCampaignId}`);
      setOrchestrationPlan(plan ? JSON.parse(plan) : null);
      setSelectedLeadId('');
      setConversation([]);
    }
  }, [selectedCampaignId]);

  useEffect(() => {
    if (state.message === 'success' && state.data) {
        const aiResponse: ConversationalCallOutput = state.data;
        setConversation(prev => [
            ...prev,
            { role: 'model', text: aiResponse.responseText, audio: aiResponse.audioResponse }
        ]);

        if (aiResponse.audioResponse && audioRef.current) {
            audioRef.current.src = aiResponse.audioResponse;
            audioRef.current.play();
        }
    }
    // Handle error case if needed
  }, [state]);

  useEffect(() => {
    // Scroll to the bottom of the conversation
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [conversation]);


  const activeCampaigns = campaigns.filter(c => c.status === 'Active');
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const selectedSolution = selectedCampaign ? solutions.find(s => s.id === selectedCampaign.solutionId) : null;
  const selectedProfile = selectedCampaign ? profiles.find(p => p.id === selectedCampaign.leadProfileId) : null;
  
  const handleFormSubmit = (formData: FormData) => {
    const userResponse = formData.get('userResponse') as string;
    if (userResponse) {
        setConversation(prev => [...prev, { role: 'user', text: userResponse }]);
        formAction(formData);
        formRef.current?.reset();
    }
  };
  
  const leadProfileString = selectedProfile?.profileData ? `Attributes: ${selectedProfile.profileData.attributes}\nOnline Presence: ${selectedProfile.profileData.onlinePresence}` : 'Profile not available.';

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Call Setup</CardTitle>
            <CardDescription>Select a campaign and lead to start a simulated call.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-select">Active Campaign</Label>
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger id="campaign-select">
                  <SelectValue placeholder="Select a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {activeCampaigns.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {solutions.find(s => s.id === c.solutionId)?.name || 'Unnamed Campaign'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCampaignId && (
              <div className="space-y-2">
                <Label htmlFor="lead-select">Lead to Call</Label>
                <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                  <SelectTrigger id="lead-select">
                    <SelectValue placeholder="Select a lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orchestrationPlan?.outreachPlan
                      .filter(p => p.action === 'CALL')
                      .map(p => (
                      <SelectItem key={p.leadId} value={p.leadId}>{p.leadId.split('-')[0]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
        {selectedLeadId && selectedCampaign && selectedSolution && selectedProfile && (
            <Card>
                <CardHeader>
                    <CardTitle>Call Briefing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-semibold">Solution</h4>
                        <p className="text-muted-foreground">{selectedSolution.name}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold">Lead Profile</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{leadProfileString}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Initial Script</h4>
                        <p className="text-muted-foreground">{selectedCampaign.callScript}</p>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Live Call Simulation</CardTitle>
            <CardDescription>
              {selectedLeadId ? `Calling ${selectedLeadId.split('-')[0]}...` : 'Select a campaign and lead to begin.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[60vh] flex flex-col">
            {selectedLeadId ? (
                <>
                    <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
                        <div className="space-y-6">
                        {conversation.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                            <div className={`rounded-lg p-3 max-w-sm ${msg.role === 'model' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                            {msg.role === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                    <Separator className="my-4" />
                    <form action={handleFormSubmit} ref={formRef} className="flex gap-2">
                        <input type="hidden" name="solutionDescription" value={selectedSolution?.description || ''} />
                        <input type="hidden" name="leadProfile" value={leadProfileString} />
                        <input type="hidden" name="callScript" value={selectedCampaign?.callScript || ''} />
                        <input type="hidden" name="conversationHistory" value={JSON.stringify(conversation)} />
                        
                        <Input
                            name="userResponse"
                            placeholder="Type the lead's response here..."
                            autoComplete="off"
                        />
                        <SubmitButton />
                    </form>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <Phone className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">Ready to Call</h3>
                    <p className="text-muted-foreground">Please select an active campaign and a lead from the panel on the left to start the simulation.</p>
                </div>
            )}
             <audio ref={audioRef} className="hidden" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
