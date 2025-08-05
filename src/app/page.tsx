
"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';
import type { ChartConfig } from '@/components/ui/chart';
import type { Campaign } from './campaigns/page';
import type { CallLog } from './calling/page';
import type { EmailLog } from './email/page';


const chartConfig = {
  meetings: {
    label: 'Meetings Booked',
    color: 'hsl(var(--primary))',
  },
  contacted: {
    label: 'Leads Contacted',
    color: 'hsl(var(--secondary))',
  },
} satisfies ChartConfig;

const mockMeetings = [
    { lead: "Alex Johnson" },
    { lead: "Brenda Smith" },
    { lead: "Carlos Gomez" }
];


export default function Dashboard() {
    const [stats, setStats] = useState({
        activeCampaigns: 0,
        meetingsScheduled: 0,
        leadsContacted: 0,
        successRate: 0,
    });
    const [chartData, setChartData] = useState([
      { month: 'January', meetings: 12, contacted: 90 },
      { month: 'February', meetings: 19, contacted: 120 },
      { month: 'March', meetings: 25, contacted: 150 },
      { month: 'April', meetings: 22, contacted: 180 },
      { month: 'May', meetings: 31, contacted: 210 },
      { month: 'June', meetings: 0, contacted: 0 },
    ]);


    useEffect(() => {
        const updateDashboard = () => {
            if (typeof window === 'undefined') return;

            const savedCampaigns = localStorage.getItem('campaigns');
            const loadedCampaigns: Campaign[] = savedCampaigns ? JSON.parse(savedCampaigns) : [];
            
            const activeCampaigns = loadedCampaigns.filter((c: Campaign) => c.status === 'Active').length;
            
            const callLogs: CallLog[] = JSON.parse(localStorage.getItem('allCallLogs') || '[]');
            const emailLogs: EmailLog[] = JSON.parse(localStorage.getItem('allEmailLogs') || '[]');
            
            // In a real app, meeting status would come from the calendar or CRM.
            // For now, we'll count calls with "Meeting Booked" status.
            const meetingsScheduled = callLogs.filter(log => log.status === 'Meeting Booked').length;
            
            const callLeads = callLogs.map(l => l.leadIdentifier);
            const emailLeads = emailLogs.map(l => l.leadIdentifier);
            const allContactedLeads = new Set([...callLeads, ...emailLeads]);
            const leadsContacted = allContactedLeads.size;

            const successRate = leadsContacted > 0 ? Math.round((meetingsScheduled / leadsContacted) * 100) : 0;

            setStats({
                activeCampaigns,
                meetingsScheduled,
                leadsContacted,
                successRate,
            });

            // Update current month's chart data with live stats
            setChartData(prevData => {
                const newData = [...prevData];
                const currentMonthIndex = newData.findIndex(d => d.month === 'June');
                if (currentMonthIndex !== -1) {
                    newData[currentMonthIndex] = { 
                        ...newData[currentMonthIndex], 
                        meetings: meetingsScheduled, 
                        contacted: leadsContacted 
                    };
                }
                return newData;
            });
        }
        
        updateDashboard();
        window.addEventListener('storage', updateDashboard);
        return () => window.removeEventListener('storage', updateDashboard);

    }, []);


  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Currently running outreach
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meetings Scheduled
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.meetingsScheduled}</div>
            <p className="text-xs text-muted-foreground">
              From active campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Contacted</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leadsContacted}</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Meeting booked / contacted
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>
            Showing performance for the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="meetings" fill="var(--color-meetings)" radius={4} />
              <Bar
                dataKey="contacted"
                fill="var(--color-contacted)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
