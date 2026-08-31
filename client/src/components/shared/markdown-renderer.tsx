import {
  isValidElement,
  type ComponentProps,
  type InputHTMLAttributes,
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

type LiProps = Omit<ComponentProps<'li'>, 'children'> & { children?: ReactNode };
type CodeProps = ComponentProps<'code'>;
type PProps = ComponentProps<'p'>;

function Li({ className: liClassName, children, ...props }: LiProps) {
  const childArray: ReactNode[] = Array.isArray(children) ? children : [children];
  const [checkboxEl, ...restChildren] = childArray;
  const isCheckbox =
    typeof checkboxEl === 'object' &&
    checkboxEl !== null &&
    isValidElement<InputHTMLAttributes<HTMLInputElement>>(checkboxEl) &&
    checkboxEl.props.type === 'checkbox';

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
      className={cn('text-sm text-foreground/90 leading-relaxed pl-1 my-0.5', liClassName)}
      {...props}
    >
      {children}
    </li>
  );
}

function Code({ className: codeClassName, children }: CodeProps) {
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
}

function MarkdownInput({ className: inputClassName, checked, type }: ComponentProps<'input'>) {
  if (type === 'checkbox') {
    return (
      <Checkbox checked={checked} disabled className={cn(inputClassName, 'mt-0.5 shrink-0')} />
    );
  }
  return null;
}

function Anchor({ children, href }: ComponentProps<'a'>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline cursor-pointer hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  );
}

function Blockquote({ children }: ComponentProps<'blockquote'>) {
  return (
    <blockquote className="border-l-2 border-primary/80 pl-4 py-1 my-2.5 italic text-muted-foreground bg-primary/5 rounded-r-lg">
      {children}
    </blockquote>
  );
}

function Mark({ children }: ComponentProps<'mark'>) {
  return (
    <mark className="bg-yellow-200/80 dark:bg-yellow-500/30 text-foreground dark:text-yellow-200 px-1 py-0.5 rounded-sm font-medium">
      {children}
    </mark>
  );
}

function H3({ children }: ComponentProps<'h3'>) {
  return (
    <h3 className="text-base font-semibold mt-2.5 mb-1 text-foreground tracking-tight">
      {children}
    </h3>
  );
}

function Ol({ children }: ComponentProps<'ol'>) {
  return (
    <ol className="list-decimal marker:text-muted-foreground mb-2 pl-5 space-y-0.5">{children}</ol>
  );
}

function H2({ children }: ComponentProps<'h2'>) {
  return (
    <h2 className="text-lg font-bold mt-3 mb-1.5 text-foreground tracking-tight">{children}</h2>
  );
}

function Ul({ children }: ComponentProps<'ul'>) {
  return (
    <ul className="list-disc marker:text-muted-foreground mb-2 pl-5 space-y-0.5">{children}</ul>
  );
}

function H1({ children }: ComponentProps<'h1'>) {
  return <h1 className="text-xl font-bold mt-4 mb-2 text-foreground tracking-tight">{children}</h1>;
}

function P({ children }: PProps) {
  return <p className="text-sm text-foreground/90 mb-2 leading-relaxed last:mb-0">{children}</p>;
}

function Strong({ children }: ComponentProps<'strong'>) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

function Del({ children }: ComponentProps<'del'>) {
  return <del className="line-through opacity-70">{children}</del>;
}

function Em({ children }: ComponentProps<'em'>) {
  return <em className="italic">{children}</em>;
}

const MARKDOWN_COMPONENTS = {
  li: Li,
  code: Code,
  input: MarkdownInput,
  a: Anchor,
  blockquote: Blockquote,
  mark: Mark,
  h3: H3,
  ol: Ol,
  h2: H2,
  ul: Ul,
  h1: H1,
  p: P,
  strong: Strong,
  del: Del,
  em: Em,
} as const;

export default function MarkdownRenderer({ className, content }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={className}>
      <Markdown remarkPlugins={[remarkGfm, remarkHighlight]} components={MARKDOWN_COMPONENTS}>
        {content}
      </Markdown>
    </div>
  );
}
