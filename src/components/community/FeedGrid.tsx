import { CommunityPost } from "@/hooks/useCommunityPosts";
import { FeedCard } from "./FeedCard";
import { motion } from "framer-motion";

interface FeedGridProps {
  posts: CommunityPost[];
  variant: 'grid' | 'feed';
  onLike: (postId: string) => void;
  onClick: (post: CommunityPost) => void;
}

export function FeedGrid({ posts, variant, onLike, onClick }: FeedGridProps) {
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
