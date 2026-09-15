import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Controlled internal logging without sensitive user/patient PII
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Application ErrorBoundary Caught]', {
        message: error.message,
        name: error.name,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    this.handleReset();
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-vazir text-slate-800" dir="rtl" id="app-error-boundary">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold text-slate-900 mb-2">
              خطایی در نمایش صفحه رخ داد
            </h1>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              متأسفانه هنگام پردازش درخواست مشکلی پیش آمد. اطلاعات شما محفوظ است و تغییری در نوبت‌ها ایجاد نشده است.
            </p>

            {this.state.errorId && (
              <div className="bg-slate-50 rounded-xl p-3 mb-6 flex items-center justify-center gap-2 border border-slate-100">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-slate-500">
                  کد پیگیری خطا: {this.state.errorId}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 py-2.5"
                id="btn-error-reload"
              >
                <RefreshCw className="w-4 h-4" />
                بارگذاری مجدد
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 py-2.5"
                id="btn-error-home"
              >
                <Home className="w-4 h-4" />
                بازگشت به خانه
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
