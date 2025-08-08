'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';

import { useFirestoreCollectionData, useSigninCheck } from 'reactfire';

// Fix LeadProfile import to match your actual export
import type { Solution } from '@/app/solutions/data';
import type { LeadProfile } from '@/app/leads/data'; // Ensure this is exported from leads/data
import type { Campaign } from '@/app/campaigns/page';
import type { CallLog } from '@/app/calling/page';
import type { EmailLog } from '@/app/email/page';

interface DataContextType {
  user: FirebaseUser | null;
  signInWithGoogle: () => Promise<void>;
  solutions: Solution[];
  profiles: LeadProfile[];
  campaigns: Campaign[];
  allCallLogs: CallLog[];
  allEmailLogs: EmailLog[];
  isLoading: boolean;
  addCallLogs: (newLogs: Omit<CallLog, 'id' | 'createdAt' | 'createdBy'>[]) => Promise<void>;
  addEmailLogs: (newLogs: Omit<EmailLog, 'id' | 'createdAt' | 'createdBy'>[]) => Promise<void>;
  addLeads: (newLeads: Partial<LeadProfile>[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { status: authStatus, data: signInResult } = useSigninCheck();
  const user = signInResult?.user || null;

  const solutionsRef = collection(db, COLLECTIONS.SOLUTIONS);
  const profilesRef = collection(db, COLLECTIONS.LEADS);
  const campaignsRef = collection(db, COLLECTIONS.CAMPAIGNS);
  const callLogsRef = collection(db, COLLECTIONS.CALL_LOGS);
  const emailLogsRef = collection(db, COLLECTIONS.EMAIL_LOGS);

  const { status: solutionsStatus, data: solutions } = useFirestoreCollectionData(
    query(solutionsRef, where('createdBy', '==', user?.uid || '-')),
    { idField: 'id' }
  );
  const { status: profilesStatus, data: profiles } = useFirestoreCollectionData(
    query(profilesRef, where('createdBy', '==', user?.uid || '-')),
    { idField: 'id' }
  );
  const { status: campaignsStatus, data: campaigns } = useFirestoreCollectionData(
    query(campaignsRef, where('createdBy', '==', user?.uid || '-')),
    { idField: 'id' }
  );
  const { status: callLogsStatus, data: allCallLogs } = useFirestoreCollectionData(
    query(callLogsRef, where('createdBy', '==', user?.uid || '-')),
    { idField: 'id' }
  );
  const { status: emailLogsStatus, data: allEmailLogs } = useFirestoreCollectionData(
    query(emailLogsRef, where('createdBy', '==', user?.uid || '-')),
    { idField: 'id' }
  );


  const isLoading = [authStatus, solutionsStatus, profilesStatus, campaignsStatus, callLogsStatus, emailLogsStatus].includes('loading');


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const addDocWithUser = async (collectionName: string, data: any) => {
      if (!user) throw new Error("User not authenticated");
      return await addDoc(collection(db, collectionName), {
          ...data,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
      });
  }
  
  // Add logs to Firestore
  const addCallLogs = useCallback(async (newLogs: Omit<CallLog, 'id' | 'createdAt' | 'createdBy'>[]) => {
    if (!user) return;
    for (const log of newLogs) {
      await addDocWithUser(COLLECTIONS.CALL_LOGS, log);
    }
  }, [user]);

  const addEmailLogs = useCallback(async (newLogs: Omit<EmailLog, 'id' | 'createdAt' | 'createdBy'>[]) => {
    if (!user) return;
    for (const log of newLogs) {
      await addDocWithUser(COLLECTIONS.EMAIL_LOGS, log);
    }
  }, [user]);

  // Add enriched leads to Firestore
  const addLeads = useCallback(async (newLeads: Partial<LeadProfile>[]) => {
    if (!user) return;
    for (const lead of newLeads) {
      await addDocWithUser(COLLECTIONS.LEADS, {
        ...lead,
        status: 'new', // Default status for new leads
      });
    }
  }, [user]);

  const value: DataContextType = {
    user,
    signInWithGoogle,
    solutions: (solutions as Solution[]) || [],
    profiles: (profiles as LeadProfile[]) || [],
    campaigns: (campaigns as Campaign[]) || [],
    allCallLogs: (allCallLogs as CallLog[]) || [],
    allEmailLogs: (allEmailLogs as EmailLog[]) || [],
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
    throw new Error('useData must be used within a DataProvider.');
  }
  return context;
}
