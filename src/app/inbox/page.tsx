
'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Inbox as InboxIcon, User, Bot, Reply, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { handleAIEmailFollowUp } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { EmailFollowUpOutput } from '@/ai/flows/email-follow-up.schema';
import { Textarea } from '@/components/ui/textarea';

interface Email {
    from: 'user' | 'lead';
    content: string;
    timestamp: string;
}

interface Thread {
    id: string;
    leadIdentifier: string;
    subject: string;
    reasonForAttention: string;
    thread: Email[];
    // Mock data for demonstration purposes
    solutionContext: string; 
    profileContext: string;
}

const attentionNeededThreads: Thread[] = [
    {
        id: 'thread-1',
        leadIdentifier: 'pm@solutions.llc',
        subject: 'Re: Your inquiry',
        reasonForAttention: 'Lead is asking for pricing details not available in the provided context.',
        thread: [
            { from: 'user', content: 'Hi Brenda,\n\nFollowing up on our brief chat...', timestamp: 'Yesterday' },
            { from: 'lead', content: 'This sounds interesting. Can you send over your pricing tiers?', timestamp: '5 minutes ago' },
        ],
        solutionContext: "Our solution, ProspectorAI, automates lead discovery and outreach to save sales teams hundreds of hours.",
        profileContext: "Brenda is a Project Manager at a mid-sized tech company. She is likely focused on team efficiency and ROI."
    },
    {
        id: 'thread-2',
        leadIdentifier: 'dev@majorcorp.com',
        subject: 'Re: Technical Question',
        reasonForAttention: 'Lead has a complex technical question about API integrations.',
        thread: [
            { from: 'user', content: 'Hi Dev Team,\n\nI saw your latest tech blog post...', timestamp: '2 days ago' },
            { from: 'user', content: 'Following up on the above.', timestamp: '1 day ago' },
            { from: 'lead', content: 'Thanks for the outreach. Does your system support streaming data ingestion via gRPC, or is it exclusively REST-based?', timestamp: '2 hours ago' },
        ],
        solutionContext: "Our solution, ProspectorAI, has a robust REST API for all standard integrations. Streaming ingestion is on the roadmap but not yet available.",
        profileContext: "This is a technical lead from a large corporation. They need precise, honest answers."
    }
];


export default function InboxPage() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [aiSuggestions, setAiSuggestions] = useState<Record<string, EmailFollowUpOutput>>({});
    
    const handleAnalyze = (item: Thread) => {
        startTransition(async () => {
            const result = await handleAIEmailFollowUp({
                solutionDescription: item.solutionContext,
                leadProfile: item.profileContext,
                emailThread: item.thread,
            });

            if (result.message === 'error') {
                toast({
                    title: 'Analysis Failed',
                    description: result.error,
                    variant: 'destructive',
                });
            } else if (result.data) {
                setAiSuggestions(prev => ({...prev, [item.id]: result.data!}));
                toast({
                    title: 'Analysis Complete',
                    description: 'The AI has suggested a next step for this conversation.'
                });
            }
        });
    }

  if (attentionNeededThreads.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Inbox</CardTitle>
                <CardDescription>
                    This is your attention queue. When the AI agent encounters a conversation it cannot handle, it will appear here for you to review and take over.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert>
                    <InboxIcon className="h-4 w-4" />
                    <AlertTitle>Your Inbox is Clear!</AlertTitle>
                    <AlertDescription>
                        The AI agent is handling all conversations autonomously. There are currently no items that require your attention.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
  }

  const getBadgeVariant = (action: EmailFollowUpOutput['suggestedAction']) => {
    switch(action) {
        case 'REPLIED_AUTOMATICALLY': return 'default';
        case 'MEETING_SCHEDULED': return 'default';
        case 'MARK_AS_NOT_INTERESTED': return 'destructive';
        case 'NEEDS_ATTENTION': return 'secondary';
        default: return 'outline';
    }
  }

  const getBadgeText = (action: EmailFollowUpOutput['suggestedAction']) => {
      switch(action) {
        case 'REPLIED_AUTOMATICALLY': return 'Reply Automatically';
        case 'MEETING_SCHEDULED': return 'Meeting Scheduled';
        case 'MARK_AS_NOT_INTERESTED': return 'Mark as Not Interested';
        case 'NEEDS_ATTENTION': return 'Needs Human Attention';
        default: return 'Unknown';
      }
  }
  
  const handleBodyChange = (threadId: string, newBody: string) => {
    setAiSuggestions(prev => {
        if (!prev[threadId]) return prev;
        return {
            ...prev,
            [threadId]: {
                ...prev[threadId],
                responseEmailBody: newBody,
            },
        };
    });
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Inbox ({attentionNeededThreads.length})</CardTitle>
            <CardDescription>
               Conversations where the AI requires your human expertise. Use the AI to analyze and draft replies, then take the final action.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {attentionNeededThreads.map(item => (
                    <AccordionItem value={item.id} key={item.id}>
                        <AccordionTrigger>
                            <div className='flex flex-col text-left'>
                                <span className='font-semibold'>{item.subject}</span>
                                <span className='text-sm text-muted-foreground'>From: {item.leadIdentifier}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 p-4 border rounded-md">
                                <div className='space-y-1'>
                                    <h4 className='font-semibold text-sm'>Reason for Escalation:</h4>
                                    <p className="text-sm text-destructive">{item.reasonForAttention}</p>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                     {item.thread.map((email, index) => (
                                         <div key={index} className="flex gap-3">
                                            <div className="flex-shrink-0">
                                                {email.from === 'user' ? <Bot className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-muted-foreground" />}
                                            </div>
                                             <div className="flex-grow">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-sm">{email.from === 'user' ? 'ProspectorAI' : item.leadIdentifier}</span>
                                                    <span className="text-xs text-muted-foreground">{email.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{email.content}</p>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                                <Separator />
                                
                                {aiSuggestions[item.id] ? (
                                    <div className='space-y-4 pt-2'>
                                        <div className="flex items-center justify-between">
                                            <h4 className='font-semibold text-sm'>AI Suggestion:</h4>
                                            <Badge variant={getBadgeVariant(aiSuggestions[item.id].suggestedAction)}>
                                                {getBadgeText(aiSuggestions[item.id].suggestedAction)}
                                            </Badge>
                                        </div>
                                        {aiSuggestions[item.id].responseEmailBody && (
                                            <Textarea
                                                value={aiSuggestions[item.id].responseEmailBody}
                                                onChange={(e) => handleBodyChange(item.id, e.target.value)}
                                                className="h-48 text-sm"
                                                placeholder="Edit the AI's response here..."
                                            />
                                        )}
                                         <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => handleAnalyze(item)} disabled={isPending}>
                                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                                Re-Analyze
                                            </Button>
                                            <Button asChild>
                                                <a href={`mailto:${item.leadIdentifier}?subject=${encodeURIComponent('Re: ' + item.subject)}&body=${encodeURIComponent(aiSuggestions[item.id].responseEmailBody)}`}>
                                                    <Reply className="mr-2 h-4 w-4" /> Accept & Reply
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-end pt-2">
                                        <Button onClick={() => handleAnalyze(item)} disabled={isPending}>
                                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Analyze with AI
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
    </Card>
  );
}
