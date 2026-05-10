import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Variant = 'card' | 'modal';

export function MarkdownView({ source, variant }: { source: string; variant: Variant }) {
  return (
    <div className={`markdown ${variant === 'card' ? 'markdown--card' : 'markdown--modal'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={
          variant === 'card'
            ? {
                img: () => null,
                table: () => null,
              }
            : undefined
        }
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
