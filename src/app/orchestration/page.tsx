
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Mail, Phone } from 'lucide-react';
import type { OutreachOrchestratorOutput } from '@/ai/flows/outreach-orchestrator.schema';
import { useData } from '../data-provider';
import type { Campaign } from '../campaigns/page';

export default function OrchestrationPage() {
  const { campaigns, solutions, isLoading } = useData();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [orchestrationPlan, setOrchestrationPlan] = useState<OutreachOrchestratorOutput | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const activeCampaigns = campaigns.filter((c: Campaign) => c.status === 'Active');
    if (activeCampaigns.length > 0 && !selectedCampaignId) {
        const firstActiveId = activeCampaigns[0].id;
        setSelectedCampaignId(firstActiveId);
    }
  }, [isLoading, campaigns, selectedCampaignId]);
  
  useEffect(() => {
      if (selectedCampaignId) {
          showPlanForCampaign(selectedCampaignId);
      } else {
          setOrchestrationPlan(null);
      }
  }, [selectedCampaignId]);


  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return 'Unknown Campaign';
    const solution = solutions.find(s => s.id === campaign.solutionId);
    return solution ? solution.name : 'Unnamed Campaign';
  }

  const showPlanForCampaign = (campaignId: string) => {
    const storedPlan = localStorage.getItem(`orchestrationPlan_${campaignId}`);
    if (storedPlan) {
        setOrchestrationPlan(JSON.parse(storedPlan));
    } else {
        setOrchestrationPlan(null);
    }
  };
  
  const handleShowPlan = () => {
    if (!selectedCampaignId) {
        return;
    }
    showPlanForCampaign(selectedCampaignId);
  }
  
  const getActionIcon = (action: 'EMAIL' | 'CALL' | 'FOLLOW_UP' | 'DO_NOTHING') => {
    switch(action) {
        case 'EMAIL': return <Mail className="h-4 w-4 text-blue-500" />;
        case 'CALL': return <Phone className="h-4 w-4 text-green-500" />;
        default: return null;
    }
  }

  const getLeadName = (leadId: string) => {
      const parts = leadId.split('-');
      return parts[0].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  const getLeadCompany = (leadId: string) => {
      const parts = leadId.split('-');
      return parts[1] || 'Unknown Company';
  }
  
  const handleCampaignSelectionChange = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    const campaign = campaigns.find(c => c.id === campaignId);
    if(campaign?.status !== 'Active') {
        setOrchestrationPlan(null);
    }
  }

  if (isLoading) {
    return <div>Loading orchestration plans...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Orchestration Control Center</CardTitle>
        <CardDescription>
          This is your control center to monitor the AI's autonomous work. The AI runs campaigns on its own. Use this page to see the AI's high-level strategic plan. For detailed, real-time activity logs, see the Calling and Email pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="campaign-select">Select an Active Campaign to View its Plan</Label>
            <div className="flex items-center gap-2">
                <Select value={selectedCampaignId} onValueChange={handleCampaignSelectionChange}>
                    <SelectTrigger id="campaign-select" className="flex-1">
                        <SelectValue placeholder="Select an active campaign..." />
                    </SelectTrigger>
                    <SelectContent>
                        {campaigns.filter(c => c.status === 'Active').map(campaign => (
                            <SelectItem key={campaign.id} value={campaign.id}>{getCampaignName(campaign.id)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Button onClick={handleShowPlan} disabled={!selectedCampaignId}>
                    Show Plan
                </Button>
            </div>
        </div>

        {selectedCampaignId && orchestrationPlan ? (
             <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Live Strategic Plan: {getCampaignName(orchestrationPlan.campaignId)}</CardTitle>
                        <CardDescription>The AI has determined the following next steps for this campaign. This is a snapshot of the AI's current strategy.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Lead</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Next Action</TableHead>
                              <TableHead>AI Reasoning</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orchestrationPlan.outreachPlan.filter(step => step.action !== 'DO_NOTHING').map((step) => (
                              <TableRow key={step.leadId}>
                                <TableCell className="font-medium">{getLeadName(step.leadId)}</TableCell>
                                <TableCell>{getLeadCompany(step.leadId)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                       {getActionIcon(step.action)}
                                       <span>{step.action}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{step.reasoning}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                    </CardContent>
                </Card>
             </div>
        ) : (
            <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>No Plan to Display</AlertTitle>
                <AlertDescription>
                    {campaigns.filter(c => c.status === 'Active').length > 0 ? 
                        "Select an active campaign and click 'Show Plan' to see its strategy. If a plan doesn't appear, one may not have been generated yet." :
                        "There are no active campaigns. Please activate a campaign on the Campaigns page to see its orchestration plan."
                    }
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
