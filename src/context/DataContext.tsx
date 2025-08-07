'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useFirebaseApp } from 'reactfire';
import { getAuth, User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { 
  userService, 
  solutionService, 
  leadService, 
  campaignService 
} from '@/lib/firebase/firestore';
import type { Solution, LeadProfile, Campaign, CallLog, EmailLog } from '@/lib/types/firebase';

interface DataContextType {
  // User Data
  user: FirebaseUser | null;
  loading: boolean;
  error: Error | null;
  
  // Solutions
  solutions: Solution[];
  createSolution: (data: Omit<Solution, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  // Leads
  leads: LeadProfile[];
  createLead: (data: Omit<LeadProfile, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  
  // Campaigns
  campaigns: Campaign[];
  createCampaign: (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  
  // Logs
  callLogs: CallLog[];
  emailLogs: EmailLog[];
  addCallLog: (log: Omit<CallLog, 'id' | 'createdAt'>) => Promise<void>;
  addEmailLog: (log: Omit<EmailLog, 'id' | 'createdAt'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { data: firebaseUser, status, error } = useUser();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [leads, setLeads] = useState<LeadProfile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  const firebaseApp = useFirebaseApp();

  // Load user data on auth state change
  useEffect(() => {
    if (firebaseUser) {
      // Load user data
      userService.getUser(firebaseUser.uid).then(userData => {
        if (!userData) {
          // Create user profile if it doesn't exist
          userService.createOrUpdateUser(firebaseUser.uid, {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
      });

      // Load user's solutions
      solutionService.getUserSolutions(firebaseUser.uid).then(setSolutions);
      
      // Load user's leads
      leadService.getUserLeads(firebaseUser.uid).then(setLeads);
      
      // Load user's campaigns
      campaignService.getUserCampaigns(firebaseUser.uid).then(setCampaigns);
      
      // TODO: Load logs
    }
  }, [firebaseUser]);

  // Create a new solution
  const createSolution = async (data: Omit<Solution, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firebaseUser) throw new Error('User not authenticated');
    const newSolution = await solutionService.createSolution(data, firebaseUser.uid);
    setSolutions(prev => [...prev, newSolution]);
  };

  // Create a new lead
  const createLead = async (data: Omit<LeadProfile, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!firebaseUser) throw new Error('User not authenticated');
    const newLead = await leadService.createLead(data, firebaseUser.uid);
    setLeads(prev => [...prev, newLead]);
  };

  // Create a new campaign
  const createCampaign = async (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!firebaseUser) throw new Error('User not authenticated');
    const newCampaign = await campaignService.createCampaign(data, firebaseUser.uid);
    setCampaigns(prev => [...prev, newCampaign]);
  };

  // Add a call log
  const addCallLog = async (log: Omit<CallLog, 'id' | 'createdAt'>) => {
    // TODO: Implement call log service
    const newLog: CallLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Timestamp.now(),
    };
    setCallLogs(prev => [...prev, newLog]);
  };

  // Add an email log
  const addEmailLog = async (log: Omit<EmailLog, 'id' | 'createdAt'>) => {
    // TODO: Implement email log service
    const newLog: EmailLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Timestamp.now(),
    };
    setEmailLogs(prev => [...prev, newLog]);
  };

  return (
    <DataContext.Provider
      value={{
        user: firebaseUser || null,
        loading: status === 'loading',
        error: error || null,
        solutions,
        createSolution,
        leads,
        createLead,
        campaigns,
        createCampaign,
        callLogs,
        emailLogs,
        addCallLog,
        addEmailLog,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
