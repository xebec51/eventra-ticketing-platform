"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const palette = ["#231942", "#d46d42", "#ffcb69", "#1dd3b0", "#5f6caf", "#c0d6df"];

export function StatusPieChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: { label: string; value: number }[];
}) {
  return (
    <Card className="border border-black/5 bg-white/90">
      <CardHeader>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={52}
                outerRadius={92}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={palette[index % palette.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((entry, index) => (
            <div
              key={entry.label}
              className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: palette[index % palette.length] }}
                />
                <span className="text-sm font-medium text-slate-900">
                  {entry.label}
                </span>
              </div>
              <span className="font-semibold text-slate-950">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricBarChart({
  title,
  description,
  data,
  dataKey,
}: {
  title: string;
  description: string;
  data: { label: string; value: number }[];
  dataKey?: string;
}) {
  return (
    <Card className="border border-black/5 bg-white/90">
      <CardHeader>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={data.length > 4 ? -18 : 0}
                textAnchor={data.length > 4 ? "end" : "middle"}
                height={data.length > 4 ? 64 : 40}
              />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar
                dataKey={dataKey ?? "value"}
                radius={[10, 10, 0, 0]}
                fill="#231942"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
