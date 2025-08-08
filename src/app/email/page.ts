import {Timestamp} from "firebase/firestore";

export interface EmailLog {
  id: string;
  leadId: string;
  campaignId: string;
  subject: string;
  content: string;
  status: 'sent' | 'opened' | 'replied' | 'bounced';
  createdAt: Timestamp;
  createdBy: string;
  sentAt: Timestamp;
}
