import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error) { console.error('ErrorBoundary:', error); }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">حدث خطأ غير متوقع</h2>
          <p className="text-muted">حاول تحديث الصفحة</p>
        </div>
      );
    }
    return this.props.children;
  }
}
