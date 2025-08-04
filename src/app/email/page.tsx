
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
import { type Solution, initialSolutions } from '@/app/solutions/data';

interface EmailLog {
  id: string;
  campaignId: string;
  campaignName: string;
  leadIdentifier: string;
  status: 'Sent' | 'Opened' | 'Replied' | 'Bounced';
  subject: string;
  timestamp: string;
}

const generateMockEmailLogs = (campaigns: Campaign[], solutions: Solution[]): EmailLog[] => {
    if (campaigns.length === 0 || solutions.length === 0) return [];
    
    const activeCampaigns = campaigns.filter(c => c.status === 'Active');
    if (activeCampaigns.length === 0) return [];

    const getSolutionName = (id: string) => solutions.find(s => s.id === id)?.name || 'Unknown Campaign';

    const logs: EmailLog[] = [];
    
    if (activeCampaigns.length > 0) {
        const campaign = activeCampaigns[0];
        logs.push(
            {
                id: 'email-1',
                campaignId: campaign.id,
                campaignName: getSolutionName(campaign.solutionId),
                leadIdentifier: 'contact@innovateinc.com',
                status: 'Replied',
                subject: 'Re: AI Discovery Tool',
                timestamp: '1 hour ago'
            },
            {
                id: 'email-2',
                campaignId: campaign.id,
                campaignName: getSolutionName(campaign.solutionId),
                leadIdentifier: 'info@synergycorp.io',
                status: 'Opened',
                subject: 'Your request for info',
                timestamp: '4 hours ago'
            },
            {
                id: 'email-4',
                campaignId: campaign.id,
                campaignName: getSolutionName(campaign.solutionId),
                leadIdentifier: 'jane.doe@techstart.co',
                status: 'Bounced',
                subject: 'Quick question',
                timestamp: '2 days ago'
            }
        );
    }
    
    if (activeCampaigns.length > 1) {
        const campaign = activeCampaigns[1];
        logs.push({
            id: 'email-3',
            campaignId: campaign.id,
            campaignName: getSolutionName(campaign.solutionId),
            leadIdentifier: 'pm@solutions.llc',
            status: 'Sent',
            subject: 'Following up',
            timestamp: 'Yesterday'
        });
    }

    return logs;
}


export default function EmailLogPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  useEffect(() => {
    const campaignsFromStorage = localStorage.getItem('campaigns');
    const loadedCampaigns = campaignsFromStorage ? JSON.parse(campaignsFromStorage) : [];
     if (Array.isArray(loadedCampaigns)) {
        setCampaigns(loadedCampaigns);
    }

    const solutionsFromStorage = localStorage.getItem('solutions');
    const loadedSolutions = solutionsFromStorage ? JSON.parse(solutionsFromStorage) : initialSolutions;
     if (Array.isArray(loadedSolutions)) {
        setSolutions(loadedSolutions);
    }

    if (loadedCampaigns.length > 0 && loadedSolutions.length > 0) {
        setEmailLogs(generateMockEmailLogs(loadedCampaigns, loadedSolutions));
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
