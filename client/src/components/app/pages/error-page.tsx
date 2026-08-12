import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { StatusCodes } from 'http-status-codes';
import { toast } from 'sonner';

import { useGoToCompanion } from '@/features/companion/hooks/use-go-to-companion';

import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

import {
  ArrowLeft,
  RotateCcw,
  Home,
  LogIn,
  ChevronDown,
  ChevronUp,
  Bot,
  Terminal,
  CopyIcon,
  CheckIcon,
} from 'lucide-react';

export interface ErrorPageProps {
  statusCode?: StatusCodes;
  customMessage?: string;
  customTitle?: string;
  reset?: () => void;
  error?: Error;
}

type ErrorCategory = 'unauthorized' | 'not_found' | 'server_error';

interface ErrorDetail {
  description: () => string;
  category: ErrorCategory;
  title: () => string;
}

const ERROR_CONFIG: Partial<Record<StatusCodes, ErrorDetail>> = {
  [StatusCodes.UNAUTHORIZED]: {
    description: () => m.error_page_desc_401(),
    title: () => m.error_page_title_401(),
    category: 'unauthorized',
  },
  [StatusCodes.FORBIDDEN]: {
    description: () => m.error_page_desc_403(),
    title: () => m.error_page_title_403(),
    category: 'unauthorized',
  },
  [StatusCodes.NOT_FOUND]: {
    description: () => m.error_page_desc_404(),
    title: () => m.error_page_title_404(),
    category: 'not_found',
  },
};

const DEFAULT_ERROR_CONFIG: ErrorDetail = {
  description: () => m.error_page_desc_default(),
  title: () => m.error_page_title_default(),
  category: 'server_error',
};

export default function ErrorPage({
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  customMessage,
  customTitle,
  error,
  reset,
}: ErrorPageProps) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const goToCompanion = useGoToCompanion();

  const activeConfig = ERROR_CONFIG[statusCode] ?? DEFAULT_ERROR_CONFIG;

  const title = customTitle || activeConfig.title();
  const description = customMessage || activeConfig.description();

  const goToHome = () => {
    navigate({
      to: '/notes',
    });
  };

  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  const handleCopyError = async () => {
    if (!error) return;

    const errorText = `${error.name || m.error_page_error_fallback()}: ${error.message || String(error)}\n${error.stack || ''}`;
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      toast.success(m.error_page_toast_copy_success());
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(m.error_page_toast_copy_failed());
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground select-none">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-8 animate-in fade-in duration-300">
        {/* Status Code Typography */}
        <div className="space-y-2">
          <span className="font-mono text-7xl font-light tracking-tighter text-muted-foreground/30">
            {statusCode}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Actions Rendered by Category */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {activeConfig.category === 'unauthorized' && (
            <>
              <Button
                size="sm"
                onClick={() => navigate({ to: '/login' })}
                className="h-9 px-4 text-xs font-medium gap-2 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{m.error_page_btn_login()}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToHome}
                className="h-9 px-4 text-xs font-medium gap-2 cursor-pointer border-border/80"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{m.error_page_btn_home()}</span>
              </Button>
            </>
          )}

          {activeConfig.category === 'not_found' && (
            <>
              <Button
                size="sm"
                onClick={goToHome}
                className="h-9 px-4 text-xs font-medium gap-2 cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{m.error_page_btn_home_short()}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToCompanion}
                className="h-9 px-4 text-xs font-medium gap-2 cursor-pointer border-border/80"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>{m.error_page_btn_companion()}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="h-9 px-3 text-xs font-medium gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{m.error_page_btn_back()}</span>
              </Button>
            </>
          )}

          {activeConfig.category === 'server_error' && (
            <>
              <Button
                size="sm"
                onClick={handleRetry}
                className="h-9 px-4 text-xs font-medium gap-2 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{m.error_page_btn_retry()}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToHome}
                className="h-9 px-4 text-xs font-medium gap-2 cursor-pointer border-border/80"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{m.error_page_btn_back_home()}</span>
              </Button>
            </>
          )}
        </div>

        {activeConfig.category === 'server_error' && error && (
          <div className="w-full pt-2">
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>{m.error_page_tech_details()}</span>
              {showDetails ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            {showDetails && (
              <div className="mt-3 text-left bg-muted/50 rounded-lg p-3.5 border border-border/60 space-y-2 text-sm font-body animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-muted-foreground border-b border-border/40 pb-2">
                  <span className="font-medium text-destructive">
                    {error.name || m.error_page_error_fallback()}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyError}
                    className="flex items-center gap-1 text-[11px] hover:text-foreground cursor-pointer transition-colors"
                  >
                    {copied ? (
                      <CheckIcon className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <CopyIcon className="h-3 w-3" />
                    )}
                    <span>
                      {copied ? m.error_page_copied() : m.error_page_copy()}
                    </span>
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto text-muted-foreground/90 whitespace-pre-wrap break-all text-md leading-relaxed">
                  <span className="font-bold">
                    {error.message || String(error)}
                  </span>
                  {error.stack && (
                    <div className="mt-2 pt-2 border-t border-border/40 text-md opacity-70">
                      {error.stack}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
