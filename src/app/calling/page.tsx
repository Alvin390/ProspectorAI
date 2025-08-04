
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

// Mock function to fetch campaigns. In a real app, this would be an API call or come from shared state.
const getCampaigns = (): Campaign[] => {
  // We'll use a simplified version of the initial campaigns for now.
  // In a real application, this would likely come from a global state manager (like Context or Zustand)
  // or be fetched from a database.
  const campaignsFromStorage = typeof window !== 'undefined' ? localStorage.getItem('campaigns') : null;
  if (campaignsFromStorage) {
    return JSON.parse(campaignsFromStorage);
  }
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
    const leadNames = ["Alex Rivera @ Innovate Inc.", "Samantha Bee @ DataCorp", "Michael Chen @ QuantumLeap"];
    const rejectionReasons = ["Not interested.", "Already have a solution.", "No budget right now."];

    activeCampaigns.forEach(campaign => {
        // Add a few mock calls for each active campaign
        for(let i=0; i < 3; i++) {
             const statusOptions = ['Meeting Scheduled', 'Rejected', 'In Progress', 'Voicemail Left'];
             const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
             log.push({
                lead: `${leadNames[i]} (${campaign.solutionName})`,
                status: randomStatus,
                duration: `0${Math.floor(Math.random() * 5)}:${String(Math.floor(Math.random()*60)).padStart(2, '0')}`,
                reason: randomStatus === 'Rejected' ? rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)] : '-',
            });
        }
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
    // This effect runs on the client and will fetch the latest campaigns
    const campaigns = getCampaigns();
    setCallLog(generateMockCallLog(campaigns));

    // Optional: Listen for storage changes to update in near real-time
    const handleStorageChange = () => {
        const updatedCampaigns = getCampaigns();
        setCallLog(generateMockCallLog(updatedCampaigns));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
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
