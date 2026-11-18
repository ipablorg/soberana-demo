import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="text-lg font-heading font-bold text-foreground mt-4 mb-2 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-heading font-semibold text-foreground mt-3 mb-1.5">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-foreground/90 leading-relaxed mb-2 last:mb-0 wrap-break-word">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-muted-foreground italic">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="text-sm text-foreground/90 space-y-1 mb-2 ml-4 list-disc">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-sm text-foreground/90 space-y-1 mb-2 ml-4 list-decimal">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-sm text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-border/50 max-w-full">
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted/50 text-muted-foreground">{children}</thead>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-border/30">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-muted/20 transition-colors">{children}</tr>,
  th: ({ children }) => (
    <th className="px-2 py-2 text-left font-semibold text-foreground text-xs">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 text-foreground/80 wrap-break-word text-xs">{children}</td>
  ),
  code: ({ className, children }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-muted/60 text-primary text-xs px-1.5 py-0.5 rounded font-mono break-all">
          {children}
        </code>
      );
    }
    return (
      <code className="block bg-muted/40 text-foreground/90 text-xs p-3 rounded-lg overflow-x-auto font-mono my-2 leading-relaxed max-w-full break-all">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="my-2 max-w-full overflow-x-auto">{children}</pre>,
  hr: () => <hr className="border-border/30 my-3" />,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};

interface OsMarkdownRendererProps {
  content: string;
}

export function OsMarkdownRenderer({ content }: OsMarkdownRendererProps) {
  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
