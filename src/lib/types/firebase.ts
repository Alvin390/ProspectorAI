import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  targetAudience: string;
  pricing: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User UID
}

export interface LeadProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  jobTitle?: string;
  interests?: string[];
  recentNews?: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User UID
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  solutionId: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetLeads: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User UID
}

export interface CallLog {
  id: string;
  leadId: string;
  campaignId: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'no_answer' | 'failed';
  duration?: number; // in seconds
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
  nextSteps?: string;
  scheduledTime: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  createdBy: string; // User UID
}

export interface EmailLog {
  id: string;
  leadId: string;
  campaignId: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced';
  sentAt?: Timestamp;
  openedAt?: Timestamp;
  replyReceivedAt?: Timestamp;
  threadId?: string;
  enrichment?: {
    jobTitle?: string;
    interests?: string[];
    recentNews?: string;
    linkedinUrl?: string;
  };
  createdAt: Timestamp;
  createdBy: string; // User UID
}
