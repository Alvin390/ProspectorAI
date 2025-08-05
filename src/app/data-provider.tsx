
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialSolutions, type Solution } from '@/app/solutions/data';
import { initialProfiles, type Profile } from '@/app/leads/data';
import type { Campaign } from '@/app/campaigns/page';
import type { CallLog } from './calling/page';
import type { EmailLog } from './email/page';

interface DataContextType {
  solutions: Solution[];
  setSolutions: React.Dispatch<React.SetStateAction<Solution[]>>;
  profiles: Profile[];
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  allCallLogs: CallLog[];
  setAllCallLogs: React.Dispatch<React.SetStateAction<CallLog[]>>;
  allEmailLogs: EmailLog[];
  setAllEmailLogs: React.Dispatch<React.SetStateAction<EmailLog[]>>;
  isLoading: boolean;
  addCallLogs: (newLogs: CallLog[]) => void;
  addEmailLogs: (newLogs: EmailLog[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allCallLogs, setAllCallLogs] = useState<CallLog[]>([]);
  const [allEmailLogs, setAllEmailLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedSolutions = localStorage.getItem('solutions');
      setSolutions(savedSolutions ? JSON.parse(savedSolutions) : initialSolutions);

      const savedProfiles = localStorage.getItem('profiles');
      setProfiles(savedProfiles ? JSON.parse(savedProfiles) : initialProfiles);

      const savedCampaigns = localStorage.getItem('campaigns');
      setCampaigns(savedCampaigns ? JSON.parse(savedCampaigns) : []);
      
      const savedCallLogs = localStorage.getItem('allCallLogs');
      setAllCallLogs(savedCallLogs ? JSON.parse(savedCallLogs) : []);

      const savedEmailLogs = localStorage.getItem('allEmailLogs');
      setAllEmailLogs(savedEmailLogs ? JSON.parse(savedEmailLogs) : []);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Set to initial data if parsing fails
      setSolutions(initialSolutions);
      setProfiles(initialProfiles);
      setCampaigns([]);
      setAllCallLogs([]);
      setAllEmailLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('solutions', JSON.stringify(solutions));
    }
  }, [solutions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('profiles', JSON.stringify(profiles));
    }
  }, [profiles, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('allCallLogs', JSON.stringify(allCallLogs));
    }
  }, [allCallLogs, isLoading]);

  useEffect(() => {
    if (!isLoading) {
        localStorage.setItem('allEmailLogs', JSON.stringify(allEmailLogs));
    }
  }, [allEmailLogs, isLoading]);


  const addCallLogs = useCallback((newLogs: CallLog[]) => {
    setAllCallLogs(prevLogs => {
      const uniqueNewLogs = newLogs.filter(log => !prevLogs.some(existing => existing.id === log.id));
      return [...prevLogs, ...uniqueNewLogs];
    });
  }, []);

  const addEmailLogs = useCallback((newLogs: EmailLog[]) => {
    setAllEmailLogs(prevLogs => {
        const uniqueNewLogs = newLogs.filter(log => !prevLogs.some(existing => existing.id === log.id));
        return [...prevLogs, ...uniqueNewLogs];
    });
  }, []);


  const value = {
    solutions,
    setSolutions,
    profiles,
    setProfiles,
    campaigns,
    setCampaigns,
    allCallLogs,
    setAllCallLogs,
    allEmailLogs,
    setAllEmailLogs,
    isLoading,
    addCallLogs,
    addEmailLogs
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
