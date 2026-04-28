import { useState, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditorToolbar from '@/components/EditorToolbar';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePost } from '@/hooks/usePosts';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const EditorPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const createPost = useCreatePost();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [activeFormats] = useState<Record<string, boolean>>({});
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleToolbarAction = (action: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const formats: Record<string, [string, string]> = {
      bold: ['**', '**'],
      italic: ['*', '*'],
      h2: ['\n## ', '\n'],
      h3: ['\n### ', '\n'],
      bulletList: ['\n- ', '\n'],
      orderedList: ['\n1. ', '\n'],
      blockquote: ['\n> ', '\n'],
      code: ['`', '`'],
      hr: ['\n---\n', ''],
    };

    if (formats[action]) {
      const [prefix, suffix] = formats[action];
      const textToWrap = selectedText || `${action} text`;
      const newContent = before + prefix + textToWrap + suffix + after;
      
      setContent(newContent);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + prefix.length;
        const newEndPos = newCursorPos + textToWrap.length;
        textarea.setSelectionRange(newCursorPos, newEndPos);
      }, 0);
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

  // --- DAY 3 FIXED RENDERER ---
  const renderPreview = () => {
    return (
      <div className="prose prose-stone dark:prose-invert max-w-none min-h-[300px] animate-reveal-up">
        {content ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          <p className="text-muted-foreground italic">Nothing to preview yet…</p>
        )}
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
              ref={textareaRef}
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