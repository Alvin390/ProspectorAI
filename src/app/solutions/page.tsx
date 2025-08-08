
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useData } from '../data-provider';
import type { Solution } from './data';
import { Skeleton } from '@/components/ui/skeleton';


export default function SolutionsPage() {
  const { solutions, user, isLoading } = useData();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [currentSolution, setCurrentSolution] = useState<Omit<Solution, 'id'>>({ name: '', description: '' });
  const { toast } = useToast();

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

  const handleDelete = async (id: string) => {
    if (solutions.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one solution.",
        variant: "destructive",
      });
      return;
    }
    try {
      await deleteDoc(doc(db, 'solutions', id));
      toast({
        title: "Solution Deleted",
        description: "The solution has been successfully deleted.",
        variant: "destructive"
      });
    } catch (err) {
      console.error("Delete failed:", err);
      toast({
        title: "Delete Failed",
        description: "Could not delete solution.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!currentSolution.name || !currentSolution.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields to save the solution.",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(true);
    try {
      if (editingSolution) {
        // Update existing solution in Firestore
        await updateDoc(doc(db, 'solutions', editingSolution.id), {
          ...editingSolution,
          ...currentSolution,
        });
        toast({
          title: "Solution Updated",
          description: "Your changes have been saved."
        });
      } else {
        // Add new solution to Firestore
        await addDoc(collection(db, 'solutions'), {
          ...currentSolution,
          createdBy: user?.uid || '',
        });
        toast({
          title: "Solution Created",
          description: "The new solution has been saved."
        });
      }
      setIsSheetOpen(false);
      setEditingSolution(null);
    } catch (err) {
      console.error("Save failed:", err);
      toast({
        title: "Save Failed",
        description: "Could not save solution.",
        variant: "destructive"
      });
    } finally {
        setIsSaving(false);
    }
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
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
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
            )}
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
                disabled={isSaving}
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
                disabled={isSaving}
              />
            </div>
          </div>
          <SheetFooter>
              <Button variant="outline" onClick={() => setIsSheetOpen(false)} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Solution'}
              </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
