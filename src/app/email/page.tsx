
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, CheckCircle, Clock, Send, AlertCircle as BounceIcon, AlertTriangle, Inbox } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface EmailLog {
  id: string;
  campaignId: string;
  campaignName: string;
  leadIdentifier: string;
  status: 'Sent' | 'Opened' | 'Replied' | 'Bounced' | 'Needs Attention';
  subject: string;
  timestamp: string;
}

export default function EmailLogPage() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  useEffect(() => {
    const allEmailLogs = JSON.parse(localStorage.getItem('allEmailLogs') || '[]');
    setEmailLogs(allEmailLogs);

    const handleStorageChange = () => {
        const updatedLogs = JSON.parse(localStorage.getItem('allEmailLogs') || '[]');
        setEmailLogs(updatedLogs);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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


  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Outreach Log</CardTitle>
        <CardDescription>
         A real-time log of all outreach emails sent by the AI. This log is updated as the AI works through its campaign tasks. Items needing your attention are highlighted.
        </CardDescription>
      </CardHeader>
      <CardContent>
       {emailLogs.length > 0 ? (
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Lead</TableHead>
                   <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLogs.sort((a,b) => parseInt(a.timestamp) - parseInt(b.timestamp)).map((log) => (
                  <TableRow key={log.id} className={log.status === 'Needs Attention' ? 'bg-yellow-500/10' : ''}>
                    <TableCell className="font-medium">{log.campaignName}</TableCell>
                    <TableCell>{log.leadIdentifier}</TableCell>
                    <TableCell className="text-muted-foreground">{log.subject}</TableCell>
                    <TableCell>
                        <Badge 
                            variant={getStatusBadgeVariant(log.status)} 
                            className={`gap-1 pl-2 pr-3 ${getStatusBadgeClassName(log.status)}`}
                        >
                            {getStatusIcon(log.status)}
                            {log.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {log.status === 'Needs Attention' && (
                            <Button asChild variant="outline" size="sm">
                                <Link href="/inbox"><Inbox className="mr-2 h-4 w-4" /> Go to Inbox</Link>
                            </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
       ) : (
            <Alert>
                <Mail className="h-4 w-4" />
                <AlertTitle>No Email Activity Yet</AlertTitle>
                <AlertDescription>
                  Once an active campaign begins sending emails, the activity will appear here in real-time. Start a new campaign on the Campaigns page to begin.
                </AlertDescription>
            </Alert>
       )}
      </CardContent>
    </Card>
  );
}
