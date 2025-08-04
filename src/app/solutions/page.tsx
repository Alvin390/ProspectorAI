
'use client';

import { useState, useEffect } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { initialSolutions, type Solution } from './data';
import { useToast } from '@/hooks/use-toast';

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [open, setOpen] = useState(false);
  const [newSolution, setNewSolution] = useState<Solution>({ name: '', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSolutions = localStorage.getItem('solutions');
      if (savedSolutions) {
        try {
          const parsed = JSON.parse(savedSolutions);
          setSolutions(Array.isArray(parsed) ? parsed : initialSolutions);
        } catch {
          setSolutions(initialSolutions);
        }
      } else {
        setSolutions(initialSolutions);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && solutions.length > 0) {
      localStorage.setItem('solutions', JSON.stringify(solutions));
    }
  }, [solutions]);


  const handleAddSolution = () => {
    if (newSolution.name && newSolution.description) {
      setSolutions([...solutions, newSolution]);
      setNewSolution({ name: '', description: '' });
      setOpen(false);
      toast({
        title: "Solution Added",
        description: `The "${newSolution.name}" solution has been saved.`,
      })
    } else {
        toast({
            title: "Missing Information",
            description: "Please provide both a name and a description for the solution.",
            variant: "destructive",
        })
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Solutions</CardTitle>
            <CardDescription>
              Add and manage the software solutions you want to find clients
              for.
            </CardDescription>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <Button size="sm" className="gap-1" onClick={() => setOpen(true)}>
              <PlusCircle className="h-4 w-4" />
              Add Solution
            </Button>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Solution</SheetTitle>
                <SheetDescription>
                  Describe your new software solution. This will be used by the
                  AI to generate lead profiles.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="solution-name">Solution Name</Label>
                  <Input
                    id="solution-name"
                    value={newSolution.name}
                    onChange={(e) => setNewSolution({ ...newSolution, name: e.target.value })}
                    placeholder="e.g., LeadGen Pro"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="solution-description">Description</Label>
                  <Textarea
                    id="solution-description"
                    value={newSolution.description}
                    onChange={(e) => setNewSolution({ ...newSolution, description: e.target.value })}
                    rows={5}
                    placeholder="Describe what your solution does, its key features, and value proposition."
                  />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button onClick={handleAddSolution}>Save Solution</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
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
                  <TableCell className="font-medium">
                    {solution.name}
                  </TableCell>
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
