import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { UserLayout } from './components/layout/UserLayout';
import { RequireAuth } from './components/guards/RequireAuth';
import { RequireRole } from './components/guards/RequireRole';
import { RequireNotInstalled } from './components/guards/RequireNotInstalled';
import { HomePage } from './pages/public/HomePage';
import { PageView } from './pages/public/PageView';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ActivatePage } from './pages/auth/ActivatePage';
import { InstallPage } from './pages/install/InstallPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminRoles } from './pages/admin/AdminRoles';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminTemplates } from './pages/admin/AdminTemplates';
import { AdminPages } from './pages/admin/AdminPages';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminBackups } from './pages/admin/AdminBackups';
import { AdminAudit } from './pages/admin/AdminAudit';
import { AdminSystem } from './pages/admin/AdminSystem';
import { AdminRealtime } from './pages/admin/AdminRealtime';
import { UserDashboard } from './pages/user/UserDashboard';
import { UserProfile } from './pages/user/UserProfile';
import { UserSecurity } from './pages/user/UserSecurity';
import { UserNotifications } from './pages/user/UserNotifications';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  { path: '/install', element: <RequireNotInstalled><InstallPage /></RequireNotInstalled> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/activate', element: <ActivatePage /> },
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: ':slug', element: <PageView /> },
    ],
  },
  {
    path: '/admin',
    element: <RequireAuth><RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}><AdminLayout /></RequireRole></RequireAuth>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'roles', element: <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}><AdminRoles /></RequireRole> },
      { path: 'settings', element: <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}><AdminSettings /></RequireRole> },
      { path: 'templates', element: <AdminTemplates /> },
      { path: 'pages', element: <AdminPages /> },
      { path: 'services', element: <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}><AdminServices /></RequireRole> },
      { path: 'backups', element: <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}><AdminBackups /></RequireRole> },
      { path: 'audit', element: <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}><AdminAudit /></RequireRole> },
      { path: 'system', element: <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}><AdminSystem /></RequireRole> },
      { path: 'realtime', element: <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}><AdminRealtime /></RequireRole> },
    ],
  },
  {
    path: '/user',
    element: <RequireAuth><UserLayout /></RequireAuth>,
    children: [
      { index: true, element: <UserDashboard /> },
      { path: 'profile', element: <UserProfile /> },
      { path: 'security', element: <UserSecurity /> },
      { path: 'notifications', element: <UserNotifications /> },
    ],
  },
  { path: '/user-type-redirect', element: <UserTypeRedirect /> },
  { path: '*', element: <NotFound /> },
]);

function UserTypeRedirect() {
  return <Navigate to="/login" replace />;
}
