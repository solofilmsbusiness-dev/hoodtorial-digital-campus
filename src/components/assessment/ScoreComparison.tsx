import { TrendingUp, TrendingDown, Minus, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScoreComparisonProps {
  previousScores: Record<string, number>;
  currentScores: Record<string, number>;
  previousTotal: number;
  currentTotal: number;
}

const departmentLabels: Record<string, string> = {
  cinematography: "Cinematography",
  "post-production": "Post-Production",
  directing: "Directing",
  production: "Production",
  photography: "Photography",
  "camera-systems": "Camera Systems",
};

function ScoreChange({ previous, current }: { previous: number; current: number }) {
  const diff = current - previous;
  
  if (diff > 0) {
    return (
      <div className="flex items-center gap-1 text-green-500">
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm font-bold">+{diff}%</span>
      </div>
    );
  }
  
  if (diff < 0) {
    return (
      <div className="flex items-center gap-1 text-red-500">
        <TrendingDown className="w-4 h-4" />
        <span className="text-sm font-bold">{diff}%</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Minus className="w-4 h-4" />
      <span className="text-sm">No change</span>
    </div>
  );
}

export function ScoreComparison({ 
  previousScores, 
  currentScores, 
  previousTotal, 
  currentTotal 
}: ScoreComparisonProps) {
  const totalDiff = currentTotal - previousTotal;
  const isImproved = totalDiff > 0;
  const hasDeclined = totalDiff < 0;
  
  // Get all departments from both scores
  const allDepartments = [...new Set([
    ...Object.keys(previousScores),
    ...Object.keys(currentScores)
  ])];

  return (
    <div className="space-y-6">
      {/* Overall Score Comparison */}
      <Card className={cn(
        "border-2",
        isImproved ? "border-green-500/50 bg-green-500/5" : 
        hasDeclined ? "border-red-500/50 bg-red-500/5" : 
        "border-primary/50 bg-primary/5"
      )}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Previous</div>
              <div className="text-3xl font-bold text-muted-foreground">{previousTotal}%</div>
            </div>
            
            <div className="flex flex-col items-center">
              {isImproved ? (
                <>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <span className="text-lg font-bold text-green-500">+{totalDiff}%</span>
                </>
              ) : hasDeclined ? (
                <>
                  <TrendingDown className="w-8 h-8 text-red-500" />
                  <span className="text-lg font-bold text-red-500">{totalDiff}%</span>
                </>
              ) : (
                <>
                  <Minus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Same</span>
                </>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Current</div>
              <div className="text-3xl font-bold text-primary">{currentTotal}%</div>
            </div>
          </div>
          
          {isImproved && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-500">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Great improvement!</span>
              </div>
            </div>
          )}
          
          {hasDeclined && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground">
                <Target className="w-5 h-5" />
                <span className="font-medium">Keep practicing—you've got this!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Department Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allDepartments.map((dept) => {
            const prev = previousScores[dept] ?? 0;
            const curr = currentScores[dept] ?? 0;
            const label = departmentLabels[dept] || dept;
            
            return (
              <div key={dept} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{label}</div>
                  <div className="flex items-center gap-3 mt-1">
                    {/* Progress bars */}
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                      {/* Previous score (ghost) */}
                      <div 
                        className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-full"
                        style={{ width: `${prev}%` }}
                      />
                      {/* Current score */}
                      <div 
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all",
                          curr > prev ? "bg-green-500" : 
                          curr < prev ? "bg-red-500" : 
                          "bg-primary"
                        )}
                        style={{ width: `${curr}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-sm text-muted-foreground w-12 text-right">
                    {prev}%
                  </div>
                  <div className="text-sm font-medium w-12 text-right">
                    {curr}%
                  </div>
                  <div className="w-20">
                    <ScoreChange previous={prev} current={curr} />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
