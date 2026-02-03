import { useAdminActivity } from "@/hooks/useAdminActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  UserPlus,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const activityIcons = {
  enrollment: BookOpen,
  quiz_pass: CheckCircle2,
  quiz_fail: XCircle,
  post: MessageSquare,
  signup: UserPlus,
};

const activityColors = {
  enrollment: "text-blue-500 bg-blue-500/10",
  quiz_pass: "text-green-500 bg-green-500/10",
  quiz_fail: "text-red-500 bg-red-500/10",
  post: "text-purple-500 bg-purple-500/10",
  signup: "text-yellow-500 bg-yellow-500/10",
};

export function ActivityFeed() {
  const { activities, isLoading } = useAdminActivity();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </div>
        <CardDescription>Last 7 days of platform activity</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-6">
          {isLoading ? (
            <div className="space-y-4 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-1 py-2">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type];
                const colorClass = activityColors[activity.type];

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.userDisplayName || "User"}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {activity.description}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
