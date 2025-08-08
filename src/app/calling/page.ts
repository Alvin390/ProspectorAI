import {Timestamp} from "firebase/firestore";

export interface CallLog {
  id: string;
  leadId: string;
  campaignId: string;
  status: 'Meeting Booked' | 'Not Interested' | 'Follow-up Required';
  summary: string;
  scheduledTime: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
}
