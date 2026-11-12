import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { LanguageProvider } from './auth/LanguageContext';
import { ToastProvider } from './hooks/useToast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { router } from './router';
import './styles/globals.css';

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
