
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LeadProfilingForm } from './lead-profiling-form';
import { initialSolutions, type Solution } from '@/app/solutions/data';
import type { GenerateLeadProfileOutput } from '@/ai/flows/generate-lead-profile.schema';
import { useToast } from '@/hooks/use-toast';
import { initialProfiles, type Profile } from './data';


export default function LeadProfilingPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set initial state from default data first to avoid hydration issues
    setProfiles(initialProfiles);
    setSolutions(initialSolutions);
    
    // Then, try to load from localStorage on the client
    const savedProfiles = localStorage.getItem('profiles');
    if (savedProfiles) {
        try {
            const parsed = JSON.parse(savedProfiles);
            if(Array.isArray(parsed)) {
                setProfiles(parsed);
            }
        } catch {
            // Do nothing, use initial
        }
    }

    const savedSolutions = localStorage.getItem('solutions');
    if (savedSolutions) {
        try {
            const parsed = JSON.parse(savedSolutions);
            if(Array.isArray(parsed)) {
                setSolutions(parsed);
            }
        } catch {
            // Do nothing, use initial
        }
    }
  }, []);

  useEffect(() => {
    // This effect runs only on the client, so it's safe to use localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('profiles', JSON.stringify(profiles));
    }
  }, [profiles]);
  

  const handleProfileSave = (profileData: Partial<Profile>, generatedData: GenerateLeadProfileOutput) => {
    if (profileData.id && editingProfile) { // This is an update
        setProfiles(profiles.map(p => p.id === editingProfile.id ? {
            ...p,
            name: profileData.name!,
            description: profileData.description!,
            profileData: generatedData,
        } : p));
        toast({ title: "Profile Updated", description: "The lead profile has been successfully updated." });
    } else { // This is a new profile
        const newProfile: Profile = {
            id: `profile-${Date.now()}`,
            name: profileData.name!,
            description: profileData.description!,
            status: 'Completed',
            createdAt: new Date().toISOString().split('T')[0],
            profileData: generatedData
        };
        setProfiles(prev => [newProfile, ...prev]);
        toast({ title: "Profile Saved", description: "The new lead profile has been saved." });
    }
    setEditingProfile(null); // Clear editing state
  };
  
  const handleDeleteProfile = (id: string) => {
    setProfiles(profiles.filter(p => p.id !== id));
    toast({ title: "Profile Deleted", variant: "destructive" });
  };
  
  const handleEditProfile = (profile: Profile) => {
      setEditingProfile(profile);
      // Scroll to top to make the form visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleCancelEdit = () => {
    setEditingProfile(null);
  }


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingProfile ? `Editing: ${editingProfile.name}` : 'AI-Powered Lead Profiling'}</CardTitle>
          <CardDescription>
             {editingProfile 
                ? 'Modify the details for this profile.' 
                : 'Select a solution or describe an ideal customer, and the AI will generate a detailed market profile.'
             }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeadProfilingForm 
            solutions={solutions} 
            onProfileSave={handleProfileSave}
            editingProfile={editingProfile}
            onCancel={handleCancelEdit}
            key={editingProfile?.id || 'new'} // Force re-render when editing
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Saved Profiles</CardTitle>
          <CardDescription>
            Review and manage your previously generated lead profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {profile.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{profile.status}</Badge>
                  </TableCell>
                  <TableCell>{profile.createdAt}</TableCell>
                   <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditProfile(profile)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
