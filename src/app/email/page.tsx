
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, CheckCircle, Clock, Send, AlertCircle as BounceIcon, Eye, Inbox, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useData } from '../data-provider';
import type { Timestamp } from 'firebase/firestore';


export interface EmailLog {
  id: string;
  leadId: string;
  campaignId: string;
  subject: string;
  content: string;
  status: 'sent' | 'opened' | 'replied' | 'bounced' | 'needs-attention';
  createdAt: Timestamp;
  createdBy: string;
  sentAt: Timestamp;
  enrichment?: {
    jobTitle?: string;
    interests?: string[];
    recentNews?: string;
    linkedinUrl?: string;
  };
}


export default function EmailLogPage() {
  const { allEmailLogs, isLoading } = useData();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);

  const getStatusIcon = (status: EmailLog['status']) => {
    switch (status) {
      case 'replied':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'bounced':
        return <BounceIcon className="h-4 w-4 text-red-500" />;
      case 'opened':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-gray-500" />;
      case 'needs-attention':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  }

  const getStatusBadgeVariant = (status: EmailLog['status']): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (status) {
      case 'replied':
        return 'default';
      case 'bounced':
        return 'destructive';
      case 'opened':
        return 'secondary';
      case 'sent':
        return 'outline';
      case 'needs-attention':
        return 'default'; // Using 'default' but will be styled differently
    }
  }

  const getStatusBadgeClassName = (status: EmailLog['status']) => {
    if (status === 'needs-attention') {
        return 'bg-yellow-500 text-black hover:bg-yellow-600';
    }
    return '';
  }

  const handleViewEmail = (email: EmailLog) => {
    setSelectedEmail(email);
    setIsSheetOpen(true);
  };

  if (isLoading) {
    return <div>Loading email logs...</div>;
  }

  const sortedLogs = [...allEmailLogs].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());


  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Email Outreach Log</CardTitle>
        <CardDescription>A real-time log of all automated and manual emails sent.
        </CardDescription>
      </CardHeader>
      <CardContent>
      {sortedLogs.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.map((email) => (
              <TableRow key={email.id}>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(email.status)} className={`${getStatusBadgeClassName(email.status)} gap-1 pl-2 pr-3`}>
                    {getStatusIcon(email.status)} {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{email.subject}</TableCell>
                <TableCell>{email.leadId}</TableCell>
                <TableCell>{new Date(email.sentAt.toMillis()).toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewEmail(email)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        ) : (
          <Alert>
              <Inbox className="h-4 w-4" />
              <AlertTitle>No Email Activity Yet</AlertTitle>
              <AlertDescription>
                  Once an active campaign begins sending emails, the activity will appear here in real-time. Start a new campaign on the Campaigns page to begin.
              </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Email Details</SheetTitle>
          {selectedEmail && (
              <SheetDescription asChild>
                <div className="space-y-4 text-sm">
                  <div className="pt-4"><strong>Subject:</strong> {selectedEmail.subject}</div>
                  <div><strong>Lead:</strong> {selectedEmail.leadId}</div>
                  <div><strong>Status:</strong> {selectedEmail.status}</div>
                  <div><strong>Sent At:</strong> {new Date(selectedEmail.sentAt.toMillis()).toLocaleString()}</div>
                  {selectedEmail.enrichment?.jobTitle && <div><strong>Job Title:</strong> {selectedEmail.enrichment.jobTitle}</div>}
                  {selectedEmail.enrichment?.interests && <div><strong>Interests:</strong> {selectedEmail.enrichment.interests.join(', ')}</div>}
                  {selectedEmail.enrichment?.recentNews && <div><strong>Recent News:</strong> {selectedEmail.enrichment.recentNews}</div>}
                  {selectedEmail.enrichment?.linkedinUrl && <div><strong>LinkedIn:</strong> <Link href={selectedEmail.enrichment.linkedinUrl} target="_blank" className="text-primary underline">View Profile</Link></div>}
                  
                  <div className='pt-4'>
                    <Alert>
                        <AlertTitle className="mb-2">Email Content</AlertTitle>
                        <AlertDescription className="whitespace-pre-wrap">{selectedEmail.content}</AlertDescription>
                    </Alert>
                  </div>
                </div>
              </SheetDescription>
            )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
    </>
  );
}
