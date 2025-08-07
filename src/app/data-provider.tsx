'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface DataContextType {
  user: FirebaseUser | null;
  signInWithGoogle: () => Promise<void>;
  solutions: Solution[];
  setSolutions: React.Dispatch<React.SetStateAction<Solution[]>>;
  profiles: LeadProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<LeadProfile[]>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  allCallLogs: CallLog[];
  setAllCallLogs: React.Dispatch<React.SetStateAction<CallLog[]>>;
  allEmailLogs: EmailLog[];
  setAllEmailLogs: React.Dispatch<React.SetStateAction<EmailLog[]>>;
  isLoading: boolean;
  addCallLogs: (newLogs: CallLog[]) => Promise<void>;
  addEmailLogs: (newLogs: EmailLog[]) => Promise<void>;
  addLeads: (newLeads: LeadProfile[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [profiles, setProfiles] = useState<LeadProfile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allCallLogs, setAllCallLogs] = useState<CallLog[]>([]);
  const [allEmailLogs, setAllEmailLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Google Auth-only sign-in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // Firestore listeners scoped to user
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    // Solutions
    const solutionsQuery = query(collection(db, COLLECTIONS.SOLUTIONS), where('createdBy', '==', user.uid));
    const unsubSolutions = onSnapshot(solutionsQuery, (snapshot) => {
      setSolutions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    // Profiles
    const profilesQuery = query(collection(db, COLLECTIONS.LEADS), where('createdBy', '==', user.uid));
    const unsubProfiles = onSnapshot(profilesQuery, (snapshot) => {
      setProfiles(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    // Campaigns
    const campaignsQuery = query(collection(db, COLLECTIONS.CAMPAIGNS), where('createdBy', '==', user.uid));
    const unsubCampaigns = onSnapshot(campaignsQuery, (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    // Call Logs
    const callLogsQuery = query(collection(db, COLLECTIONS.CALL_LOGS), where('createdBy', '==', user.uid));
    const unsubCallLogs = onSnapshot(callLogsQuery, (snapshot) => {
      setAllCallLogs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    // Email Logs
    const emailLogsQuery = query(collection(db, COLLECTIONS.EMAIL_LOGS), where('createdBy', '==', user.uid));
    const unsubEmailLogs = onSnapshot(emailLogsQuery, (snapshot) => {
      setAllEmailLogs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    setIsLoading(false);
    return () => {
      unsubSolutions();
      unsubProfiles();
      unsubCampaigns();
      unsubCallLogs();
      unsubEmailLogs();
    };
  }, [user]);

  // Add logs to Firestore
  const addCallLogs = useCallback(async (newLogs: Omit<CallLog, 'id' | 'createdAt' | 'createdBy'>[]) => {
    if (!user) return;
    for (const log of newLogs) {
      await addDoc(collection(db, COLLECTIONS.CALL_LOGS), {
        ...log,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
    }
  }, [user]);

  const addEmailLogs = useCallback(async (newLogs: Omit<EmailLog, 'id' | 'createdAt' | 'createdBy'>[]) => {
    if (!user) return;
    for (const log of newLogs) {
      await addDoc(collection(db, COLLECTIONS.EMAIL_LOGS), {
        ...log,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
    }
  }, [user]);

  // Add enriched leads to Firestore
  const addLeads = useCallback(async (newLeads: Omit<LeadProfile, 'id' | 'createdAt' | 'createdBy'>[]) => {
    if (!user) return;
    for (const lead of newLeads) {
      await addDoc(collection(db, COLLECTIONS.LEADS), {
        ...lead,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
    }
  }, [user]);

  const value: DataContextType = {
    user,
    signInWithGoogle,
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
    addEmailLogs,
    addLeads,
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
