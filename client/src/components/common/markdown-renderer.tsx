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

export default function MarkdownRenderer({
  className,
  content,
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          li: ({ className, children, ...props }) => {
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
                    'flex items-start gap-2 list-none -ml-5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-1',
                    className,
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
                  'text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-1',
                  className,
                )}
                {...props}
              >
                {children}
              </li>
            );
          },
          input: ({ className, checked, type }) => {
            if (type === 'checkbox') {
              return (
                <Checkbox
                  checked={checked}
                  disabled
                  className={cn(className, 'mt-0.5 shrink-0')}
                />
              );
            }
            return null;
          },
          code: ({ children }) => (
            <code className="text-[11px] font-tag px-1.5 py-0.5 rounded bg-zinc-100/80 dark:bg-zinc-900/80 text-primary dark:text-secondary">
              {children}
            </code>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
              {children}
            </strong>
          ),
          p: ({ children }) => (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {children}
            </p>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal marker:text-primary space-y-2 pl-5">
              {children}
            </ol>
          ),
          ul: ({ children }) => (
            <ul className="list-disc marker:text-primary space-y-2 pl-5">
              {children}
            </ul>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-600 dark:text-zinc-400">
              {children}
            </em>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
