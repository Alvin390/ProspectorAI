import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import React from 'react';

const upcomingMeetings = [
    {
        lead: "Alex Johnson",
        company: "Innovate Inc.",
        time: "Tomorrow, 10:00 AM",
        date: "2024-10-28"
    },
    {
        lead: "Brenda Smith",
        company: "Solutions LLC",
        time: "Wednesday, 2:30 PM",
        date: "2024-10-30"
    },
    {
        lead: "Carlos Gomez",
        company: "Synergy Corp",
        time: "Friday, 11:00 AM",
        date: "2024-11-01"
    }
]

export default function CalendarPage() {
  return (
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
                     <Button variant="outline" size="sm">View Briefing</Button>
                </div>
                {index < upcomingMeetings.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
