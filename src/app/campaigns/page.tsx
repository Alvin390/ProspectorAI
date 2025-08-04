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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CampaignCreationForm } from './campaign-creation-form';

const attempts = [
  {
    campaign: 'Q4 Fintech Outreach',
    status: 'In Progress',
    channel: 'Email',
    lastContacted: '2023-10-26',
    nextAttempt: '2023-10-29',
  },
  {
    campaign: 'EU E-commerce Initiative',
    status: 'Paused',
    channel: 'Call',
    lastContacted: '2023-10-20',
    nextAttempt: 'N/A',
  },
  {
    campaign: 'Startup Seed Round',
    status: 'Completed',
    channel: 'Email & Call',
    lastContacted: '2023-09-15',
    nextAttempt: 'N/A',
  },
  {
    campaign: 'New Year SaaS Push',
    status: 'Scheduled',
    channel: 'Email',
    lastContacted: 'N/A',
    nextAttempt: '2024-01-05',
  },
];

export default function CampaignsPage() {
  return (
    <Tabs defaultValue="create" className="grid gap-6">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
          <TabsTrigger value="tracker">Attempt Tracker</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>AI Campaign Creator</CardTitle>
            <CardDescription>
              Generate personalized, multi-channel outreach campaigns based on
              your value proposition and a selected lead profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignCreationForm />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tracker">
        <Card>
          <CardHeader>
            <CardTitle>Attempt Tracker</CardTitle>
            <CardDescription>
              Monitor the status and schedule of all your outreach campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Last Contacted</TableHead>
                  <TableHead>Next Attempt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.campaign}>
                    <TableCell className="font-medium">
                      {attempt.campaign}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          attempt.status === 'In Progress'
                            ? 'default'
                            : attempt.status === 'Completed'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {attempt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{attempt.channel}</TableCell>
                    <TableCell>{attempt.lastContacted}</TableCell>
                    <TableCell>{attempt.nextAttempt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
