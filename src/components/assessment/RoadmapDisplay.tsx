import { CheckCircle2, Circle, Clock, GraduationCap, Rocket, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { courses } from "@/data/courses";
import { cn } from "@/lib/utils";
import type { LearningRoadmap } from "@/hooks/useAssessmentResults";

interface RoadmapDisplayProps {
  roadmap: LearningRoadmap;
  completedCourses?: string[];
}

const phaseIcons = {
  Foundation: BookOpen,
  "Core Skills": GraduationCap,
  Specialization: Rocket,
};

const phaseColors = {
  Foundation: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  "Core Skills": "bg-primary/10 text-primary border-primary/30",
  Specialization: "bg-amber-500/10 text-amber-500 border-amber-500/30",
};

export function RoadmapDisplay({ roadmap, completedCourses = [] }: RoadmapDisplayProps) {
  const navigate = useNavigate();

  const getCourseDetails = (code: string) => {
    return courses.find((c) => c.code === code);
  };

  const isCompleted = (code: string) => completedCourses.includes(code);

  return (
    <div className="space-y-6">
      {/* Roadmap Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Your Personalized Learning Roadmap</h3>
              <p className="text-sm text-muted-foreground">
                {roadmap.phases.length} phases • {roadmap.totalWeeks} weeks estimated
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Primary: {roadmap.primaryStrength.replace("-", " ")}
              </Badge>
              {roadmap.secondaryStrength && (
                <Badge variant="outline" className="text-xs">
                  Secondary: {roadmap.secondaryStrength.replace("-", " ")}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Timeline */}
      <div className="relative space-y-6 pl-8">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />

        {roadmap.phases.map((phase, phaseIndex) => {
          const PhaseIcon = phaseIcons[phase.name as keyof typeof phaseIcons] || Circle;
          const colorClass = phaseColors[phase.name as keyof typeof phaseColors] || "";
          const phaseCompleted = phase.courses.every((code) => isCompleted(code));

          return (
            <div key={phase.name} className="relative">
              {/* Phase marker */}
              <div
                className={cn(
                  "absolute -left-5 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-background",
                  phaseCompleted ? "border-primary bg-primary/10" : "border-muted-foreground/30"
                )}
              >
                {phaseCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">{phaseIndex + 1}</span>
                )}
              </div>

              <Card className={cn("ml-4", phaseCompleted && "opacity-75")}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg border", colorClass)}>
                        <PhaseIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{phase.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{phase.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      ~{phase.estimatedWeeks} weeks
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {phase.courses.map((code) => {
                      const course = getCourseDetails(code);
                      if (!course) return null;
                      const completed = isCompleted(code);

                      return (
                        <div
                          key={code}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-colors",
                            completed
                              ? "bg-primary/5 border-primary/20"
                              : "bg-muted/30 border-border hover:border-primary/30"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {completed ? (
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <div>
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  completed && "text-muted-foreground line-through"
                                )}
                              >
                                {course.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{course.code}</span>
                                <span>•</span>
                                <span>{course.level}</span>
                                <span>•</span>
                                <span>{course.duration}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={completed ? "ghost" : "outline"}
                            size="sm"
                            onClick={() => navigate(`/course/${course.code}`)}
                          >
                            {completed ? "Review" : "View"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Areas to Improve Hint */}
      {roadmap.areasToImprove.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-amber-500/10">
                <BookOpen className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Focus Areas</p>
                <p className="text-xs text-muted-foreground">
                  Based on your assessment, consider extra practice in:{" "}
                  {roadmap.areasToImprove.map((a) => a.replace("-", " ")).join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
