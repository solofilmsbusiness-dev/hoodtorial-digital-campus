import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pin,
  Star,
  Trash2,
  Search,
  MessageSquare,
  Heart,
  Filter,
  Image as ImageIcon,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminCommunity, AdminPost } from "@/hooks/useAdminCommunity";
import { PostCategory } from "@/hooks/useCommunityPosts";

const categoryLabels: Record<PostCategory, string> = {
  general: "General",
  course_discussion: "Course",
  project_submission: "Project",
  feedback_critique: "Critique",
  announcement: "Announcement",
};

const categoryColors: Record<PostCategory, string> = {
  general: "bg-muted text-muted-foreground",
  course_discussion: "bg-accent/20 text-accent",
  project_submission: "bg-primary/20 text-primary",
  feedback_critique: "bg-purple-500/20 text-purple-400",
  announcement: "bg-destructive/20 text-destructive",
};

export default function CommunityManager() {
  const { posts, isLoading, togglePin, toggleHighlight, deletePost } = useAdminCommunity();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "pinned" && post.is_pinned) ||
      (statusFilter === "highlighted" && post.is_highlighted) ||
      (statusFilter === "regular" && !post.is_pinned && !post.is_highlighted);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const stats = {
    total: posts.length,
    pinned: posts.filter(p => p.is_pinned).length,
    highlighted: posts.filter(p => p.is_highlighted).length,
    announcements: posts.filter(p => p.category === "announcement").length,
  };

  return (
    <AdminLayout title="Community Moderation" description="Manage posts, pin announcements, and highlight exemplary content" pageKey="community">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{stats.pinned}</div>
              <p className="text-sm text-muted-foreground">Pinned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-500">{stats.highlighted}</div>
              <p className="text-sm text-muted-foreground">Highlighted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-destructive">{stats.announcements}</div>
              <p className="text-sm text-muted-foreground">Announcements</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts by title, content, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="course_discussion">Course</SelectItem>
                  <SelectItem value="project_submission">Project</SelectItem>
                  <SelectItem value="feedback_critique">Critique</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pinned">Pinned</SelectItem>
                  <SelectItem value="highlighted">Highlighted</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Posts ({filteredPosts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading posts...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No posts found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Post</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Engagement</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id} className={cn(
                        post.is_pinned && "bg-primary/5",
                        post.is_highlighted && "bg-amber-500/5"
                      )}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium line-clamp-1">
                              {post.title}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {post.content}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                              </span>
                              {post.media_urls.length > 0 && (
                                <span className="flex items-center text-xs text-muted-foreground">
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  {post.media_urls.length}
                                </span>
                              )}
                              {post.video_url && (
                                <Film className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.author?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(post.author?.display_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {post.author?.display_name || "Anonymous"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", categoryColors[post.category])}>
                            {categoryLabels[post.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.comments_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {post.is_pinned && (
                              <Badge variant="outline" className="text-xs border-primary text-primary">
                                <Pin className="h-3 w-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                            {post.is_highlighted && (
                              <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Featured
                              </Badge>
                            )}
                            {!post.is_pinned && !post.is_highlighted && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant={post.is_pinned ? "default" : "outline"}
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => togglePin.mutate({ postId: post.id, isPinned: post.is_pinned })}
                              disabled={togglePin.isPending}
                              title={post.is_pinned ? "Unpin post" : "Pin post"}
                            >
                              <Pin className={cn("h-4 w-4", post.is_pinned && "fill-current")} />
                            </Button>
                            <Button
                              variant={post.is_highlighted ? "default" : "outline"}
                              size="icon"
                              className={cn(
                                "h-8 w-8",
                                post.is_highlighted && "bg-amber-500 hover:bg-amber-600"
                              )}
                              onClick={() => toggleHighlight.mutate({ postId: post.id, isHighlighted: post.is_highlighted })}
                              disabled={toggleHighlight.isPending}
                              title={post.is_highlighted ? "Remove highlight" : "Highlight post"}
                            >
                              <Star className={cn("h-4 w-4", post.is_highlighted && "fill-current")} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  title="Delete post"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{post.title}"? This action cannot be undone and will also delete all comments on this post.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deletePost.mutate(post.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
