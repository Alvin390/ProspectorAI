
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Solution {
    name: string;
    description: string;
}

export const solutions: Solution[] = [
    {
        name: "ProspectorAI",
        description: "AI-powered lead builder and discovery tool to define target personas, optimizing for fit and conversion.",
    },
    {
        name: "CampaignGen",
        description: "Generates personalized, multi-channel (email & AI voice call) outreach campaigns based on your value proposition.",
    }
]

export default function SolutionsPage() {
  return (
    <div className="grid gap-6">
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Your Solutions</CardTitle>
                <CardDescription>
                    Add and manage the software solutions you want to find clients for.
                </CardDescription>
            </div>
            <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Solution
            </Button>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {solutions.map((solution) => (
                    <TableRow key={solution.name}>
                        <TableCell className="font-medium">{solution.name}</TableCell>
                        <TableCell>{solution.description}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
           </Table>
        </CardContent>
       </Card>
    </div>
  );
}
