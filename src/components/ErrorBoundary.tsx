import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ArrowLeft, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/error-logging';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // 上报错误到后端
    logError(error, errorInfo, {
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private handleCopyError = async () => {
    const { error, errorInfo } = this.state;
    const errorText = [
      error?.toString(),
      errorInfo?.componentStack ? `\nComponent Stack:${errorInfo.componentStack}` : '',
      `\nURL: ${window.location.href}`,
      `\nTime: ${new Date().toISOString()}`,
    ].join('');

    await navigator.clipboard.writeText(errorText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
          {/* Background Effects */}
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="bg-radial-mask absolute inset-0" />

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-[15%] top-20 h-64 w-64 rounded-full bg-destructive/5 blur-3xl"
          />

          <div className="relative z-10 w-full max-w-lg text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Animated Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mx-auto mb-8"
              >
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/10 shadow-lg">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Bug className="h-12 w-12 text-destructive" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Error Animation */}
              <motion.div
                animate={{
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <span className="text-gradient text-6xl font-bold sm:text-7xl">出错了</span>
              </motion.div>

              <h1 className="mb-4 text-2xl font-bold sm:text-3xl">应用遇到了问题</h1>

              <p className="mx-auto mb-6 max-w-md text-lg text-muted-foreground">
                很抱歉，应用发生了意外错误。请尝试刷新页面或返回首页。
              </p>

              {/* Error Details (collapsible) */}
              {this.state.error && (
                <motion.details
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8 overflow-hidden rounded-lg border border-border bg-card text-left"
                >
                  <summary className="flex cursor-pointer items-center gap-2 p-4 text-sm font-medium transition-colors hover:bg-muted/50">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    查看错误详情
                  </summary>
                  <div className="border-t border-border p-4 pt-0">
                    <pre className="max-h-40 overflow-auto rounded-md bg-destructive/5 p-3 text-xs text-destructive">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack && (
                        <>
                          {'\n\nComponent Stack:'}
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </div>
                </motion.details>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                <Button variant="outline" onClick={this.handleGoBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  返回上一页
                </Button>
                <Button variant="outline" onClick={this.handleCopyError} className="gap-2">
                  {this.state.copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {this.state.copied ? '已复制' : '复制错误'}
                </Button>
                <Button onClick={this.handleReload} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  刷新页面
                </Button>
                <Button variant="secondary" onClick={this.handleGoHome} className="gap-2">
                  <Home className="h-4 w-4" />
                  返回首页
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
