import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface AIInsight {
  category: string;
  observation: string;
  recommendation: string;
}

interface AIInsightsResponse {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  insights: AIInsight[];
  suggestedActions: string[];
}

interface AIInsightsPanelProps {
  studentName: string;
  studentId: string;
}

function getRiskLevelBadge(level: "low" | "medium" | "high") {
  switch (level) {
    case "low":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">🟢 Low Risk</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">🟡 Medium Risk</Badge>;
    case "high":
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">🔴 High Risk</Badge>;
  }
}

export function AIInsightsPanel({ 
  studentName, 
  studentId, 
}: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("student-insights", {
        body: {
          userId: studentId,
          studentName,
        },
      });

      if (fnError) throw fnError;
      setInsights(data);
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
      setError("Failed to generate insights. Please try again.");
      toast.error("Failed to generate AI insights");
    } finally {
      setIsLoading(false);
    }
  };

  if (!insights && !isLoading && !error) {
    return (
      <div className="p-4 rounded-lg border border-dashed bg-muted/30 text-center space-y-3">
        <Sparkles className="h-8 w-8 mx-auto text-primary/50" />
        <div>
          <p className="font-medium">AI Learning Insights</p>
          <p className="text-sm text-muted-foreground">
            Get personalized recommendations based on this student's learning patterns
          </p>
        </div>
        <Button onClick={fetchInsights} size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Get AI Insights
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 animate-pulse text-primary" />
          <span className="font-medium">Analyzing learning patterns...</span>
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={fetchInsights} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-medium">AI Learning Insights</h4>
        </div>
        <Button onClick={fetchInsights} variant="ghost" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Risk Level & Summary */}
      <div className="p-4 rounded-lg bg-muted/50 space-y-3">
        <div className="flex items-center gap-2">
          {getRiskLevelBadge(insights.riskLevel)}
        </div>
        <p className="text-sm">{insights.summary}</p>
      </div>

      {/* Insights */}
      {insights.insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Recommendations
          </p>
          <div className="space-y-2">
            {insights.insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-muted/30 border space-y-1"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {insight.category}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ {insight.observation}
                </p>
                <p className="text-sm text-muted-foreground">
                  → {insight.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Actions */}
      {insights.suggestedActions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Suggested Actions
          </p>
          <div className="space-y-1.5">
            {insights.suggestedActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
