
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  lastUpdated: string;
}

const initialTemplates: Template[] = [
  {
    id: '1',
    name: 'Initial Outreach',
    subject: 'Quick question about {{companyName}}',
    body: 'Hi {{firstName}},\n\nI came across your profile and was impressed with your work at {{companyName}}. I have a quick question about your current process for [insert relevant topic].\n\nBest,\n\n[Your Name]',
    lastUpdated: '2023-10-25',
  },
  {
    id: '2',
    name: 'Follow-up 1',
    subject: 'Re: Quick question',
    body: 'Hi {{firstName}},\n\nJust wanted to follow up on my previous email. Is this something that interests you?\n\nBest,\n\n[Your Name]',
    lastUpdated: '2023-10-26',
  },
  {
    id: '3',
    name: 'Meeting Confirmation',
    subject: 'Confirmation: Your meeting with ProspectorAI',
    body: 'Hi {{firstName}},\n\nThis email confirms our meeting on [Date] at [Time]. Looking forward to our conversation.\n\nBest,\n\n[Your Name]',
    lastUpdated: '2023-10-20',
  },
  {
    id: '4',
    name: 'Break-up Email',
    subject: 'Closing the loop',
    body: 'Hi {{firstName}},\n\nSince I haven\'t heard back, I\'ll assume this is not a priority for you right now. Please feel free to reach out if anything changes in the future.\n\nBest,\n\n[Your Name]',
    lastUpdated: '2023-09-18',
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState({ name: '', subject: '', body: '' });
  const { toast } = useToast();

  useEffect(() => {
    // Set initial state from default data first
    setTemplates(initialTemplates);

    // Then, try to load from localStorage on the client
    const savedTemplates = localStorage.getItem('templates');
    if (savedTemplates) {
        try {
            const parsed = JSON.parse(savedTemplates);
            if(Array.isArray(parsed)) {
                setTemplates(parsed);
            }
        } catch {
             // Do nothing, use initial
        }
    }
  }, []);

  useEffect(() => {
    // This effect runs only on the client, so it's safe to use localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('templates', JSON.stringify(templates));
    }
  }, [templates]);


  const handleOpenSheet = (template: Template | null) => {
    if (template) {
      setEditingTemplate(template);
      setCurrentTemplate({ name: template.name, subject: template.subject, body: template.body });
    } else {
      setEditingTemplate(null);
      setCurrentTemplate({ name: '', subject: '', body: '' });
    }
    setIsSheetOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast({
        title: "Template Deleted",
        description: "The email template has been successfully deleted.",
        variant: 'destructive',
    })
  }

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
        ...template,
        id: `template-${Date.now()}`,
        name: `${template.name} (Copy)`,
        lastUpdated: new Date().toISOString().split('T')[0],
    };
    setTemplates(prev => [newTemplate, ...prev]);
    toast({
        title: "Template Duplicated",
        description: `A copy of "${template.name}" has been created.`,
    })
  }

  const handleSave = () => {
    if (!currentTemplate.name || !currentTemplate.subject || !currentTemplate.body) {
        toast({
            title: "Missing Fields",
            description: "Please fill out all fields to save the template.",
            variant: "destructive"
        })
        return;
    }

    const now = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(t =>
        t.id === editingTemplate.id
          ? { ...t, ...currentTemplate, lastUpdated: now }
          : t
      ));
      toast({
          title: "Template Updated",
          description: "Your changes have been saved."
      })
    } else {
      // Add new template
      const newTemplate: Template = {
        id: `template-${Date.now()}`,
        ...currentTemplate,
        lastUpdated: now,
      };
      setTemplates([newTemplate, ...templates]);
      toast({
          title: "Template Created",
          description: "The new email template has been saved."
      })
    }
    setIsSheetOpen(false);
    setEditingTemplate(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setCurrentTemplate(prev => ({ ...prev, [id]: value }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Create and manage your reusable email templates.
          </CardDescription>
        </div>
        <Button size="sm" className="gap-1" onClick={() => handleOpenSheet(null)}>
          <PlusCircle className="h-4 w-4" />
          New Template
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.subject}</TableCell>
                <TableCell>{template.lastUpdated}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleOpenSheet(template)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(template.id)} className="text-red-500 focus:text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</SheetTitle>
            <SheetDescription>
              {editingTemplate ? 'Modify the details of your email template.' : 'Design a new template with personalization tokens.'}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input id="name" placeholder="e.g., Initial Outreach" value={currentTemplate.name} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Quick question about {{companyName}}"
                value={currentTemplate.subject} 
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                rows={10}
                placeholder="Hi {{firstName}}, ..."
                value={currentTemplate.body}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                Use tokens like `{'{{firstName}}'}`, `{'{{lastName}}'}`, `{'{{companyName}}'}` for personalization.
              </p>
            </div>
          </div>
          <SheetFooter>
              <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Template</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
