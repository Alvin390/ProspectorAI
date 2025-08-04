
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
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { initialSolutions, type Solution } from './data';
import { useToast } from '@/hooks/use-toast';

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [currentSolution, setCurrentSolution] = useState<Omit<Solution, 'id'>>({ name: '', description: '' });

  const { toast } = useToast();

   useEffect(() => {
    // Set initial state from default data first
    setSolutions(initialSolutions);
    
    // Then, try to load from localStorage on the client
    const savedSolutions = localStorage.getItem('solutions');
    if (savedSolutions) {
      try {
        const parsed = JSON.parse(savedSolutions);
        if (Array.isArray(parsed) && parsed.length > 0) {
            setSolutions(parsed);
        }
      } catch {
        // Do nothing, use initial
      }
    }
  }, []);


  useEffect(() => {
     if (typeof window !== 'undefined') {
        localStorage.setItem('solutions', JSON.stringify(solutions));
    }
  }, [solutions]);


  const handleOpenSheet = (solution: Solution | null) => {
    if (solution) {
      setEditingSolution(solution);
      setCurrentSolution({ name: solution.name, description: solution.description });
    } else {
      setEditingSolution(null);
      setCurrentSolution({ name: '', description: '' });
    }
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    // Prevent deleting the last solution
    if (solutions.length <= 1) {
        toast({
            title: "Cannot Delete",
            description: "You must have at least one solution.",
            variant: "destructive",
        });
        return;
    }
    setSolutions(solutions.filter(s => s.id !== id));
    toast({
        title: "Solution Deleted",
        description: "The solution has been successfully deleted.",
        variant: "destructive"
    })
  }

  const handleSave = () => {
    if (!currentSolution.name || !currentSolution.description) {
        toast({
            title: "Missing Fields",
            description: "Please fill out all fields to save the solution.",
            variant: "destructive"
        })
        return;
    }

    if (editingSolution) {
      // Update existing solution
      setSolutions(solutions.map(s =>
        s.id === editingSolution.id
          ? { ...editingSolution, ...currentSolution }
          : s
      ));
      toast({
          title: "Solution Updated",
          description: "Your changes have been saved."
      })
    } else {
      // Add new solution
      const newSolution: Solution = {
        id: `sol-${Date.now()}`,
        ...currentSolution,
      };
      setSolutions([newSolution, ...solutions]);
      toast({
          title: "Solution Created",
          description: "The new solution has been saved."
      })
    }
    setIsSheetOpen(false);
    setEditingSolution(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setCurrentSolution(prev => ({ ...prev, [id]: value }));
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
            <Button size="sm" className="gap-1" onClick={() => handleOpenSheet(null)}>
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
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solutions.map((solution) => (
                <TableRow key={solution.id}>
                  <TableCell className="font-medium">
                    {solution.name}
                  </TableCell>
                  <TableCell>{solution.description}</TableCell>
                   <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenSheet(solution)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(solution.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingSolution ? 'Edit Solution' : 'Add New Solution'}</SheetTitle>
            <SheetDescription>
              {editingSolution 
                ? 'Modify the details of your software solution.' 
                : 'Describe your new software solution. This will be used by the AI.'
              }
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Solution Name</Label>
              <Input
                id="name"
                value={currentSolution.name}
                onChange={handleInputChange}
                placeholder="e.g., LeadGen Pro"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentSolution.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Describe what your solution does, its key features, and value proposition."
              />
            </div>
          </div>
          <SheetFooter>
              <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Solution</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
