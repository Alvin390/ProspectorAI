
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
import { type Solution, initialSolutions } from '@/app/solutions/data';

interface CallLog {
  id: string;
  campaignId: string;
  campaignName: string;
  leadIdentifier: string;
  status: 'Meeting Booked' | 'Not Interested' | 'Follow-up Required';
  summary: string;
  timestamp: string;
}

const generateMockCallLogs = (campaigns: Campaign[], solutions: Solution[]): CallLog[] => {
    if (campaigns.length === 0 || solutions.length === 0) return [];
    
    const activeCampaigns = campaigns.filter(c => c.status === 'Active');
    if (activeCampaigns.length === 0) return [];

    const getSolutionName = (id: string) => solutions.find(s => s.id === id)?.name || 'Unknown Campaign';

    const logs: CallLog[] = [];
    
    activeCampaigns.forEach((campaign, index) => {
        if(index === 0) {
            logs.push(
                {
                    id: `call-${campaign.id}-1`,
                    campaignId: campaign.id,
                    campaignName: getSolutionName(campaign.solutionId),
                    leadIdentifier: 'contact@innovateinc.com',
                    status: 'Meeting Booked',
                    summary: 'Lead was very interested in the AI discovery tool. Scheduled a demo for next Tuesday.',
                    timestamp: '3 hours ago'
                },
                {
                    id: `call-${campaign.id}-2`,
                    campaignId: campaign.id,
                    campaignName: getSolutionName(campaign.solutionId),
                    leadIdentifier: 'info@synergycorp.io',
                    status: 'Not Interested',
                    summary: 'Reason: Already using a competitor solution and satisfied with it.',
                    timestamp: '5 hours ago'
                },
                {
                    id: `call-${campaign.id}-3`,
                    campaignId: campaign.id,
                    campaignName: getSolutionName(campaign.solutionId),
                    leadIdentifier: 'jane.doe@techstart.co',
                    status: 'Not Interested',
                    summary: 'Reason: Budget constraints for new software this quarter.',
                    timestamp: 'Yesterday'
                }
            );
        } else if (index === 1) {
             logs.push({
                id: `call-${campaign.id}-1`,
                campaignId: campaign.id,
                campaignName: getSolutionName(campaign.solutionId),
                leadIdentifier: 'pm@solutions.llc',
                status: 'Follow-up Required',
                summary: 'Lead was busy, asked to call back next week.',
                timestamp: 'Yesterday'
            });
        }
    });

    return logs;
}


export default function CallingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    // Load campaigns
    const campaignsFromStorage = localStorage.getItem('campaigns');
    const loadedCampaigns = campaignsFromStorage ? JSON.parse(campaignsFromStorage) : [];
    if (Array.isArray(loadedCampaigns)) {
        setCampaigns(loadedCampaigns);
    }
    
    // Load solutions
    const solutionsFromStorage = localStorage.getItem('solutions');
    const loadedSolutions = solutionsFromStorage ? JSON.parse(solutionsFromStorage) : initialSolutions;
     if (Array.isArray(loadedSolutions)) {
        setSolutions(loadedSolutions);
    }

    // Generate logs once both are loaded
    if(loadedCampaigns.length > 0 && loadedSolutions.length > 0) {
        setCallLogs(generateMockCallLogs(loadedCampaigns, loadedSolutions));
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
