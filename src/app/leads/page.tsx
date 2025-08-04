
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
import { initialSolutions } from '@/app/solutions/data';
import type { GenerateLeadProfileOutput } from '@/ai/flows/generate-lead-profile.schema';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  description: string;
  status: 'Completed';
  createdAt: string;
  profileData: GenerateLeadProfileOutput | null;
}

const initialProfiles: Profile[] = [
  {
    id: '1',
    description: 'Tech startups in Silicon Valley with 50-100 employees',
    status: 'Completed',
    createdAt: '2023-10-27',
    profileData: {
      attributes: 'Industry: Technology, B2B SaaS\nLocation: Silicon Valley, CA\nCompany Size: 50-100 employees\nPain Points: Manual lead generation, high customer acquisition costs, inefficient sales processes.',
      onlinePresence: 'Active on LinkedIn, TechCrunch, Hacker News. Follows thought leaders like Sam Altman and Andrew Ng.'
    }
  },
  {
    id: '2',
    description: 'E-commerce businesses in Europe selling fashion goods',
    status: 'Completed',
    createdAt: '2023-10-25',
    profileData: {
       attributes: 'Industry: E-commerce, Fashion & Apparel\nLocation: Europe (UK, Germany, France)\nCompany Size: 10-50 employees\nPain Points: High cart abandonment rates, low customer lifetime value, competition from large retailers.',
       onlinePresence: 'Active on Instagram, Pinterest, and fashion-focused blogs. Uses platforms like Shopify or Magento.'
    }
  },
  {
    id: '3',
    description: 'Financial services companies in New York',
    status: 'Completed',
    createdAt: '2023-10-22',
    profileData: {
        attributes: 'Industry: Financial Services, FinTech\nLocation: New York, NY\nCompany Size: 100+ employees\nPain Points: Regulatory compliance, data security, legacy IT systems, need for digital transformation.',
        onlinePresence: 'Active on LinkedIn, Wall Street Journal, Bloomberg. Attends industry conferences like Money 20/20.'
    }
  },
];


export default function LeadProfilingPage() {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    if (typeof window !== 'undefined') {
        const savedProfiles = localStorage.getItem('profiles');
        if (savedProfiles) {
            try {
                const parsed = JSON.parse(savedProfiles);
                return Array.isArray(parsed) ? parsed : initialProfiles;
            } catch {
                return initialProfiles;
            }
        }
    }
    return initialProfiles;
  });
  
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('profiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  const handleProfileSave = (profileData: Partial<Profile>, generatedData: GenerateLeadProfileOutput) => {
    if (profileData.id) { // This is an update
        setProfiles(profiles.map(p => p.id === profileData.id ? {
            ...p,
            description: profileData.description!,
            profileData: generatedData,
        } : p));
        toast({ title: "Profile Updated", description: "The lead profile has been successfully updated." });
    } else { // This is a new profile
        const newProfile: Profile = {
            id: `profile-${Date.now()}`,
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


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingProfile ? `Editing: ${editingProfile.description}` : 'AI-Powered Lead Profiling'}</CardTitle>
          <CardDescription>
             {editingProfile 
                ? 'Regenerate or modify the description for this profile.' 
                : 'Select one of your solutions or describe your ideal customer, and our AI will generate a detailed profile to help you find the perfect leads.'
             }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeadProfilingForm 
            solutions={initialSolutions} 
            onProfileSave={handleProfileSave}
            editingProfile={editingProfile}
            key={editingProfile?.id || 'new'} // Force re-render when editing
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Past Profiles</CardTitle>
          <CardDescription>
            Review and manage your previously generated lead profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
