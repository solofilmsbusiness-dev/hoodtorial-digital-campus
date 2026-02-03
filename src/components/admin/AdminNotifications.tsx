import { useState } from "react";
import { Bell, Clock, UserPlus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminPendingItems } from "@/hooks/useAdminActivity";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const { pendingItems, totalCount, isLoading } = useAdminPendingItems();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalCount > 9 ? "9+" : totalCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <h4 className="font-semibold">Notifications</h4>
          <p className="text-sm text-muted-foreground">
            Items requiring your attention
          </p>
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingItems.map((item) => (
                <div key={item.type} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {item.type === "trial_expiring" ? (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <UserPlus className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-medium text-sm">
                      {item.type === "trial_expiring"
                        ? `${item.count} trial${item.count > 1 ? "s" : ""} expiring soon`
                        : `${item.count} new signup${item.count > 1 ? "s" : ""} today`}
                    </span>
                  </div>
                  <div className="space-y-1 ml-7">
                    {item.items.slice(0, 3).map((user, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-muted-foreground flex items-center justify-between"
                      >
                        <span className="truncate">
                          {user.displayName || "Anonymous"}
                        </span>
                        <span className="text-xs shrink-0 ml-2">
                          {item.type === "trial_expiring" && user.expiresAt
                            ? formatDistanceToNow(new Date(user.expiresAt), {
                                addSuffix: true,
                              })
                            : item.type === "new_signup" && user.signedUpAt
                            ? formatDistanceToNow(new Date(user.signedUpAt), {
                                addSuffix: true,
                              })
                            : ""}
                        </span>
                      </div>
                    ))}
                    {item.items.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{item.items.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-between"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link to="/admin/users">
              View all users
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
