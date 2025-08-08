import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  QuerySnapshot,
  FieldValue,
  writeBatch
} from 'firebase/firestore';

// Import the initialized Firestore instance
import { db } from '../firebase';
import type { UserProfile, Solution, LeadProfile, Campaign } from '../types/firebase';

// Export Firestore types for use in other files
export type {
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  FieldValue
};

// Collection names as constants for type safety
export const COLLECTIONS = {
  USERS: 'users',
  SOLUTIONS: 'solutions',
  LEADS: 'leads',
  CAMPAIGNS: 'campaigns',
  CALL_LOGS: 'callLogs',
  EMAIL_LOGS: 'emailLogs',
} as const;

type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

// Helper to create a new timestamp
const createTimestamp = () => {
  return Timestamp.now();
};

// Helper to convert Firestore data to the app's model
const toUserProfile = (id: string, data: DocumentData | undefined): UserProfile => {
  if (!data) {
    // If no data, create a minimal valid profile
    return {
      uid: id,
      email: '',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    } as UserProfile;
  }

  const userData: Partial<UserProfile> = {
    uid: data.uid || id,
    email: data.email || '',
    displayName: data.displayName || '',
    photoURL: data.photoURL || '',
    ...data
  };

  return {
    ...userData,
    createdAt: (data.createdAt as Timestamp) || createTimestamp(),
    updatedAt: (data.updatedAt as Timestamp) || createTimestamp()
  } as UserProfile;
};

// User Service
export const userService = {
  // Get user by ID
  getUser: async (userId: string): Promise<UserProfile | null> => {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || !docSnap.data()) return null;
    return toUserProfile(docSnap.id, docSnap.data());
  },
  // Create or update user
  createOrUpdateUser: async (userId: string, userData: Partial<UserProfile>): Promise<void> => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
      createdAt: userData.createdAt || serverTimestamp(),
    } as UserProfile, { merge: true });
  },
};

// Solution Service
export const solutionService = {
  // Create a new solution
  createSolution: async (data: Omit<Solution, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Solution> => {
    const solutionRef = doc(collection(db, COLLECTIONS.SOLUTIONS));
    const timestamp = createTimestamp();
    const newSolution: Solution = {
      ...data,
      id: solutionRef.id,
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await setDoc(solutionRef, {
      ...newSolution,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return newSolution;
  },
  // Get solutions created by a user
  getUserSolutions: async (userId: string): Promise<Solution[]> => {
    const solutionsQuery = query(collection(db, COLLECTIONS.SOLUTIONS), where('createdBy', '==', userId));
    const snapshot = await getDocs(solutionsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Solution));
  },
};

// Lead Service
export const leadService = {
  createLead: async (data: Omit<LeadProfile, 'id' | 'createdAt' | 'updatedAt' | 'status'>, userId: string) => {
    const leadRef = doc(collection(db, COLLECTIONS.LEADS));
    const timestamp = createTimestamp();
    const newLead: LeadProfile = {
      ...data,
      id: leadRef.id,
      status: 'new',
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await setDoc(leadRef, {
      ...newLead,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return newLead;
  },
  getUserLeads: async (userId: string): Promise<LeadProfile[]> => {
    const leadsQuery = query(collection(db, COLLECTIONS.LEADS), where('createdBy', '==', userId));
    const snapshot = await getDocs(leadsQuery);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LeadProfile));
  }
};

// Campaign Service
export const campaignService = {
  createCampaign: async (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'status'>, userId: string) => {
    const campaignRef = doc(collection(db, COLLECTIONS.CAMPAIGNS));
    const timestamp = createTimestamp();
    const newCampaign: Campaign = {
      ...data,
      id: campaignRef.id,
      status: 'draft',
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await setDoc(campaignRef, {
      ...newCampaign,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return newCampaign;
  },
  getUserCampaigns: async (userId: string): Promise<Campaign[]> => {
    const campaignsQuery = query(collection(db, COLLECTIONS.CAMPAIGNS), where('createdBy', '==', userId));
    const snapshot = await getDocs(campaignsQuery);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Campaign));
  }
};

// Save multiple enriched leads to Firestore (for hyperpersonalization)
export async function saveLeadsToFirebase(leads: any[]): Promise<void> {
  if (!Array.isArray(leads) || leads.length === 0) return;
  const batch = writeBatch(db);
  leads.forEach((lead: any) => {
    // Use lead.id if available, otherwise generate a new doc
    const leadRef = lead.id
      ? doc(db, COLLECTIONS.LEADS, lead.id)
      : doc(collection(db, COLLECTIONS.LEADS));
    batch.set(leadRef, {
      ...lead,
      // Flatten enrichment fields if present
      jobTitle: lead.enrichment?.jobTitle || lead.jobTitle || '',
      interests: lead.enrichment?.interests || lead.interests || [],
      recentNews: lead.enrichment?.recentNews || lead.recentNews || '',
      linkedinUrl: lead.enrichment?.linkedin || lead.linkedinUrl || '',
      updatedAt: serverTimestamp(),
      createdAt: lead.createdAt || serverTimestamp(),
      status: lead.status || 'new',
      notes: lead.notes || '',
      createdBy: lead.createdBy || '',
    });
  });
  await batch.commit();
}
