import { mockPosts } from '@/lib/mockData';
import BlogCard from '@/components/BlogCard';

const FeedPage = () => {
  const published = mockPosts.filter(p => p.status === 'published');

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

      <div>
        {published.map((post, i) => (
          <BlogCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;
