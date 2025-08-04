
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

export default function Dashboard() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState({
        activeCampaigns: 0,
        meetingsScheduled: 0,
        leadsContacted: 0,
        successRate: 0,
    });
    const [chartData, setChartData] = useState([
      { month: 'January', meetings: 0, contacted: 0 },
      { month: 'February', meetings: 0, contacted: 0 },
      { month: 'March', meetings: 0, contacted: 0 },
      { month: 'April', meetings: 0, contacted: 0 },
      { month: 'May', meetings: 0, contacted: 0 },
      { month: 'June', meetings: 0, contacted: 0 },
    ]);


    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedCampaigns = localStorage.getItem('campaigns');
        const loadedCampaigns = savedCampaigns ? JSON.parse(savedCampaigns) : [];
        setCampaigns(loadedCampaigns);

        const activeCampaigns = loadedCampaigns.filter((c: Campaign) => c.status === 'Active').length;
        
        // These would be replaced with real data fetching in a production app
        const meetingsScheduled = 3; 
        const leadsContacted = 25;
        const successRate = leadsContacted > 0 ? Math.round((meetingsScheduled / leadsContacted) * 100) : 0;

        setStats({
            activeCampaigns,
            meetingsScheduled,
            leadsContacted,
            successRate,
        });

        // Mock chart data based on some metrics
        const newChartData = [
            { month: 'January', meetings: 12, contacted: 90 },
            { month: 'February', meetings: 19, contacted: 120 },
            { month: 'March', meetings: 25, contacted: 150 },
            { month: 'April', meetings: 22, contacted: 180 },
            { month: 'May', meetings: 31, contacted: 210 },
            { month: 'June', meetings: meetingsScheduled, contacted: leadsContacted },
        ];
        setChartData(newChartData);

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
