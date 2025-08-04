
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
import React, { useState } from 'react';

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

const upcomingMeetings: Meeting[] = [
    {
        lead: "Alex Johnson",
        company: "Innovate Inc.",
        time: "Tomorrow, 10:00 AM",
        date: "2024-10-28",
        briefing: {
            title: "Demo for Innovate Inc.",
            summary: "Alex was very interested in the AI discovery tool after the initial call. He mentioned their current lead profiling process is manual and time-consuming. He's particularly interested in seeing how ProspectorAI can optimize for conversion likelihood.",
            talkingPoints: [
                "Focus on the automated persona discovery feature.",
                "Highlight the multi-channel campaign generation (he mentioned they struggle with call outreach).",
                "Be prepared to discuss integration with their existing CRM (HubSpot)."
            ]
        }
    },
    {
        lead: "Brenda Smith",
        company: "Solutions LLC",
        time: "Wednesday, 2:30 PM",
        date: "2024-10-30",
        briefing: {
            title: "Follow-up with Solutions LLC",
            summary: "Brenda replied to the third follow-up email. She's skeptical about AI call agents sounding 'robotic'. Her main pain point is the time her team spends on cold calling with low success rates.",
            talkingPoints: [
                "Start by addressing the 'robotic voice' concern; perhaps have a sample ready.",
                "Showcase the 'Not Interested' reasons feature to prove ROI on time saved.",
                "Emphasize that only confirmed meetings are routed to a human, saving her team's time."
            ]
        }
    },
    {
        lead: "Carlos Gomez",
        company: "Synergy Corp",
        time: "Friday, 11:00 AM",
        date: "2024-11-01",
        briefing: {
            title: "Partnership Discussion with Synergy Corp",
            summary: "Carlos is a VP of Business Development. He's not the direct user but is interested in how ProspectorAI could be a value-add for their portfolio companies. He wants to understand the core value proposition.",
            talkingPoints: [
                "Keep the pitch high-level, focused on business outcomes (increased sales pipeline, reduced CAC).",
                "Explain the problem of sales team inefficiency clearly.",
                "Frame ProspectorAI as a competitive advantage for their companies."
            ]
        }
    }
]

export default function CalendarPage() {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleViewBriefing = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsSheetOpen(true);
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
              {upcomingMeetings.map((meeting, index) => (
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
              ))}
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
