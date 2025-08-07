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
import { Mail, CheckCircle, Clock, Send, AlertCircle as BounceIcon, AlertTriangle, Inbox, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useData } from '../data-provider';

export interface EmailLog {
  id: string;
  leadId: string;
  campaignId: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced';
  sentAt?: string;
  openedAt?: string;
  replyReceivedAt?: string;
  threadId?: string;
  enrichment?: {
    jobTitle?: string;
    interests?: string[];
    recentNews?: string;
    linkedinUrl?: string;
  };
  createdAt: string;
  createdBy: string;
}

export default function EmailLogPage() {
  const { allEmailLogs, isLoading } = useData();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);

  const getStatusIcon = (status: EmailLog['status']) => {
    switch (status) {
      case 'Replied':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Bounced':
        return <BounceIcon className="h-4 w-4 text-red-500" />;
      case 'Opened':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Sent':
        return <Send className="h-4 w-4 text-gray-500" />;
      case 'Needs Attention':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  }

  const getStatusBadgeVariant = (status: EmailLog['status']) => {
    switch (status) {
      case 'Replied':
        return 'default';
      case 'Bounced':
        return 'destructive';
      case 'Opened':
        return 'secondary';
      case 'Sent':
        return 'outline';
      case 'Needs Attention':
        return 'default';
    }
  }

  const getStatusBadgeClassName = (status: EmailLog['status']) => {
    if (status === 'Needs Attention') {
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

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Email Outreach Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Interests</TableHead>
              <TableHead>Recent News</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allEmailLogs.map((email) => (
              <TableRow key={email.id}>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(email.status)} className={getStatusBadgeClassName(email.status)}>
                    {getStatusIcon(email.status)} {email.status}
                  </Badge>
                </TableCell>
                <TableCell>{email.subject}</TableCell>
                <TableCell>{email.leadId}</TableCell>
                <TableCell>{email.enrichment?.jobTitle || '-'}</TableCell>
                <TableCell>{email.enrichment?.interests?.join(', ') || '-'}</TableCell>
                <TableCell>{email.enrichment?.recentNews || '-'}</TableCell>
                <TableCell>{email.enrichment?.linkedinUrl ? <Link href={email.enrichment.linkedinUrl} target="_blank">LinkedIn</Link> : '-'}</TableCell>
                <TableCell>{email.sentAt || '-'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewEmail(email)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Email Details</SheetTitle>
          <SheetDescription>
            {selectedEmail && (
              <>
                <div><strong>Subject:</strong> {selectedEmail.subject}</div>
                <div><strong>Lead:</strong> {selectedEmail.leadId}</div>
                <div><strong>Status:</strong> {selectedEmail.status}</div>
                <div><strong>Job Title:</strong> {selectedEmail.enrichment?.jobTitle || '-'}</div>
                <div><strong>Interests:</strong> {selectedEmail.enrichment?.interests?.join(', ') || '-'}</div>
                <div><strong>Recent News:</strong> {selectedEmail.enrichment?.recentNews || '-'}</div>
                <div><strong>LinkedIn:</strong> {selectedEmail.enrichment?.linkedinUrl ? <Link href={selectedEmail.enrichment.linkedinUrl} target="_blank">LinkedIn</Link> : '-'}</div>
                <div><strong>Thread ID:</strong> {selectedEmail.threadId || '-'}</div>
                <div><strong>Sent At:</strong> {selectedEmail.sentAt || '-'}</div>
                <div><strong>Body:</strong></div>
                <Alert>
                  <AlertTitle>Email Content</AlertTitle>
                  <AlertDescription>{selectedEmail.content}</AlertDescription>
                </Alert>
              </>
            )}
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
    </>
  );
}
