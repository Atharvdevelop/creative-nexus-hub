import { usePublishedPosts } from '@/hooks/usePosts';
import BlogCard from '@/components/BlogCard';
import { Skeleton } from '@/components/ui/skeleton';

const FeedPage = () => {
  const { data: posts, isLoading } = usePublishedPosts();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 animate-reveal-up">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-1 text-balance" style={{ lineHeight: '1.15' }}>
          Your Feed
        </h1>
        <p className="text-muted-foreground text-sm">
          Ideas worth thinking about, from people worth following.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="py-8 border-b space-y-3">
              <div className="flex gap-3 items-center">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div>
          {posts.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-12 text-center">
          No articles yet. Be the first to publish something!
        </p>
      )}
    </div>
  );
};

export default FeedPage;
