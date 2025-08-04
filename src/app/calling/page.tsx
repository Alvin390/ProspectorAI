
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
import { type Solution } from '@/app/solutions/data';

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

    const getSolutionName = (id: string) => solutions.find(s => s.id === id)?.name || 'Unknown Solution';

    const logs: CallLog[] = [];
    
    activeCampaigns.forEach((campaign, index) => {
        // Generate more varied and realistic logs for each active campaign
        if(index === 0) { // For the first active campaign
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
                }
            );
        }
        
        if (index === 1) { // For the second active campaign
             logs.push(
                {
                    id: `call-${campaign.id}-1`,
                    campaignId: campaign.id,
                    campaignName: getSolutionName(campaign.solutionId),
                    leadIdentifier: 'pm@solutions.llc',
                    status: 'Follow-up Required',
                    summary: 'Lead was busy, asked to call back next week.',
                    timestamp: 'Yesterday'
                },
                {
                    id: `call-${campaign.id}-2`,
                    campaignId: campaign.id,
                    campaignName: getSolutionName(campaign.solutionId),
                    leadIdentifier: 'jane.doe@techstart.co',
                    status: 'Not Interested',
                    summary: 'Reason: Budget constraints for new software this quarter.',
                    timestamp: '2 days ago'
                }
            );
        }
    });

    return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by time
}


export default function CallingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    const campaignsFromStorage = localStorage.getItem('campaigns');
    const solutionsFromStorage = localStorage.getItem('solutions');

    const loadedCampaigns = campaignsFromStorage ? JSON.parse(campaignsFromStorage) : [];
    const loadedSolutions = solutionsFromStorage ? JSON.parse(solutionsFromStorage) : [];
    
    setCampaigns(loadedCampaigns);
    setSolutions(loadedSolutions);

    setCallLogs(generateMockCallLogs(loadedCampaigns, loadedSolutions));
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
          A real-time log of all outreach calls made by the AI. This log is updated as the AI works through its campaign tasks.
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
                  <TableHead>AI Summary</TableHead>
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
                <AlertTitle>No Calling Activity Yet</AlertTitle>
                <AlertDescription>
                   Once an active campaign begins making calls, the activity will appear here in real-time. Start a new campaign on the Campaigns page to begin.
                </AlertDescription>
            </Alert>
       )}
      </CardContent>
    </Card>
  );
}
