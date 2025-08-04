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
import { LeadProfilingForm } from './lead-profiling-form';

const pastProfiles = [
  {
    id: '1',
    description: 'Tech startups in Silicon Valley with 50-100 employees',
    status: 'Completed',
    createdAt: '2023-10-27',
  },
  {
    id: '2',
    description: 'E-commerce businesses in Europe selling fashion goods',
    status: 'Completed',
    createdAt: '2023-10-25',
  },
  {
    id: '3',
    description: 'Financial services companies in New York',
    status: 'Completed',
    createdAt: '2023-10-22',
  },
];

export default function LeadProfilingPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Lead Profiling</CardTitle>
          <CardDescription>
            Describe your ideal customer, and our AI will generate a detailed
            profile to help you find the perfect leads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeadProfilingForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Past Profiles</CardTitle>
          <CardDescription>
            Review and manage your previously generated lead profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{profile.status}</Badge>
                  </TableCell>
                  <TableCell>{profile.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
