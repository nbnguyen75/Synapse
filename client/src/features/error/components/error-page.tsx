import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { StatusCodes } from 'http-status-codes';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import {
  ArrowLeft,
  RotateCcw,
  Home,
  LogIn,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Bot,
  Terminal,
} from 'lucide-react';

export interface ErrorPageProps {
  statusCode?: StatusCodes;
  customMessage?: string;
  customTitle?: string;
  reset?: () => void;
  error?: Error;
}

// 1. Cấu hình loại lỗi
type ErrorCategory = 'unauthorized' | 'not_found' | 'server_error';

interface ErrorDetail {
  category: ErrorCategory;
  description: string;
  title: string;
}

// 2. Dictionary cấu hình các mã lỗi (Dễ dàng thêm 403, 502, 503... tại đây)
const ERROR_CONFIG: Partial<Record<StatusCodes, ErrorDetail>> = {
  [StatusCodes.UNAUTHORIZED]: {
    description: 'Bạn cần đăng nhập hoặc được cấp quyền để truy cập trang này.',
    title: 'Cần xác thực tài khoản',
    category: 'unauthorized',
  },
  [StatusCodes.FORBIDDEN]: {
    description: 'Tài khoản của bạn không đủ thẩm quyền để vào trang này.',
    title: 'Không có quyền truy cập',
    category: 'unauthorized',
  },
  [StatusCodes.NOT_FOUND]: {
    description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.',
    title: 'Trang không tồn tại',
    category: 'not_found',
  },
};

// Cấu hình mặc định cho các lỗi hệ thống (500, 502,...)
const DEFAULT_ERROR_CONFIG: ErrorDetail = {
  description:
    'Hệ thống gặp sự cố ngoài dự kiến trong quá trình xử lý yêu cầu.',
  title: 'Đã có lỗi xảy ra',
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

  // Lấy config theo statusCode, nếu không có thì lấy DEFAULT_ERROR_CONFIG
  const activeConfig = ERROR_CONFIG[statusCode] ?? DEFAULT_ERROR_CONFIG;

  const title = customTitle || activeConfig.title;
  const description = customMessage || activeConfig.description;

  // Helpers điều hướng
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

    const errorText = `${error.name || 'Error'}: ${error.message || String(error)}\n${error.stack || ''}`;

    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      toast.success('Đã sao chép chi tiết lỗi!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép chi tiết lỗi.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground select-none">
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center space-y-8 animate-in fade-in duration-300">
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
                <span>Đăng nhập ngay</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToHome}
                className="h-9 px-4 text-xs font-medium gap-2 cursor-pointer border-border/80"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Về Trang chủ</span>
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
                <span>Trang chủ</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ search: () => ({}), to: '/chat' })}
                className="h-9 px-4 text-xs font-medium gap-2 cursor-pointer border-border/80"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>Hỏi AI Copilot</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="h-9 px-3 text-xs font-medium gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Quay lại</span>
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
                <span>Thử lại</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToHome}
                className="h-9 px-4 text-xs font-medium gap-2 cursor-pointer border-border/80"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Quay về Trang chủ</span>
              </Button>
            </>
          )}
        </div>

        {/* Technical Error Drawer (chỉ hiện khi có error object) */}
        {activeConfig.category === 'server_error' && error && (
          <div className="w-full pt-2">
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Chi tiết kỹ thuật</span>
              {showDetails ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            {showDetails && (
              <div className="mt-3 text-left bg-muted/50 rounded-lg p-3.5 border border-border/60 space-y-2 text-xs font-mono animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-muted-foreground border-b border-border/40 pb-2">
                  <span className="font-medium text-destructive">
                    {error.name || 'Error'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyError}
                    className="flex items-center gap-1 text-[11px] hover:text-foreground cursor-pointer transition-colors"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto text-muted-foreground/90 whitespace-pre-wrap break-all text-sm leading-relaxed">
                  {error.message || String(error)}
                  {error.stack && (
                    <div className="mt-2 pt-2 border-t border-border/40 text-[10px] opacity-70">
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
