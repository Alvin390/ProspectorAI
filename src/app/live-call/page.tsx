
'use client';

import { useState, useEffect, useRef, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Phone, Loader2, PlayCircle, PhoneOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { handleConversationalCall } from '@/app/actions';
import { useData } from '../data-provider';


const initialState = {
    message: '',
    data: null,
    error: null,
    history: [],
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Thinking...
        </>
      ) : (
        <>
          <PlayCircle className="mr-2 h-4 w-4" />
          Continue Conversation
        </>
      )}
    </Button>
  );
}

export default function LiveCallPage() {
  const { campaigns, solutions, profiles, isLoading } = useData();
  const [isPending, startTransition] = useTransition();
  
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [orchestrationPlan, setOrchestrationPlan] = useState<any | null>(null);
  
  const [state, formAction] = useActionState(handleConversationalCall, initialState);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isCallFinished, setIsCallFinished] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);


  useEffect(() => {
    if (selectedCampaignId) {
      const plan = localStorage.getItem(`orchestrationPlan_${selectedCampaignId}`);
      setOrchestrationPlan(plan ? JSON.parse(plan) : null);
      setSelectedLeadId('');
      state.history = []; 
      state.error = null;
      setIsCallFinished(false);
      setCurrentTurn(0);
    }
  }, [selectedCampaignId]);
  
  useEffect(() => {
    // This is the core audio playback logic
    if (state.message === 'success' && state.history.length > 0 && audioRef.current) {
        
        if (state.data?.isHangUp) {
            setIsCallFinished(true);
        }

        const playTurn = (turnIndex: number) => {
             if (turnIndex >= state.history.length) {
                // We've played all available audio, ready for the user to continue
                return;
             }
             const turn = state.history[turnIndex];
             if (turn.audio && audioRef.current) {
                audioRef.current.src = turn.audio;
                audioRef.current.play();
                audioRef.current.onended = () => {
                    playTurn(turnIndex + 1); // Play the next person's audio
                };
             } else {
                 playTurn(turnIndex + 1); // Skip if no audio
             }
        }
        
        // Start playing from the first new turn
        playTurn(currentTurn);
        setCurrentTurn(state.history.length);
    }
  }, [state.history]);


  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [state.history, isCallFinished]);


  const activeCampaigns = campaigns.filter(c => c.status === 'Active');
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const selectedSolution = selectedCampaign ? solutions.find(s => s.id === selectedCampaign.solutionId) : null;
  const selectedProfile = selectedCampaign ? profiles.find(p => p.id === selectedCampaign.leadProfileId) : null;
  const leadProfileString = selectedProfile?.profileData ? `Attributes: ${selectedProfile.profileData.attributes}\nOnline Presence: ${selectedProfile.profileData.onlinePresence}` : 'Profile not available.';

  if (isLoading) {
    return <div>Loading live call simulator...</div>
  }

  const handleFormAction = (formData: FormData) => {
    startTransition(() => {
        formAction(formData);
    })
  }

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
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId} disabled={isPending}>
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
                <Select value={selectedLeadId} onValueChange={setSelectedLeadId} disabled={isPending}>
                  <SelectTrigger id="lead-select">
                    <SelectValue placeholder="Select a lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orchestrationPlan?.outreachPlan
                      .filter((p: any) => p.action === 'CALL')
                      .map((p: any) => (
                      <SelectItem key={p.leadId} value={p.leadId}>{p.leadId.split('-')[0]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
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
                        {state.history.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'lead' ? 'justify-end' : ''}`}>
                                {msg.role === 'agent' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                                <div className={`rounded-lg p-3 max-w-sm ${msg.role === 'agent' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                                    <p className="text-sm font-semibold">{msg.role === 'agent' ? 'Sales Agent' : 'Lead'}</p>
                                    <p className="text-sm mt-1">{msg.text}</p>
                                </div>
                                {msg.role === 'lead' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                            </div>
                        ))}
                        {isCallFinished && (
                             <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-6">
                                <PhoneOff className="h-8 w-8 mb-2" />
                                <p className="font-semibold">Call Ended</p>
                                <p className="text-sm">The lead has ended the call.</p>
                            </div>
                        )}
                        </div>
                         {state.error && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}
                    </ScrollArea>
                    <Separator className="my-4" />
                    <form action={handleFormAction} ref={formRef} className="flex gap-2">
                        <input type="hidden" name="solutionDescription" value={selectedSolution?.description || ''} />
                        <input type="hidden" name="leadProfile" value={leadProfileString} />
                        <input type="hidden" name="callScript" value={selectedCampaign?.callScript || ''} />
                        <input type="hidden" name="conversationHistory" value={JSON.stringify(state.history)} />
                        
                        <SubmitButton disabled={isCallFinished || isPending} />
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
