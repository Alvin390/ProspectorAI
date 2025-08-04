
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
import type { Campaign } from '@/app/campaigns/page';

// Mock function to fetch campaigns. In a real app, this would be an API call.
const getCampaigns = (): Campaign[] => {
  // This is a placeholder. In a real app, you'd fetch this from a database or a shared state management solution.
  // For now, we'll use a simplified version of the initial campaigns.
  return [
     {
        id: "1",
        solutionName: "Q4 Fintech Outreach",
        leadProfile: "Financial services companies in New York",
        status: 'Active',
        emailScript: "Initial email script for Fintech.",
        callScript: "Initial call script for Fintech."
    },
    {
        id: "2",
        solutionName: "EU E-commerce Initiative",
        leadProfile: "E-commerce businesses in Europe",
        status: 'Paused',
        emailScript: "Initial email script for E-commerce.",
        callScript: "Initial call script for E-commerce."
    }
  ];
}


const generateMockCallLog = (campaigns: Campaign[]) => {
    const activeCampaigns = campaigns.filter(c => c.status === 'Active');
    const log: any[] = [];

    activeCampaigns.forEach(campaign => {
        // Add a few mock calls for each active campaign
        log.push(
            {
                lead: `John Doe @ Acme Inc. (${campaign.solutionName})`,
                status: 'Meeting Scheduled',
                duration: '03:45',
                reason: '-',
            },
            {
                lead: `Jane Smith @ Beta Corp. (${campaign.solutionName})`,
                status: 'Rejected',
                duration: '01:22',
                reason: 'Not interested in new tools.',
            },
            {
                lead: `Sam Wilson @ Gamma LLC (${campaign.solutionName})`,
                status: 'In Progress',
                duration: '02:10',
                reason: '-',
            }
        )
    });
     if (log.length === 0) {
        log.push({
            lead: 'No active campaigns',
            status: 'Idle',
            duration: '-',
            reason: 'Start a campaign to see call logs.',
        })
    }


    return log;
}


export default function CallingPage() {
  const [callLog, setCallLog] = useState<any[]>([]);

  useEffect(() => {
    const campaigns = getCampaigns();
    setCallLog(generateMockCallLog(campaigns));
  }, []);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Outbound Calling Automation</CardTitle>
        <CardDescription>
          Monitor your automated AI-powered call campaigns in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reason for Rejection</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {callLog.map((call, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{call.lead}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      call.status === 'Meeting Scheduled'
                        ? 'default'
                        : call.status === 'Rejected'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {call.status}
                  </Badge>
                </TableCell>
                <TableCell>{call.duration}</TableCell>
                <TableCell>{call.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
