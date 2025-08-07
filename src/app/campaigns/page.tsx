'use client';

import { useState, useTransition } from 'react';
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
import { useData } from '../data-provider';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';


export interface Campaign {
  id: string;
  solutionId: string;
  leadProfileId: string;
  emailScript: string;
  callScript: string;
  status: 'Active' | 'Paused';
}

export default function CampaignsPage() {
  const { campaigns, user, solutions, profiles, addCallLogs, addEmailLogs, isLoading } = useData();
  const [activeTab, setActiveTab] = useState('tracker');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const runOrchestratorForCampaign = (campaign: Campaign) => {
     startTransition(async () => {
          const result = await handleRunOrchestrator(campaign, solutions, profiles);
          if (result.message === 'error') {
              toast({
                  title: 'Orchestrator Failed',
                  description: result.error,
                  variant: 'destructive',
              });
          } else if (result.data) {
               const solution = solutions.find(s => s.id === campaign.solutionId);
               toast({
                  title: 'Campaign Started!',
                  description: `Campaign "${solution?.name}" is now being managed by the AI. View progress on the Orchestration, Calling and Email pages.`,
              });

                localStorage.setItem(`orchestrationPlan_${campaign.id}`, JSON.stringify(result.data.orchestrationPlan));

                if (result.data.callLogs.length > 0) {
                  addCallLogs(result.data.callLogs);
                }
                if (result.data.emailLogs.length > 0) {
                  addEmailLogs(result.data.emailLogs);
                }

                window.dispatchEvent(new Event('storage'));
          }
      });
  }


  const handleCampaignSubmit = async (
    campaignData: Omit<Campaign, 'id' | 'status'>
  ) => {
    try {
      if (editingCampaign) {
        // Update existing campaign in Firestore
        const updatedCampaign = { ...editingCampaign, ...campaignData };
        await updateDoc(doc(db, 'campaigns', editingCampaign.id), updatedCampaign);
        if (updatedCampaign.status === 'Active') {
          runOrchestratorForCampaign(updatedCampaign);
        }
        setEditingCampaign(null);
      } else {
        // Add new campaign to Firestore
        const newCampaign = {
          ...campaignData,
          status: 'Active' as const,
          createdBy: user?.uid || '',
        };
        const docRef = await addDoc(collection(db, 'campaigns'), newCampaign);
        const campaignWithId = { ...newCampaign, id: docRef.id };
        runOrchestratorForCampaign(campaignWithId);
      }
      setActiveTab('tracker');
    } catch (err) {
      toast({ title: "Save Failed", description: "Could not save campaign.", variant: "destructive" });
    }
  };

  const toggleCampaignStatus = async (campaign: Campaign) => {
    try {
      const newStatus: 'Active' | 'Paused' = campaign.status === 'Active' ? 'Paused' : 'Active';
      const updatedCampaign: Campaign = { ...campaign, status: newStatus };
      await updateDoc(doc(db, 'campaigns', campaign.id), updatedCampaign);
      if (newStatus === 'Active') {
        const solution = solutions.find(s => s.id === campaign.solutionId);
        toast({
          title: 'Campaign Resumed!',
          description: `Campaign "${solution?.name}" is active again. Rerunning orchestrator to get latest plan.`,
        });
        runOrchestratorForCampaign(updatedCampaign);
      }
    } catch (err) {
      toast({ title: "Status Change Failed", description: "Could not update campaign status.", variant: "destructive" });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'campaigns', id));
      toast({ title: "Campaign Deleted", description: "The campaign has been successfully deleted.", variant: "destructive" });
    } catch (err) {
      toast({ title: "Delete Failed", description: "Could not delete campaign.", variant: "destructive" });
    }
  };

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

  if (isLoading) {
    return <div>Loading campaigns...</div>
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
