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

const callLog = [
  {
    lead: 'John Doe @ Acme Inc.',
    status: 'Meeting Scheduled',
    duration: '03:45',
    reason: '-',
  },
  {
    lead: 'Jane Smith @ Beta Corp.',
    status: 'Rejected',
    duration: '01:22',
    reason: 'Not interested in new tools.',
  },
  {
    lead: 'Sam Wilson @ Gamma LLC',
    status: 'In Progress',
    duration: '02:10',
    reason: '-',
  },
  {
    lead: 'Lisa Ray @ Delta Co.',
    status: 'Voicemail',
    duration: '00:30',
    reason: '-',
  },
  {
    lead: 'Mike Chen @ Epsilon Ltd.',
    status: 'Ringing',
    duration: '00:15',
    reason: '-',
  },
];

export default function CallingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outbound Calling Automation</CardTitle>
        <CardDescription>
          Monitor your automated AI-powered call campaigns in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reason for Rejection</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {callLog.map((call) => (
              <TableRow key={call.lead}>
                <TableCell className="font-medium">{call.lead}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      call.status === 'Meeting Scheduled'
                        ? 'default'
                        : call.status === 'Rejected'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {call.status}
                  </Badge>
                </TableCell>
                <TableCell>{call.duration}</TableCell>
                <TableCell>{call.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
