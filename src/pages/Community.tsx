import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  PenSquare, 
  Search, 
  Users,
  MessageSquare,
  FolderOpen,
  Megaphone,
  Lightbulb,
  BookOpen
} from "lucide-react";
import { 
  PostCard, 
  CreatePostForm, 
  PostDetail,
  CommunityGuidelines 
} from "@/components/community";
import { useCommunityPosts, PostCategory, CommunityPost } from "@/hooks/useCommunityPosts";
import { useEnrollments } from "@/hooks/useEnrollments";
import { courses } from "@/data/courses";
import { cn } from "@/lib/utils";

export default function Community() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<PostCategory | "all">("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(false);

  const { activeEnrollments } = useEnrollments();
  const hasActiveEnrollment = activeEnrollments.length > 0;

  const { 
    posts, 
    isLoading, 
    createPost, 
    toggleLike, 
    toggleFollow,
    deletePost 
  } = useCommunityPosts(
    categoryFilter !== "all" ? { category: categoryFilter } : undefined
  );

  // Filter posts by search and course
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = courseFilter === "all" || post.course_code === courseFilter;
    
    return matchesSearch && matchesCourse;
  });

  // Get enrolled course codes for filtering
  const enrolledCourseCodes = activeEnrollments.map(e => e.course_code);
  const enrolledCourses = courses.filter(c => enrolledCourseCodes.includes(c.code));

  if (!hasActiveEnrollment) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h1 className="heading-2 text-foreground mb-4">Community Access Required</h1>
            <p className="text-muted-foreground mb-6">
              The Student Community is available to enrolled students only. 
              Enroll in a course to join discussions, share projects, and connect with peers.
            </p>
            <Button asChild className="btn-brutal">
              <a href="/academics">Browse Courses</a>
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (selectedPost) {
    const currentPost = posts.find(p => p.id === selectedPost.id) || selectedPost;
    return (
      <PageLayout>
        <div className="py-8 px-4">
          <div className="container-wide max-w-4xl mx-auto">
            <PostDetail
              post={currentPost}
              onBack={() => setSelectedPost(null)}
              onLike={() => toggleLike.mutate(currentPost.id)}
              onFollow={() => toggleFollow.mutate(currentPost.id)}
            />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-8 px-4">
        <div className="container-wide">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="heading-1 text-foreground mb-2">Student Community</h1>
              <p className="text-muted-foreground">
                Connect with peers, share projects, and give/receive professional feedback.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowGuidelines(!showGuidelines)}
              >
                Guidelines
              </Button>
              <Button 
                className="btn-brutal gap-2"
                onClick={() => setShowCreateForm(true)}
              >
                <PenSquare className="h-4 w-4" />
                New Post
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Guidelines (collapsible on mobile) */}
              {showGuidelines && (
                <CommunityGuidelines onClose={() => setShowGuidelines(false)} />
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Course filter */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                  Filter by Course
                </label>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {enrolledCourses.map((course) => (
                      <SelectItem key={course.code} value={course.code}>
                        {course.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick stats */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                <h4 className="font-bold text-sm text-foreground">Your Activity</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Courses</span>
                  <span className="font-bold text-primary">{activeEnrollments.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Community Posts</span>
                  <span className="font-bold">{posts.filter(p => p.user_id === posts[0]?.user_id).length}</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              {/* Create post form */}
              {showCreateForm && (
                <CreatePostForm
                  onSubmit={(data) => {
                    createPost.mutate(data, {
                      onSuccess: () => setShowCreateForm(false),
                    });
                  }}
                  onCancel={() => setShowCreateForm(false)}
                  isSubmitting={createPost.isPending}
                />
              )}

              {/* Category tabs */}
              <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as PostCategory | "all")}>
                <TabsList className="w-full justify-start mb-6 bg-muted/30 p-1 overflow-x-auto flex-nowrap">
                  <TabsTrigger value="all" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="general" className="gap-2">
                    <Users className="h-4 w-4" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="course_discussion" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Courses
                  </TabsTrigger>
                  <TabsTrigger value="project_submission" className="gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="feedback_critique" className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Critique
                  </TabsTrigger>
                  <TabsTrigger value="announcement" className="gap-2">
                    <Megaphone className="h-4 w-4" />
                    News
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={categoryFilter} className="mt-0">
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="animate-pulse">Loading posts...</div>
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-bold text-foreground mb-2">No posts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery 
                          ? "No posts match your search."
                          : "Be the first to start a discussion!"
                        }
                      </p>
                      {!searchQuery && (
                        <Button 
                          onClick={() => setShowCreateForm(true)}
                          className="btn-brutal"
                        >
                          Create First Post
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onLike={() => toggleLike.mutate(post.id)}
                          onFollow={() => toggleFollow.mutate(post.id)}
                          onDelete={() => deletePost.mutate(post.id)}
                          onClick={() => setSelectedPost(post)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
