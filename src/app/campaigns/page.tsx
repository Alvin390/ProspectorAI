
'use client';

import { useState, useEffect, useTransition } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CampaignCreationForm } from './campaign-creation-form';
import { handleRunOrchestrator } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { type Solution, initialSolutions } from '@/app/solutions/data';

export interface Campaign {
  id: string;
  solutionName: string;
  leadProfile: string;
  emailScript: string;
  callScript: string;
  status: 'Active' | 'Paused';
}

const initialCampaigns: Campaign[] = [
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
]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    if (typeof window !== 'undefined') {
        const savedCampaigns = localStorage.getItem('campaigns');
        if (savedCampaigns) {
            try {
                const parsed = JSON.parse(savedCampaigns);
                return Array.isArray(parsed) ? parsed : initialCampaigns;
            } catch {
                return initialCampaigns;
            }
        }
    }
    return initialCampaigns;
  });
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [activeTab, setActiveTab] = useState('tracker');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedSolutions = localStorage.getItem('solutions');
        if (savedSolutions) {
            try {
                const parsed = JSON.parse(savedSolutions);
                setSolutions(Array.isArray(parsed) ? parsed : initialSolutions);
            } catch {
                setSolutions(initialSolutions);
            }
        } else {
            setSolutions(initialSolutions);
        }
    }
  }, []);

  const handleCampaignSubmit = (
    campaignData: Omit<Campaign, 'id' | 'status'>
  ) => {
    if (editingCampaign) {
      // Update existing campaign
      setCampaigns(campaigns.map(c => 
        c.id === editingCampaign.id 
          ? { ...editingCampaign, ...campaignData } 
          : c
      ));
      setEditingCampaign(null);
    } else {
      // Add new campaign
      const newCampaign = {
          ...campaignData,
          id: `campaign-${Date.now()}`,
          status: 'Active' as const,
      };
      setCampaigns((prev) => [newCampaign, ...prev]);

      startTransition(async () => {
          const result = await handleRunOrchestrator(newCampaign);
          if (result.message === 'error') {
              toast({
                  title: 'Orchestrator Failed',
                  description: result.error,
                  variant: 'destructive',
              });
          } else {
               toast({
                  title: 'Orchestrator Started!',
                  description: `Campaign "${newCampaign.solutionName}" is now being managed by the AI.`,
              });
          }
      });
    }
    setActiveTab('tracker');
  };

  const toggleCampaignStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === 'Active' ? 'Paused' : 'Active';
    setCampaigns(campaigns.map(c => 
      c.id === campaign.id ? { ...c, status: newStatus } : c
    ));

    if (newStatus === 'Active') {
        startTransition(async () => {
            const result = await handleRunOrchestrator(campaign);
             if (result.message === 'error') {
              toast({
                  title: 'Orchestrator Failed',
                  description: result.error,
                  variant: 'destructive',
              });
            } else {
                 toast({
                    title: 'Orchestrator Started!',
                    description: `Campaign "${campaign.solutionName}" is now being managed by the AI.`,
                });
            }
        });
    }
  }

  const handleEditClick = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setActiveTab('create');
  }

  const clearEditing = () => {
    setEditingCampaign(null);
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => {
        if (value !== 'create') {
            setEditingCampaign(null);
        }
        setActiveTab(value)
    }}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="create">{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</TabsTrigger>
          <TabsTrigger value="tracker">Campaign Tracker</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>{editingCampaign ? `Editing: ${editingCampaign.solutionName}` : 'AI Campaign Creator'}</CardTitle>
            <CardDescription>
              {editingCampaign 
                ? 'Update the details of your campaign below.'
                : 'Generate personalized, multi-channel outreach campaigns based on your value proposition and a selected lead profile.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignCreationForm 
              solutions={solutions}
              onCampaignSubmit={handleCampaignSubmit} 
              editingCampaign={editingCampaign}
              clearEditing={clearEditing}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tracker">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Tracker</CardTitle>
            <CardDescription>
              Monitor and manage all your active and paused outreach campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solution</TableHead>
                  <TableHead>Lead Profile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.solutionName}
                    </TableCell>
                    <TableCell>
                      {campaign.leadProfile}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          campaign.status === 'Active'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Switch 
                        checked={campaign.status === 'Active'}
                        onCheckedChange={() => toggleCampaignStatus(campaign)}
                        aria-label="Toggle campaign status"
                        disabled={isPending}
                      />
                       <Button variant="outline" size="sm" onClick={() => handleEditClick(campaign)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
