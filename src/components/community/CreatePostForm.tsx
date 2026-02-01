import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PenSquare, X, Link as LinkIcon } from "lucide-react";
import { PostCategory } from "@/hooks/useCommunityPosts";
import { courses } from "@/data/courses";

interface CreatePostFormProps {
  onSubmit: (data: {
    title: string;
    content: string;
    category: PostCategory;
    course_code?: string;
    is_project_post?: boolean;
    video_url?: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CreatePostForm({ onSubmit, onCancel, isSubmitting }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("general");
  const [courseCode, setCourseCode] = useState<string>("");
  const [isProjectPost, setIsProjectPost] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      course_code: courseCode || undefined,
      is_project_post: isProjectPost,
      video_url: videoUrl || undefined,
    });
  };

  const showCourseSelect = category === "course_discussion" || category === "project_submission";

  return (
    <Card className="card-urban mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PenSquare className="h-5 w-5 text-primary" />
            Create New Post
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as PostCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Discussion</SelectItem>
                <SelectItem value="course_discussion">Course Discussion</SelectItem>
                <SelectItem value="project_submission">Project Submission</SelectItem>
                <SelectItem value="feedback_critique">Feedback & Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showCourseSelect && (
            <div className="space-y-2">
              <Label htmlFor="course">Associated Course</Label>
              <Select value={courseCode} onValueChange={setCourseCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No course</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.code} value={course.code}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your post a clear title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, questions, or work..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Video Link (optional)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="video"
                className="pl-10"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          </div>

          {(category === "project_submission" || category === "feedback_critique") && (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
              <div>
                <Label htmlFor="project-post" className="font-bold">
                  Request Structured Feedback
                </Label>
                <p className="text-sm text-muted-foreground">
                  Prompt commenters to provide "What works / What could improve / Suggestion"
                </p>
              </div>
              <Switch
                id="project-post"
                checked={isProjectPost}
                onCheckedChange={setIsProjectPost}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !content.trim() || isSubmitting}
              className="btn-brutal"
            >
              {isSubmitting ? "Posting..." : "Post to Community"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
