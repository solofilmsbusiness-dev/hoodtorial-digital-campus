import { CommunityPost, CommentPreview } from "@/hooks/useCommunityPosts";
import { FeedCard } from "./FeedCard";
import { TimelinePost } from "./TimelinePost";
import { motion } from "framer-motion";

interface FeedGridProps {
  posts: CommunityPost[];
  variant: 'grid' | 'feed' | 'timeline';
  onLike: (postId: string) => void;
  onSave?: (postId: string) => void;
  onClick: (post: CommunityPost) => void;
}

export function FeedGrid({ posts, variant, onLike, onSave, onClick }: FeedGridProps) {
  if (variant === 'timeline') {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TimelinePost
              post={post}
              onLike={() => onLike(post.id)}
              onSave={() => onSave?.(post.id)}
              onClick={() => onClick(post)}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'feed') {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <FeedCard
              post={post}
              variant="feed"
              onLike={() => onLike(post.id)}
              onClick={() => onClick(post)}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
        >
          <FeedCard
            post={post}
            variant="grid"
            onLike={() => onLike(post.id)}
            onClick={() => onClick(post)}
          />
        </motion.div>
      ))}
    </div>
  );
}
