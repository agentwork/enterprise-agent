"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DataChartProps {
  data: Record<string, unknown>[];
  title?: string;
  xAxisKey?: string;
  barKey?: string;
}

export function DataChart({ data, title, xAxisKey, barKey }: DataChartProps) {
  if (!data || data.length === 0) {
    return <div className="p-4 text-gray-500 italic">No data to display.</div>;
  }

  // Infer keys if not provided
  const keys = Object.keys(data[0]);
  const xKey = xAxisKey || keys.find(k => k.toLowerCase().includes("name") || k.toLowerCase().includes("date")) || keys[0];
  const bKey = barKey || keys.find(k => typeof data[0][k] === "number") || keys[1];

  if (!bKey) {
      return (
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                      <tr>
                          {keys.map(key => (
                              <th key={key} className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">{key}</th>
                          ))}
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((row, i) => (
                          <tr key={i}>
                              {keys.map(key => (
                                  <td key={key} className="px-3 py-2 whitespace-nowrap text-gray-900">{String(row[key])}</td>
                              ))}
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      );
  }

  return (
    <div className="w-full h-64 p-4 border rounded bg-white shadow-sm">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey={bKey} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
