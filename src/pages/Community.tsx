import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plus,
  Filter,
  X
} from "lucide-react";
import { 
  PostCard, 
  CreatePostForm, 
  PostDetail,
  CommunityGuidelines,
  DailyChallengeCard,
  FeedGrid,
  ViewToggle,
  StreakBadge,
  Leaderboard,
} from "@/components/community";
import { ViewMode } from "@/components/community/ViewToggle";
import { useCommunityPosts, PostCategory, CommunityPost } from "@/hooks/useCommunityPosts";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { useChallengeStreak } from "@/hooks/useChallengeStreak";
import { useEnrollments } from "@/hooks/useEnrollments";
import { courses } from "@/data/courses";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Community() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<PostCategory | "all">("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);

  const { activeEnrollments } = useEnrollments();
  const hasActiveEnrollment = activeEnrollments.length > 0;

  const { 
    todaysChallenge, 
    hasSubmittedToday, 
    submitChallenge,
    isLoading: isChallengeLoading 
  } = useDailyChallenges();

  const { streakData, checkStreakBonuses } = useChallengeStreak();

  // Check for streak bonuses on load
  useEffect(() => {
    checkStreakBonuses();
  }, [streakData.currentStreak]);

  const { 
    posts, 
    isLoading, 
    createPost, 
    toggleLike, 
    toggleFollow,
    deletePost 
  } = useCommunityPosts(
    categoryFilter !== "all" 
      ? { 
          category: categoryFilter,
          following_only: viewMode === 'following'
        } 
      : { following_only: viewMode === 'following' }
  );

  // Filter posts by search and course
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = courseFilter === "all" || post.course_code === courseFilter;
    
    return matchesSearch && matchesCourse;
  });

  // Sort: prioritize posts with media for grid view
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    // Pinned posts first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    // In grid mode, prioritize posts with media
    if (viewMode === 'grid') {
      const aHasMedia = a.media_urls.length > 0 || a.video_url;
      const bHasMedia = b.media_urls.length > 0 || b.video_url;
      if (aHasMedia && !bHasMedia) return -1;
      if (!aHasMedia && bHasMedia) return 1;
    }
    
    // Then by date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Get enrolled course codes for filtering
  const enrolledCourseCodes = activeEnrollments.map(e => e.course_code);
  const enrolledCourses = courses.filter(c => enrolledCourseCodes.includes(c.code));

  const handleChallengeSubmit = () => {
    setIsSubmittingChallenge(true);
    setShowCreateForm(true);
  };

  const handlePostSubmit = async (data: any) => {
    if (isSubmittingChallenge && todaysChallenge) {
      // Create post with challenge_id
      createPost.mutate({
        ...data,
        challenge_id: todaysChallenge.id,
      }, {
        onSuccess: (post) => {
          // Submit to challenge and award credits
          submitChallenge.mutate({
            challengeId: todaysChallenge.id,
            postId: post.id,
            creditsReward: todaysChallenge.credits_reward,
          });
          setShowCreateForm(false);
          setIsSubmittingChallenge(false);
        },
      });
    } else {
      createPost.mutate(data, {
        onSuccess: () => setShowCreateForm(false),
      });
    }
  };

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
      <div className="py-6 px-4">
        <div className="container-wide">
          {/* Daily Challenge Card */}
          <div className="mb-6">
            <DailyChallengeCard
              challenge={todaysChallenge}
              hasSubmitted={hasSubmittedToday}
              currentStreak={streakData.currentStreak}
              onSubmit={handleChallengeSubmit}
              isLoading={isChallengeLoading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Hidden on mobile, shown on lg */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              {/* Streak Badge */}
              <StreakBadge
                currentStreak={streakData.currentStreak}
                longestStreak={streakData.longestStreak}
                totalSubmissions={streakData.totalSubmissions}
                variant="detailed"
              />

              {/* Leaderboard */}
              <Leaderboard period="week" />

              {/* Guidelines */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowGuidelines(!showGuidelines)}
              >
                Community Guidelines
              </Button>
              {showGuidelines && (
                <CommunityGuidelines onClose={() => setShowGuidelines(false)} />
              )}
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              {/* Mobile Header with controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-foreground">Feed</h1>
                  <StreakBadge
                    currentStreak={streakData.currentStreak}
                    longestStreak={streakData.longestStreak}
                    totalSubmissions={streakData.totalSubmissions}
                    variant="compact"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <ViewToggle value={viewMode} onChange={setViewMode} />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>

                  <Button 
                    className="btn-brutal gap-2"
                    onClick={() => {
                      setIsSubmittingChallenge(false);
                      setShowCreateForm(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Post</span>
                  </Button>
                </div>
              </div>

              {/* Mobile filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden lg:hidden mb-4"
                  >
                    <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm">Filters</h3>
                        <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search posts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="course_discussion">Courses</SelectItem>
                            <SelectItem value="project_submission">Projects</SelectItem>
                            <SelectItem value="feedback_critique">Critique</SelectItem>
                            <SelectItem value="announcement">News</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={courseFilter} onValueChange={setCourseFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Course" />
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Desktop search & filters */}
              <div className="hidden lg:flex items-center gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="course_discussion">Courses</SelectItem>
                    <SelectItem value="project_submission">Projects</SelectItem>
                    <SelectItem value="feedback_critique">Critique</SelectItem>
                    <SelectItem value="announcement">News</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {enrolledCourses.map((course) => (
                      <SelectItem key={course.code} value={course.code}>
                        {course.code} – {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Create post form */}
              <AnimatePresence>
                {showCreateForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <CreatePostForm
                      onSubmit={handlePostSubmit}
                      onCancel={() => {
                        setShowCreateForm(false);
                        setIsSubmittingChallenge(false);
                      }}
                      isSubmitting={createPost.isPending}
                      challengeId={isSubmittingChallenge ? todaysChallenge?.id : undefined}
                      challengeTitle={isSubmittingChallenge ? todaysChallenge?.title : undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Posts */}
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="animate-pulse">Loading posts...</div>
                </div>
              ) : sortedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-bold text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {viewMode === 'following' 
                      ? "You're not following any posts yet."
                      : searchQuery 
                        ? "No posts match your search."
                        : "Be the first to start a discussion!"}
                  </p>
                  {!searchQuery && viewMode !== 'following' && (
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="btn-brutal"
                    >
                      Create First Post
                    </Button>
                  )}
                </div>
              ) : viewMode === 'grid' || viewMode === 'following' ? (
                <FeedGrid
                  posts={sortedPosts}
                  variant={viewMode === 'following' ? 'feed' : 'grid'}
                  onLike={(postId) => toggleLike.mutate(postId)}
                  onClick={(post) => setSelectedPost(post)}
                />
              ) : (
                <FeedGrid
                  posts={sortedPosts}
                  variant="feed"
                  onLike={(postId) => toggleLike.mutate(postId)}
                  onClick={(post) => setSelectedPost(post)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <Button
          size="lg"
          className="btn-brutal h-14 w-14 rounded-full shadow-lg"
          onClick={() => {
            setIsSubmittingChallenge(false);
            setShowCreateForm(true);
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </PageLayout>
  );
}
