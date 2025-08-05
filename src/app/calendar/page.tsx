
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import React, { useState, useMemo } from 'react';
import { useData } from '../data-provider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Meeting {
    lead: string;
    company: string;
    time: string;
    date: string;
    briefing: {
        title: string;
        summary: string;
        talkingPoints: string[];
    }
}

// This will now be used as a template for generating dynamic meeting briefings.
const briefingTemplates = [
    {
        title: "Demo for {company}",
        summary: "{lead} was very interested in the AI discovery tool after the initial call. They mentioned their current lead profiling process is manual and time-consuming. They are particularly interested in seeing how ProspectorAI can optimize for conversion likelihood.",
        talkingPoints: [
            "Focus on the automated persona discovery feature.",
            "Highlight the multi-channel campaign generation.",
            "Be prepared to discuss integration with their existing CRM."
        ]
    },
    {
        title: "Follow-up with {company}",
        summary: "{lead} replied to the third follow-up email. They're skeptical about AI call agents sounding 'robotic'. Their main pain point is the time their team spends on cold calling with low success rates.",
        talkingPoints: [
            "Start by addressing the 'robotic voice' concern; perhaps have a sample ready.",
            "Showcase the 'Not Interested' reasons feature to prove ROI on time saved.",
            "Emphasize that only confirmed meetings are routed to a human."
        ]
    },
];

export default function CalendarPage() {
  const { allCallLogs, isLoading } = useData();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const upcomingMeetings = useMemo(() => {
    if (isLoading) return [];
    
    const meetings = allCallLogs
        .filter(log => log.status === 'Meeting Booked')
        .map((log, index) => {
            const leadName = log.leadIdentifier.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const companyName = log.campaignName;
            const template = briefingTemplates[index % briefingTemplates.length]; // Cycle through templates
            
            const meetingDate = new Date();
            meetingDate.setDate(meetingDate.getDate() + index + 2); // Set meeting for future days

            return {
                lead: leadName,
                company: companyName,
                time: `In ${index + 2} days`, // Placeholder time
                date: meetingDate.toISOString(),
                briefing: {
                    title: template.title.replace('{company}', companyName),
                    summary: template.summary.replace('{lead}', leadName),
                    talkingPoints: template.talkingPoints
                }
            };
        });

    // Sort meetings by date
    return meetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [allCallLogs, isLoading]);

  const handleViewBriefing = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsSheetOpen(true);
  }

  if (isLoading) {
      return <div>Loading calendar...</div>
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>
                Your schedule is automatically updated with confirmed meetings.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMeetings.length > 0 ? upcomingMeetings.map((meeting, index) => (
                <div key={index}>
                  <div className="flex flex-col space-y-1.5">
                      <div className='flex justify-between items-center'>
                          <h3 className="font-semibold">{meeting.lead}</h3>
                          <span className="text-sm text-muted-foreground">{meeting.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{meeting.company}</p>
                       <Button variant="outline" size="sm" onClick={() => handleViewBriefing(meeting)}>View Briefing</Button>
                  </div>
                  {index < upcomingMeetings.length - 1 && <Separator className="my-4" />}
                </div>
              )) : (
                <Alert>
                    <CalendarIcon className="h-4 w-4" />
                    <AlertTitle>No Meetings Scheduled</AlertTitle>
                    <AlertDescription>
                        When the AI successfully books a meeting, it will appear here automatically.
                    </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
             {selectedMeeting && (
                <>
                    <SheetHeader>
                        <SheetTitle>{selectedMeeting.briefing.title}</SheetTitle>
                        <SheetDescription>
                           A pre-meeting briefing for your call with {selectedMeeting.lead} from {selectedMeeting.company}.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                       <div className="space-y-2">
                           <h4 className="font-semibold">AI Summary</h4>
                           <p className="text-sm text-muted-foreground">
                               {selectedMeeting.briefing.summary}
                           </p>
                       </div>
                       <Separator />
                        <div className="space-y-2">
                           <h4 className="font-semibold">Key Talking Points</h4>
                           <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                               {selectedMeeting.briefing.talkingPoints.map((point, i) => (
                                   <li key={i}>{point}</li>
                               ))}
                           </ul>
                       </div>
                    </div>
                </>
             )}
          </SheetContent>
      </Sheet>
    </>
  );
}
