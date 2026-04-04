import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { usePostBySlug } from '@/hooks/usePosts';
import { usePostLikes, useHasLiked, useToggleLike } from '@/hooks/useLikes';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePostBySlug(slug);
  const { user } = useAuth();
  const { data: likeCount = 0 } = usePostLikes(post?.id);
  const { data: hasLiked = false } = useHasLiked(post?.id, user?.id);
  const toggleLike = useToggleLike(post?.id ?? '');

  const handleLike = () => {
    if (!user) { toast.error('Sign in to like posts'); return; }
    toggleLike.mutate({ userId: user.id, liked: hasLiked });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-4 w-16" />
        <div className="flex gap-3 items-center">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Post not found.</p>
        <Link to="/" className="text-text-link text-sm hover:underline mt-2 inline-block">Back to feed</Link>
      </div>
    );
  }

  const paragraphs = (post.content ?? '').split('\n\n').filter(Boolean);
  const authorName = post.author?.full_name ?? 'Unknown';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <article className="animate-reveal-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
            {getInitials(authorName)}
          </div>
          <div>
            {post.author?.username ? (
              <Link to={`/profile/${post.author.username}`} className="text-sm font-medium text-foreground hover:underline">
                {authorName}
              </Link>
            ) : (
              <span className="text-sm font-medium text-foreground">{authorName}</span>
            )}
            <div className="text-xs text-text-caption">
              {post.published_date && formatDate(post.published_date)} · {post.read_time} min read
            </div>
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6 text-balance" style={{ lineHeight: '1.15' }}>
          {post.title}
        </h1>

        <div className="prose-content text-foreground/90">
          {paragraphs.map((para, i) => {
            if (para.startsWith('## ')) return <h2 key={i}>{para.replace('## ', '')}</h2>;
            if (para.startsWith('> ')) return <blockquote key={i}>{para.replace('> ', '')}</blockquote>;
            return <p key={i}>{para}</p>;
          })}
        </div>

        <div className="flex items-center gap-4 mt-10 pt-6 border-t">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors active:scale-95">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">{formatCount(post.claps ?? 0)}</span>
          </button>
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {(post.tags ?? []).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostPage;
