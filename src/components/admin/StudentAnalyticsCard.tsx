import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LearningMetrics } from "@/hooks/useStudentAnalytics";

interface StudentAnalyticsCardProps {
  metrics: LearningMetrics;
}

function formatWatchTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getTrendIcon(trend: "improving" | "declining" | "stable") {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "declining":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}

function getEngagementColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-yellow-500";
  if (score >= 20) return "text-orange-500";
  return "text-red-500";
}

function getProgressColor(value: number): string {
  if (value >= 80) return "bg-green-500";
  if (value >= 60) return "bg-blue-500";
  if (value >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export function StudentAnalyticsCard({ metrics }: StudentAnalyticsCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        <h4 className="font-medium">Learning Analytics</h4>
      </div>

      {/* Engagement Score */}
      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Engagement Score</span>
          <Badge variant="outline" className={getEngagementColor(metrics.engagementScore)}>
            {metrics.engagementLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Progress 
            value={metrics.engagementScore} 
            className="flex-1 h-3"
          />
          <span className={cn("font-bold text-lg", getEngagementColor(metrics.engagementScore))}>
            {metrics.engagementScore}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Watch Percentage */}
        <div className="p-3 rounded-lg bg-muted/50 text-center space-y-1">
          <span className="text-2xl font-bold">{metrics.avgWatchPercentage}%</span>
          <div className={cn("h-1.5 rounded-full mx-auto w-12", getProgressColor(metrics.avgWatchPercentage))} />
          <p className="text-xs text-muted-foreground">Watch %</p>
        </div>

        {/* Completion Rate */}
        <div className="p-3 rounded-lg bg-muted/50 text-center space-y-1">
          <span className="text-2xl font-bold">{metrics.lessonCompletionRate}%</span>
          <div className={cn("h-1.5 rounded-full mx-auto w-12", getProgressColor(metrics.lessonCompletionRate))} />
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>

        {/* Quiz Average */}
        <div className="p-3 rounded-lg bg-muted/50 text-center space-y-1">
          <span className="text-2xl font-bold">{metrics.averageQuizScore}%</span>
          <div className={cn("h-1.5 rounded-full mx-auto w-12", getProgressColor(metrics.averageQuizScore))} />
          <p className="text-xs text-muted-foreground">Quiz Avg</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
          <span className="text-sm text-muted-foreground">Last Active</span>
          <span className="text-sm font-medium">
            {metrics.lastActivityDaysAgo !== null
              ? metrics.lastActivityDaysAgo === 0
                ? "Today"
                : metrics.lastActivityDaysAgo === 1
                ? "Yesterday"
                : `${metrics.lastActivityDaysAgo} days ago`
              : "No activity"}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Total Watch Time
          </span>
          <span className="text-sm font-medium">
            {formatWatchTime(metrics.totalWatchTimeMinutes)}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
          <span className="text-sm text-muted-foreground">Quiz Trend</span>
          <div className="flex items-center gap-1.5">
            {getTrendIcon(metrics.quizScoreTrend)}
            <span className="text-sm font-medium capitalize">{metrics.quizScoreTrend}</span>
          </div>
        </div>
      </div>

      {/* Idle Courses Warning */}
      {metrics.coursesWithNoProgress.length > 0 && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Idle Courses
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enrolled but no progress: {metrics.coursesWithNoProgress.join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
