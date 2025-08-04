
'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Phone, Send, User, Bot } from 'lucide-react';
import type { Campaign } from '@/app/campaigns/page';
import { handleConversationalCall } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { initialSolutions } from '@/app/solutions/data';

interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
}

const initialCallState = {
  message: '',
  data: null,
  error: null,
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} size="icon">
      {pending ? (
        <Bot className="animate-spin h-5 w-5" />
      ) : (
        <Send className="h-5 w-5" />
      )}
    </Button>
  );
}

export default function CallingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCall, setActiveCall] = useState<Campaign | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [userResponse, setUserResponse] = useState('');
  const [callState, formAction, isPending] = useActionState(handleConversationalCall, initialCallState);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const campaignsFromStorage = localStorage.getItem('campaigns');
    if (campaignsFromStorage) {
      setCampaigns(JSON.parse(campaignsFromStorage));
    }
  }, []);
  
  useEffect(() => {
    if (callState.message === 'error') {
      toast({
        title: 'Error during call',
        description: callState.error,
        variant: 'destructive',
      });
    }
    if (callState.data) {
      setConversation(prev => [...prev, { role: 'model', text: callState.data.responseText }]);
      if (audioRef.current && callState.data.audioResponse) {
        audioRef.current.src = callState.data.audioResponse;
        audioRef.current.play();
      }
    }
  }, [callState, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [conversation])

  const handleStartCall = (campaign: Campaign) => {
    setActiveCall(campaign);
    setConversation([{ role: 'model', text: "Hello! I'm calling from ProspectorAI..." }]); // Initial greeting
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setConversation([]);
  };

  const submitResponse = (formData: FormData) => {
     if (!userResponse.trim()) return;

     setConversation(prev => [...prev, { role: 'user', text: userResponse }]);
     
     const solution = initialSolutions.find(s => s.name === activeCall!.solutionName);

     formData.set('solutionDescription', solution?.description || '');
     formData.set('leadProfile', activeCall!.leadProfile);
     formData.set('callScript', activeCall!.callScript);
     formData.set('conversationHistory', JSON.stringify(conversation));
     formData.set('userResponse', userResponse);

     formAction(formData);
     setUserResponse('');
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'Active');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outbound Calling Automation</CardTitle>
        <CardDescription>
          {activeCall 
            ? `On a call for: ${activeCall.solutionName}`
            : 'Select an active campaign to start a simulated call.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeCall ? (
          <div className="flex flex-col h-[60vh]">
            <ScrollArea className="flex-grow p-4 border rounded-lg" ref={scrollAreaRef}>
              <div className="space-y-4">
                {conversation.map((turn, index) => (
                  <div key={index} className={`flex items-start gap-3 ${turn.role === 'user' ? 'justify-end' : ''}`}>
                    {turn.role === 'model' && (
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </span>
                    )}
                    <div className={`rounded-lg px-4 py-2 max-w-[75%] ${turn.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                      <p className="text-sm">{turn.text}</p>
                    </div>
                     {turn.role === 'user' && (
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
                        <User className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
             <audio ref={audioRef} className="w-full mt-4" controls />
             <form action={submitResponse} className="mt-4 flex items-center gap-2">
                <Input
                    name="userResponse"
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Type the lead's response here..."
                    disabled={isPending}
                />
                <SubmitButton disabled={!userResponse.trim()} />
            </form>
          </div>
        ) : (
          <div>
            {activeCampaigns.length > 0 ? (
                <div className="space-y-2">
                    {activeCampaigns.map(campaign => (
                        <div key={campaign.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <div>
                                <h3 className="font-semibold">{campaign.solutionName}</h3>
                                <p className="text-sm text-muted-foreground">{campaign.leadProfile}</p>
                            </div>
                            <Button onClick={() => handleStartCall(campaign)}><Phone className="mr-2 h-4 w-4"/> Start Call</Button>
                        </div>
                    ))}
                </div>
            ) : (
                 <Alert>
                    <Phone className="h-4 w-4" />
                    <AlertTitle>No Active Campaigns</AlertTitle>
                    <AlertDescription>
                        You don't have any active campaigns. Go to the Campaigns page to start one.
                    </AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </CardContent>
      {activeCall && (
        <CardFooter className="flex justify-end">
          <Button variant="destructive" onClick={handleEndCall}>End Call</Button>
        </CardFooter>
      )}
    </Card>
  );
}
