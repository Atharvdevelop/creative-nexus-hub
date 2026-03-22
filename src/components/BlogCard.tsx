import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { PostWithAuthor } from '@/hooks/usePosts';

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

interface BlogCardProps {
  post: PostWithAuthor;
  index?: number;
}

const BlogCard = ({ post, index = 0 }: BlogCardProps) => {
  const authorName = post.author?.full_name ?? 'Unknown';

  return (
    <article
      className="animate-reveal-up border-b last:border-b-0 py-8 first:pt-0"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex gap-3 items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
          {getInitials(authorName)}
        </div>
        <div className="min-w-0">
          {post.author?.username ? (
            <Link
              to={`/profile/${post.author.username}`}
              className="text-sm font-medium text-foreground hover:underline underline-offset-2"
            >
              {authorName}
            </Link>
          ) : (
            <span className="text-sm font-medium text-foreground">{authorName}</span>
          )}
          <p className="text-xs text-text-caption truncate">{post.author?.headline ?? ''}</p>
        </div>
      </div>

      <Link to={`/post/${post.slug}`} className="group block">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug text-balance">
          {post.title}
        </h2>
        <p className="text-muted-foreground text-[15px] leading-relaxed line-clamp-2 text-pretty mb-4">
          {post.excerpt}
        </p>
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-text-caption">
          <time>{post.published_date ? formatDate(post.published_date) : ''}</time>
          <span>·</span>
          <span>{post.read_time} min read</span>
        </div>
        <div className="flex items-center gap-1 text-text-caption text-xs">
          <Heart className="w-3.5 h-3.5" />
          <span>{formatCount(post.claps ?? 0)}</span>
        </div>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default BlogCard;
