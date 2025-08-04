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
  SheetTrigger,
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

const templates = [
  {
    name: 'Initial Outreach',
    subject: 'Quick question about {{companyName}}',
    lastUpdated: '2023-10-25',
  },
  {
    name: 'Follow-up 1',
    subject: 'Re: Quick question',
    lastUpdated: '2023-10-26',
  },
  {
    name: 'Meeting Confirmation',
    subject: 'Confirmation: Your meeting with ProspectorAI',
    lastUpdated: '2023-10-20',
  },
  {
    name: 'Break-up Email',
    subject: 'Closing the loop',
    lastUpdated: '2023-09-18',
  },
];

export default function TemplatesPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Create and manage your reusable email templates.
          </CardDescription>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              New Template
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New Template</SheetTitle>
              <SheetDescription>
                Design a new template with personalization tokens.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input id="template-name" placeholder="e.g., Initial Outreach" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Quick question about {{companyName}}"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  rows={10}
                  placeholder="Hi {{firstName}}, ..."
                />
                <p className="text-xs text-muted-foreground">
                  Use tokens like `{{firstName}}`, `{{lastName}}`, `{{companyName}}` for personalization.
                </p>
              </div>
            </div>
            <Button type="submit">Save Template</Button>
          </SheetContent>
        </Sheet>
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
              <TableRow key={template.name}>
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
