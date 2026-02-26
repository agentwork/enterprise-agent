"use client";

import { useMemo } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ActivityVolumeMetric } from "../types";

interface ActivityTrendChartProps {
  data: ActivityVolumeMetric[];
}

const COLORS: Record<string, string> = {
  call: "#0088FE",
  email: "#00C49F",
  meeting: "#FFBB28",
  note: "#FF8042",
  task: "#8884d8",
};

export function ActivityTrendChart({ data }: ActivityTrendChartProps) {
  const chartData = useMemo(() => {
    const grouped: Record<string, Record<string, string | number>> = {};
    data.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = { date: item.date };
      }
      grouped[item.date][item.type] = item.count;
    });
    
    // Get all unique types
    const types = Array.from(new Set(data.map(d => d.type)));
    
    // Convert to array and sort
    return Object.values(grouped).map(item => {
      types.forEach(type => {
        if (!item[type]) item[type] = 0;
      });
      return item;
    }).sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
  }, [data]);

  const activityTypes = useMemo(() => Array.from(new Set(data.map(d => d.type))), [data]);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Activity Trends (30 Days)</h3>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              {activityTypes.map((type) => (
                <Line 
                  key={type} 
                  type="monotone" 
                  dataKey={type} 
                  stroke={COLORS[type] || "#000000"} 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
