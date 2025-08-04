
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
import { type Solution } from '@/app/solutions/data';
import { type Profile } from '@/app/leads/data';

export interface Campaign {
  id: string;
  solutionId: string;
  leadProfileId: string;
  emailScript: string;
  callScript: string;
  status: 'Active' | 'Paused';
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState('tracker');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    // Load state from localStorage on the client
    const savedCampaigns = localStorage.getItem('campaigns');
    setCampaigns(savedCampaigns ? JSON.parse(savedCampaigns) : []);

    const savedSolutions = localStorage.getItem('solutions');
    setSolutions(savedSolutions ? JSON.parse(savedSolutions) : []);

    const savedProfiles = localStorage.getItem('profiles');
    setProfiles(savedProfiles ? JSON.parse(savedProfiles) : []);
  }, []);

  useEffect(() => {
    // This effect runs only on the client, so it's safe to use localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns]);


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
          const result = await handleRunOrchestrator(newCampaign, solutions, profiles);
          if (result.message === 'error') {
              toast({
                  title: 'Orchestrator Failed',
                  description: result.error,
                  variant: 'destructive',
              });
          } else {
               const solution = solutions.find(s => s.id === newCampaign.solutionId);
               toast({
                  title: 'Orchestrator Started!',
                  description: `Campaign "${solution?.name}" is now being managed by the AI.`,
              });
          }
      });
    }
    setActiveTab('tracker');
  };

  const toggleCampaignStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === 'Active' ? 'Paused' : 'Active';
    const updatedCampaign = { ...campaign, status: newStatus };
    const solution = solutions.find(s => s.id === campaign.solutionId);

    setCampaigns(campaigns.map(c => 
      c.id === campaign.id ? updatedCampaign : c
    ));

    if (newStatus === 'Active') {
        startTransition(async () => {
            const result = await handleRunOrchestrator(updatedCampaign, solutions, profiles);
             if (result.message === 'error') {
              toast({
                  title: 'Orchestrator Failed',
                  description: result.error,
                  variant: 'destructive',
              });
            } else {
                 toast({
                    title: 'Orchestrator Started!',
                    description: `Campaign "${solution?.name}" is now being managed by the AI.`,
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

  const getProfileNameById = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    return profile ? profile.name : 'Unknown Profile';
  }

  const getSolutionNameById = (id: string) => {
    const solution = solutions.find(s => s.id === id);
    return solution ? solution.name : 'Unknown Solution';
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
            <CardTitle>{editingCampaign ? `Editing: ${getSolutionNameById(editingCampaign.solutionId)}` : 'AI Campaign Creator'}</CardTitle>
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
              profiles={profiles}
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
                      {getSolutionNameById(campaign.solutionId)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getProfileNameById(campaign.leadProfileId)}
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
