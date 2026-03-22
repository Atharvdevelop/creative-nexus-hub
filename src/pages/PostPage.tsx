import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { mockPosts, getInitials, formatDate, formatCount } from '@/lib/mockData';

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = mockPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Post not found.</p>
        <Link to="/" className="text-text-link text-sm hover:underline mt-2 inline-block">Back to feed</Link>
      </div>
    );
  }

  const paragraphs = post.content.split('\n\n').filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <article className="animate-reveal-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
            {getInitials(post.author.fullName)}
          </div>
          <div>
            <Link to={`/profile/${post.author.username}`} className="text-sm font-medium text-foreground hover:underline">
              {post.author.fullName}
            </Link>
            <div className="text-xs text-text-caption">
              {post.publishedDate && formatDate(post.publishedDate)} · {post.readTime} min read
            </div>
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6 text-balance" style={{ lineHeight: '1.15' }}>
          {post.title}
        </h1>

        <div className="prose-content text-foreground/90">
          {paragraphs.map((para, i) => {
            if (para.startsWith('## ')) {
              return <h2 key={i}>{para.replace('## ', '')}</h2>;
            }
            if (para.startsWith('> ')) {
              return <blockquote key={i}>{para.replace('> ', '')}</blockquote>;
            }
            return <p key={i}>{para}</p>;
          })}
        </div>

        <div className="flex items-center gap-4 mt-10 pt-6 border-t">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors active:scale-95">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">{formatCount(post.claps)}</span>
          </button>
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {post.tags.map(tag => (
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
