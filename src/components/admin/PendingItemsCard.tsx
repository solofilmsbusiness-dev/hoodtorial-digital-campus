import { useAdminPendingItems } from "@/hooks/useAdminActivity";
import { usePendingWaitlistCount } from "@/hooks/useWaitlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, UserPlus, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function PendingItemsCard() {
  const { pendingItems, totalCount, isLoading } = useAdminPendingItems();
  const pendingWaitlistCount = usePendingWaitlistCount();
  const totalWithWaitlist = totalCount + pendingWaitlistCount;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(totalWithWaitlist > 0 && "border-yellow-500/50")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Pending Items
          </CardTitle>
          {totalWithWaitlist > 0 && (
            <span className="text-sm font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
              {totalWithWaitlist}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {totalWithWaitlist === 0 ? (
          <p className="text-sm text-muted-foreground">
            ✓ No pending items right now
          </p>
        ) : (
          <ul className="space-y-2">
            {pendingWaitlistCount > 0 && (
              <li>
                <Link
                  to="/admin/waitlist"
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Users className="h-4 w-4 text-primary" />
                  <span>
                    {pendingWaitlistCount} waitlist {pendingWaitlistCount === 1 ? "entry" : "entries"} pending
                  </span>
                </Link>
              </li>
            )}
            {pendingItems.map((item) => (
              <li key={item.type}>
                <Link
                  to="/admin/users"
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  {item.type === "trial_expiring" ? (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <UserPlus className="h-4 w-4 text-green-500" />
                  )}
                  <span>
                    {item.type === "trial_expiring"
                      ? `${item.count} trial${item.count > 1 ? "s" : ""} expiring in 3 days`
                      : `${item.count} new signup${item.count > 1 ? "s" : ""} today`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
