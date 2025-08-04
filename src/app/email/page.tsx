
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
import { Mail, CheckCircle, Clock, Send, AlertCircle as BounceIcon } from 'lucide-react';
import type { Campaign } from '@/app/campaigns/page';

interface EmailLog {
  id: string;
  campaignId: string;
  campaignName: string;
  leadIdentifier: string;
  status: 'Sent' | 'Opened' | 'Replied' | 'Bounced';
  subject: string;
  timestamp: string;
}

const generateMockEmailLogs = (campaigns: Campaign[]): EmailLog[] => {
    if (campaigns.length === 0) return [];
    const activeCampaigns = campaigns.filter(c => c.status === 'Active');
    if (activeCampaigns.length === 0) return [];

    const logs: EmailLog[] = [
        {
            id: 'email-1',
            campaignId: activeCampaigns[0].id,
            campaignName: activeCampaigns[0].solutionName,
            leadIdentifier: 'contact@innovateinc.com',
            status: 'Replied',
            subject: 'Re: AI Discovery Tool',
            timestamp: '1 hour ago'
        },
        {
            id: 'email-2',
            campaignId: activeCampaigns[0].id,
            campaignName: activeCampaigns[0].solutionName,
            leadIdentifier: 'info@synergycorp.io',
            status: 'Opened',
            subject: 'Your request for info',
            timestamp: '4 hours ago'
        }
    ];

    if (activeCampaigns.length > 1) {
        logs.push({
            id: 'email-3',
            campaignId: activeCampaigns[1].id,
            campaignName: activeCampaigns[1].solutionName,
            leadIdentifier: 'pm@solutions.llc',
            status: 'Sent',
            subject: 'Following up',
            timestamp: 'Yesterday'
        });
    }
     logs.push({
        id: 'email-4',
        campaignId: activeCampaigns[0].id,
        campaignName: activeCampaigns[0].solutionName,
        leadIdentifier: 'jane.doe@techstart.co',
        status: 'Bounced',
        subject: 'Quick question',
        timestamp: '2 days ago'
    });


    return logs;
}


export default function EmailLogPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  useEffect(() => {
    const campaignsFromStorage = localStorage.getItem('campaigns');
    if (campaignsFromStorage) {
        const parsedCampaigns = JSON.parse(campaignsFromStorage);
        setCampaigns(parsedCampaigns);
        setEmailLogs(generateMockEmailLogs(parsedCampaigns));
    }
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
        return 'outline'
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Outreach Log</CardTitle>
        <CardDescription>
          An automated log of all outreach emails sent by the AI.
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
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.campaignName}</TableCell>
                    <TableCell>{log.leadIdentifier}</TableCell>
                    <TableCell className="text-muted-foreground">{log.subject}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status)} className='gap-1 pl-2 pr-3'>
                            {getStatusIcon(log.status)}
                            {log.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
       ) : (
            <Alert>
                <Mail className="h-4 w-4" />
                <AlertTitle>No Email Activity</AlertTitle>
                <AlertDescription>
                   There are no active campaigns, so no emails have been sent. Start a campaign to begin automated outreach.
                </AlertDescription>
            </Alert>
       )}
      </CardContent>
    </Card>
  );
}
