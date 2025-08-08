
'use client';

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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Phone, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useData } from '../data-provider';
import type { Timestamp } from 'firebase/firestore';

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

export default function CallingPage() {
  const { allCallLogs, isLoading } = useData();

  const getStatusIcon = (status: CallLog['status']) => {
    switch (status) {
      case 'Meeting Booked':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Not Interested':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Follow-up Required':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  }
  
  const getStatusBadgeVariant = (status: CallLog['status']) => {
    switch (status) {
      case 'Meeting Booked':
        return 'default';
      case 'Not Interested':
        return 'destructive';
      case 'Follow-up Required':
        return 'secondary';
    }
  }

  if (isLoading) {
    return <div>Loading call logs...</div>;
  }

  const sortedLogs = [...allCallLogs].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outbound Calling Log</CardTitle>
        <CardDescription>
          A real-time log of all outreach calls made by the AI. This log is updated as the AI works through its campaign tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
       {sortedLogs.length > 0 ? (
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Summary</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.leadId}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status)} className='gap-1 pl-2 pr-3'>
                            {getStatusIcon(log.status)}
                            {log.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.summary}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(log.createdAt.toMillis()).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
       ) : (
            <Alert>
                <Phone className="h-4 w-4" />
                <AlertTitle>No Calling Activity Yet</AlertTitle>
                <AlertDescription>
                   Once an active campaign begins making calls, the activity will appear here in real-time. Start a new campaign on the Campaigns page to begin.
                </AlertDescription>
            </Alert>
       )}
      </CardContent>
    </Card>
  );
}
