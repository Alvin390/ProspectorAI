
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface SentEmail {
  id: string;
  leadIdentifier: string;
  subject: string;
  body: string;
  timestamp: string;
}

const initialSentEmails: SentEmail[] = [
  {
    id: 'sent-1',
    leadIdentifier: 'contact@innovateinc.com',
    subject: 'A thought about Innovate Inc.',
    body: 'Hi Alex,\n\nI came across your recent article on scaling B2B SaaS platforms and was really impressed with your insights on reducing customer acquisition costs. It sparked a thought about how teams like yours handle the initial, time-consuming phase of lead discovery.\n\nWe help companies like yours automate persona discovery to focus sales teams on the most promising leads. Is solving that initial discovery challenge on your radar right now?\n\nBest,\nProspectorAI Agent',
    timestamp: '2 hours ago',
  },
  {
    id: 'sent-2',
    leadIdentifier: 'pm@solutions.llc',
    subject: 'Re: Your inquiry',
    body: 'Hi Brenda,\n\nFollowing up on our brief chat. You mentioned your team spends a lot of time on cold calls with low success. Our AI can automate that entire process, only routing confirmed, high-interest meetings to your human team.\n\nWould exploring a new way to handle outbound calling be valuable for Solutions LLC?\n\nBest,\nProspectorAI Agent',
    timestamp: '1 day ago',
  },
   {
    id: 'sent-3',
    leadIdentifier: 'info@synergycorp.io',
    subject: 'Quick question for Synergy Corp',
    body: 'Hi Carlos,\n\nI saw Synergy Corp\'s recent portfolio expansion and it sparked a thought about how you enable your portfolio companies to build their sales pipelines efficiently.\n\nI work with ProspectorAI, and we help companies significantly reduce their sales development costs by automating outreach. I don\'t know if this is a priority for you, but would it be a bad idea to chat for a few minutes about it?\n\nBest,\nProspectorAI Agent',
    timestamp: '3 days ago',
  },
];

export default function SentEmailLogPage() {
  const [sentEmails, setSentEmails] = useState<SentEmail[]>(initialSentEmails);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);

  useEffect(() => {
    // In a real app, this data would be fetched or streamed
    setSentEmails(initialSentEmails);
  }, []);
  
  const handleViewEmail = (email: SentEmail) => {
    setSelectedEmail(email);
    setIsSheetOpen(true);
  };


  return (
    <>
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Sent Email Log</CardTitle>
          <CardDescription>
            Review the final, personalized emails sent by the AI agent for each lead.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sentEmails.map((email) => (
              <TableRow key={email.id}>
                <TableCell className="font-medium">{email.leadIdentifier}</TableCell>
                <TableCell className="text-muted-foreground">{email.subject}</TableCell>
                <TableCell className="text-muted-foreground">{email.timestamp}</TableCell>
                <TableCell className="text-right">
                   <Button variant="outline" size="sm" onClick={() => handleViewEmail(email)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Email
                   </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[640px]">
          {selectedEmail && (
            <>
                <SheetHeader>
                    <SheetTitle>{selectedEmail.subject}</SheetTitle>
                    <SheetDescription>
                        Email sent to {selectedEmail.leadIdentifier}
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="rounded-md border bg-muted p-4">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedEmail.body}</p>
                    </div>
                </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
