import {
  isValidElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import Markdown from 'react-markdown';

import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

import { Checkbox } from '@/components/ui/checkbox';

interface MarkdownRendererProps {
  className?: string;
  content: string;
}

interface ASTNode {
  data?: {
    [key: string]: unknown;
    hName?: string;
  };
  children?: ASTNode[];
  value?: string;
  type: string;
}

function remarkHighlight() {
  return (tree: ASTNode) => {
    const visitNodes = (node: ASTNode): void => {
      if (!node.children || !Array.isArray(node.children)) return;

      const newChildren: ASTNode[] = [];
      for (const child of node.children) {
        if (child.type === 'text' && typeof child.value === 'string') {
          const regex = /==([^=]+)==/g;
          let lastIndex = 0;
          let match: RegExpExecArray | null;

          while ((match = regex.exec(child.value)) !== null) {
            if (match.index > lastIndex) {
              newChildren.push({
                value: child.value.slice(lastIndex, match.index),
                type: 'text',
              });
            }
            newChildren.push({
              children: [{ value: match[1], type: 'text' }],
              data: { hName: 'mark' },
              type: 'mark',
            });
            lastIndex = regex.lastIndex;
          }

          if (lastIndex < child.value.length) {
            newChildren.push({
              value: child.value.slice(lastIndex),
              type: 'text',
            });
          }
        } else {
          visitNodes(child);
          newChildren.push(child);
        }
      }
      node.children = newChildren;
    };

    visitNodes(tree);
  };
}

export default function MarkdownRenderer({
  className,
  content,
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkHighlight]}
        components={{
          // Render List Items & Checkbox
          li: ({ className: liClassName, children, ...props }) => {
            const childArray = Array.isArray(children) ? children : [children];
            const [checkboxEl, ...restChildren] = childArray as ReactNode[];
            const castedCheckboxEl = checkboxEl as ReactElement<
              InputHTMLAttributes<HTMLInputElement>
            >;
            const isCheckbox =
              isValidElement(castedCheckboxEl) &&
              castedCheckboxEl.props.type === 'checkbox';

            if (isCheckbox)
              return (
                <li
                  className={cn(
                    'flex items-start gap-2 list-none -ml-5 text-sm text-foreground/90 leading-relaxed pl-1 my-0.5',
                    liClassName,
                  )}
                  {...props}
                >
                  {checkboxEl}
                  <span className="flex-1 min-w-0">{restChildren}</span>
                </li>
              );

            return (
              <li
                className={cn(
                  'text-sm text-foreground/90 leading-relaxed pl-1 my-0.5',
                  liClassName,
                )}
                {...props}
              >
                {children}
              </li>
            );
          },

          // Render Inline Code & Code Block
          code: ({ className: codeClassName, children }) => {
            const isBlock = codeClassName?.includes('language-');
            if (isBlock) {
              return (
                <pre className="bg-neutral-900 text-neutral-100 p-3 rounded-lg overflow-x-auto text-xs font-mono my-2 border border-border/40">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="font-body bg-neutral-100 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded text-xs text-primary font-medium border border-border/40">
                {children}
              </code>
            );
          },

          input: ({ className: inputClassName, checked, type }) => {
            if (type === 'checkbox') {
              return (
                <Checkbox
                  checked={checked}
                  disabled
                  className={cn(inputClassName, 'mt-0.5 shrink-0')}
                />
              );
            }
            return null;
          },
          // Render Link
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline cursor-pointer hover:opacity-80 transition-opacity"
            >
              {children}
            </a>
          ),
          // Render Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/80 pl-4 py-1 my-2.5 italic text-muted-foreground bg-primary/5 rounded-r-lg">
              {children}
            </blockquote>
          ),

          // Render Highlight (==text==)
          mark: ({ children }) => (
            <mark className="bg-yellow-200/80 dark:bg-yellow-500/30 text-foreground dark:text-yellow-200 px-1 py-0.5 rounded-sm font-medium">
              {children}
            </mark>
          ),

          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-2.5 mb-1 text-foreground tracking-tight">
              {children}
            </h3>
          ),

          ol: ({ children }) => (
            <ol className="list-decimal marker:text-muted-foreground mb-2 pl-5 space-y-0.5">
              {children}
            </ol>
          ),

          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-3 mb-1.5 text-foreground tracking-tight">
              {children}
            </h2>
          ),

          ul: ({ children }) => (
            <ul className="list-disc marker:text-muted-foreground mb-2 pl-5 space-y-0.5">
              {children}
            </ul>
          ),

          // Render Headings (h1, h2, h3)
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 text-foreground tracking-tight">
              {children}
            </h1>
          ),

          p: ({ children }) => (
            <p className="text-sm text-foreground/90 mb-2 leading-relaxed last:mb-0">
              {children}
            </p>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),

          // Render Strikethrough (~~text~~)
          del: ({ children }) => (
            <del className="line-through opacity-70">{children}</del>
          ),

          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
