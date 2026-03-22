import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditorToolbar from '@/components/EditorToolbar';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePost } from '@/hooks/usePosts';
import { toast } from 'sonner';

const EditorPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const createPost = useCreatePost();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [activeFormats] = useState<Record<string, boolean>>({});

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleToolbarAction = (action: string) => {
    const insertions: Record<string, string> = {
      bold: '**bold text**',
      italic: '*italic text*',
      h2: '\n## Heading\n',
      h3: '\n### Subheading\n',
      bulletList: '\n- Item\n- Item\n',
      orderedList: '\n1. Item\n2. Item\n',
      blockquote: '\n> Quote\n',
      code: '`code`',
      hr: '\n---\n',
    };
    if (insertions[action]) {
      setContent(prev => prev + insertions[action]);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }
    try {
      const post = await createPost.mutateAsync({ title, content, status });
      toast.success(status === 'draft' ? 'Draft saved' : 'Published!');
      if (status === 'published') {
        navigate(`/post/${post.slug}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    }
  };

  const renderPreview = () => {
    const paragraphs = content.split('\n\n').filter(Boolean);
    return (
      <div className="prose-content text-foreground/90 min-h-[300px]">
        {paragraphs.length === 0 && (
          <p className="text-muted-foreground italic">Nothing to preview yet…</p>
        )}
        {paragraphs.map((para, i) => {
          if (para.startsWith('## ')) return <h2 key={i}>{para.replace('## ', '')}</h2>;
          if (para.startsWith('### ')) return <h3 key={i}>{para.replace('### ', '')}</h3>;
          if (para.startsWith('> ')) return <blockquote key={i}>{para.replace('> ', '')}</blockquote>;
          if (para.startsWith('---')) return <hr key={i} className="my-8 border-border" />;
          return <p key={i}>{para}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 animate-reveal-up">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="text-muted-foreground"
          >
            {isPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSave('draft')} disabled={createPost.isPending}>
            Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave('published')} disabled={createPost.isPending}>
            Publish
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm animate-reveal-up" style={{ animationDelay: '100ms' }}>
        {!isPreview && (
          <EditorToolbar onAction={handleToolbarAction} activeFormats={activeFormats} />
        )}
        <div className="p-6 sm:p-8">
          {isPreview ? (
            <h1 className="font-serif text-3xl font-bold text-foreground mb-6 text-balance" style={{ lineHeight: '1.15' }}>
              {title || 'Untitled'}
            </h1>
          ) : (
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full font-serif text-3xl font-bold text-foreground placeholder:text-muted-foreground/40 bg-transparent border-0 outline-none mb-6"
              style={{ lineHeight: '1.15' }}
            />
          )}

          {isPreview ? (
            renderPreview()
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tell your story…"
              className="w-full min-h-[400px] text-[17px] leading-relaxed font-serif text-foreground/90 placeholder:text-muted-foreground/40 bg-transparent border-0 outline-none resize-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
