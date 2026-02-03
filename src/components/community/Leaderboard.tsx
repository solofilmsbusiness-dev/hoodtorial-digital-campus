import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Heart, Award, Medal } from "lucide-react";
import { useCommunityLeaderboard, LeaderboardEntry } from "@/hooks/useCommunityLeaderboard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LeaderboardProps {
  period?: 'week' | 'month' | 'all';
}

function LeaderboardRow({ entry, type }: { entry: LeaderboardEntry; type: 'completers' | 'liked' }) {
  const getInitials = (name?: string | null) => {
    if (!name) return "S";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-amber-400" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-300" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-4 text-center">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-amber-500/10 border-amber-500/30";
    if (rank === 2) return "bg-gray-500/10 border-gray-500/30";
    if (rank === 3) return "bg-amber-700/10 border-amber-700/30";
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.05 }}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50",
        entry.rank <= 3 && getRankBg(entry.rank),
        entry.rank <= 3 && "border"
      )}
    >
      <div className="w-6 flex justify-center">
        {getRankIcon(entry.rank)}
      </div>
      
      <Avatar className="h-8 w-8 border border-border">
        <AvatarImage src={entry.avatar_url || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
          {getInitials(entry.display_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {entry.display_name || "Anonymous"}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-sm font-bold">
        {type === 'completers' ? (
          <>
            <Award className="h-4 w-4 text-primary" />
            <span>{entry.submission_count}</span>
          </>
        ) : (
          <>
            <Heart className="h-4 w-4 text-red-500" />
            <span>{entry.likes_received}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

export function Leaderboard({ period = 'week' }: LeaderboardProps) {
  const { topCompleters, topLiked, isLoading } = useCommunityLeaderboard(period);

  if (isLoading) {
    return (
      <Card className="card-urban">
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-6 h-6 bg-muted rounded" />
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 h-4 bg-muted rounded" />
                <div className="w-8 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-urban">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="completers" className="w-full">
          <TabsList className="w-full mb-4 bg-muted/50">
            <TabsTrigger value="completers" className="flex-1 gap-1.5 text-xs">
              <Award className="h-3.5 w-3.5" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex-1 gap-1.5 text-xs">
              <Heart className="h-3.5 w-3.5" />
              Most Liked
            </TabsTrigger>
          </TabsList>

          <TabsContent value="completers" className="mt-0 space-y-1">
            {topCompleters.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No challenge completers yet this week
              </p>
            ) : (
              topCompleters.map((entry) => (
                <LeaderboardRow key={entry.user_id} entry={entry} type="completers" />
              ))
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-0 space-y-1">
            {topLiked.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No liked posts yet this week
              </p>
            ) : (
              topLiked.map((entry) => (
                <LeaderboardRow key={entry.user_id} entry={entry} type="liked" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
