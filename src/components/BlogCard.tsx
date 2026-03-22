import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { BlogPost, getInitials, formatDate, formatCount } from '@/lib/mockData';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

const BlogCard = ({ post, index = 0 }: BlogCardProps) => {
  return (
    <article
      className="animate-reveal-up border-b last:border-b-0 py-8 first:pt-0"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex gap-3 items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
          {getInitials(post.author.fullName)}
        </div>
        <div className="min-w-0">
          <Link
            to={`/profile/${post.author.username}`}
            className="text-sm font-medium text-foreground hover:underline underline-offset-2"
          >
            {post.author.fullName}
          </Link>
          <p className="text-xs text-text-caption truncate">{post.author.headline}</p>
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
          <time>{formatDate(post.publishedDate!)}</time>
          <span>·</span>
          <span>{post.readTime} min read</span>
        </div>
        <div className="flex items-center gap-1 text-text-caption text-xs">
          <Heart className="w-3.5 h-3.5" />
          <span>{formatCount(post.claps)}</span>
        </div>
      </div>

      {post.tags.length > 0 && (
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
