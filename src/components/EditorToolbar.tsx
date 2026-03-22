import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Code, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({ onClick, active, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      {children}
    </button>
  );
}

interface EditorToolbarProps {
  onAction: (action: string) => void;
  activeFormats: Record<string, boolean>;
}

const EditorToolbar = ({ onAction, activeFormats }: EditorToolbarProps) => {
  const iconSize = 'w-4 h-4';

  return (
    <div className="flex items-center gap-0.5 p-2 border-b flex-wrap">
      <ToolbarButton onClick={() => onAction('bold')} active={activeFormats.bold} title="Bold">
        <Bold className={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAction('italic')} active={activeFormats.italic} title="Italic">
        <Italic className={iconSize} />
      </ToolbarButton>
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarButton onClick={() => onAction('h2')} active={activeFormats.h2} title="Heading 2">
        <Heading2 className={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAction('h3')} active={activeFormats.h3} title="Heading 3">
        <Heading3 className={iconSize} />
      </ToolbarButton>
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarButton onClick={() => onAction('bulletList')} active={activeFormats.bulletList} title="Bullet List">
        <List className={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAction('orderedList')} active={activeFormats.orderedList} title="Numbered List">
        <ListOrdered className={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAction('blockquote')} active={activeFormats.blockquote} title="Quote">
        <Quote className={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAction('code')} active={activeFormats.code} title="Code">
        <Code className={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAction('hr')} title="Divider">
        <Minus className={iconSize} />
      </ToolbarButton>
    </div>
  );
};

export default EditorToolbar;
