
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
import { Phone, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { Campaign } from '@/app/campaigns/page';

interface CallLog {
  id: string;
  campaignId: string;
  campaignName: string;
  leadIdentifier: string;
  status: 'Meeting Booked' | 'Not Interested' | 'Follow-up Required';
  summary: string;
  timestamp: string;
}

const generateMockCallLogs = (campaigns: Campaign[]): CallLog[] => {
    if (campaigns.length === 0) return [];
    const activeCampaigns = campaigns.filter(c => c.status === 'Active');
    if (activeCampaigns.length === 0) return [];

    const logs: CallLog[] = [
        {
            id: 'call-1',
            campaignId: activeCampaigns[0].id,
            campaignName: activeCampaigns[0].solutionName,
            leadIdentifier: 'contact@innovateinc.com',
            status: 'Meeting Booked',
            summary: 'Lead was very interested in the AI discovery tool. Scheduled a demo for next Tuesday.',
            timestamp: '3 hours ago'
        },
        {
            id: 'call-2',
            campaignId: activeCampaigns[0].id,
            campaignName: activeCampaigns[0].solutionName,
            leadIdentifier: 'info@synergycorp.io',
            status: 'Not Interested',
            summary: 'Reason: Already using a competitor solution and satisfied with it.',
            timestamp: '5 hours ago'
        }
    ];

    if (activeCampaigns.length > 1) {
        logs.push({
            id: 'call-3',
            campaignId: activeCampaigns[1].id,
            campaignName: activeCampaigns[1].solutionName,
            leadIdentifier: 'pm@solutions.llc',
            status: 'Follow-up Required',
            summary: 'Lead was busy, asked to call back next week.',
            timestamp: 'Yesterday'
        });
    }
     logs.push({
        id: 'call-4',
        campaignId: activeCampaigns[0].id,
        campaignName: activeCampaigns[0].solutionName,
        leadIdentifier: 'jane.doe@techstart.co',
        status: 'Not Interested',
        summary: 'Reason: Budget constraints for new software this quarter.',
        timestamp: 'Yesterday'
    });


    return logs;
}


export default function CallingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    const campaignsFromStorage = localStorage.getItem('campaigns');
    if (campaignsFromStorage) {
        const parsedCampaigns = JSON.parse(campaignsFromStorage);
        setCampaigns(parsedCampaigns);
        setCallLogs(generateMockCallLogs(parsedCampaigns));
    }
  }, []);

  const getStatusIcon = (status: CallLog['status']) => {
    switch (status) {
      case 'Meeting Booked':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Not Interested':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Follow-up Required':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  }
  
  const getStatusBadgeVariant = (status: CallLog['status']) => {
    switch (status) {
      case 'Meeting Booked':
        return 'default';
      case 'Not Interested':
        return 'destructive';
      case 'Follow-up Required':
        return 'secondary';
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Outbound Calling Log</CardTitle>
        <CardDescription>
          An automated log of all outreach calls made by the AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
       {callLogs.length > 0 ? (
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.campaignName}</TableCell>
                    <TableCell>{log.leadIdentifier}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status)} className='gap-1 pl-2 pr-3'>
                            {getStatusIcon(log.status)}
                            {log.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.summary}</TableCell>
                    <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
       ) : (
            <Alert>
                <Phone className="h-4 w-4" />
                <AlertTitle>No Calling Activity</AlertTitle>
                <AlertDescription>
                   There are no active campaigns, so no calls have been made. Start a campaign to begin automated outreach.
                </AlertDescription>
            </Alert>
       )}
      </CardContent>
    </Card>
  );
}
