
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Phone, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export interface CallLog {
  id: string;
  campaignId: string;
  campaignName: string;
  leadIdentifier: string;
  status: 'Meeting Booked' | 'Not Interested' | 'Follow-up Required';
  summary: string;
  timestamp: string;
}

export default function CallingPage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    // This effect will run when the component mounts and whenever campaigns change.
    const allCallLogs = JSON.parse(localStorage.getItem('allCallLogs') || '[]');
    setCallLogs(allCallLogs);

    const handleStorageChange = () => {
        const updatedLogs = JSON.parse(localStorage.getItem('allCallLogs') || '[]');
        setCallLogs(updatedLogs);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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


  return (
    <Card>
      <CardHeader>
        <CardTitle>Outbound Calling Log</CardTitle>
        <CardDescription>
          A real-time log of all outreach calls made by the AI. This log is updated as the AI works through its campaign tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
       {callLogs.length > 0 ? (
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Summary</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.sort((a,b) => parseInt(a.timestamp) - parseInt(b.timestamp)).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.campaignName}</TableCell>
                    <TableCell>{log.leadIdentifier}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status)} className='gap-1 pl-2 pr-3'>
                            {getStatusIcon(log.status)}
                            {log.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.summary}</TableCell>
                    <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
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
