import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

type MarkdownProps = { className?: string; children: string };

const components: Components = {
  ul: ({ children }) => <ul style={{ paddingLeft: 24, margin: '4px 0 8px 0' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: 24, margin: '4px 0 8px 0' }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
  p: ({ children }) => <p style={{ marginBottom: 0 }}>{children}</p>,
} as const;

export const Markdown = ({ className, children }: MarkdownProps) => (
  <div className={className}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
      {children}
    </ReactMarkdown>
  </div>
);
