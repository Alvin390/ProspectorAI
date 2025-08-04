
'use client';

import { useState } from 'react';
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
import { Inbox as InboxIcon, User, Bot, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
        ]
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
        ]
    }
];


export default function InboxPage() {
    
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

  return (
    <Card>
        <CardHeader>
            <CardTitle>Inbox ({attentionNeededThreads.length})</CardTitle>
            <CardDescription>
               Conversations where the AI requires your human expertise to proceed. Please review and reply to each thread.
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
                                    <h4 className='font-semibold text-sm'>Reason for Attention:</h4>
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
                                <div className="flex justify-end">
                                    <Button asChild>
                                        <a href={`mailto:${item.leadIdentifier}?subject=${encodeURIComponent(item.subject)}`}>
                                            <Reply className="mr-2 h-4 w-4" /> Reply Manually
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
    </Card>
  );
}
