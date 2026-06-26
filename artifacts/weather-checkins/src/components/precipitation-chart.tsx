import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { HourlyPrecip } from "@/hooks/use-weather";

interface Props {
  data: HourlyPrecip[];
  currentChance: number;
}

const getBarColor = (prob: number) => {
  if (prob >= 70) return "#3b82f6";
  if (prob >= 40) return "#60a5fa";
  if (prob >= 20) return "#93c5fd";
  return "#bfdbfe";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 text-sm shadow-md">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-primary">{payload[0].value}% chance of rain</p>
      </div>
    );
  }
  return null;
};

export function PrecipitationChart({ data, currentChance }: Props) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground text-base">Precipitation</h3>
        <span className="text-2xl font-display font-extrabold text-primary">{currentChance}%</span>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }} barSize={14}>
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.4)" }} />
            <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.probability)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-4">Loading precipitation data...</p>
      )}

      <p className="text-xs text-muted-foreground mt-2 text-center">Next 12 hours</p>
    </div>
  );
}
