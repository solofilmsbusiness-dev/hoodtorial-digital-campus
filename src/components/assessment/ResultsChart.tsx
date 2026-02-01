import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface DepartmentScore {
  department: string;
  score: number;
  fullMark: number;
}

interface ResultsChartProps {
  scores: Record<string, number>;
}

const departmentLabels: Record<string, string> = {
  cinematography: "Cinematography",
  "post-production": "Post-Production",
  directing: "Directing",
  production: "Production",
  photography: "Photography",
  "camera-systems": "Camera Systems",
};

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
};

export function ResultsChart({ scores }: ResultsChartProps) {
  const data: DepartmentScore[] = Object.entries(scores).map(([dept, score]) => ({
    department: departmentLabels[dept] || dept,
    score: Math.round(score),
    fullMark: 100,
  }));

  if (data.length === 0) {
    return null;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="department"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
