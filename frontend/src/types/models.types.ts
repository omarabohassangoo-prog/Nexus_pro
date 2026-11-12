export type UserType = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type TemplateType = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'INVOICE' | 'NOTIFICATION' | 'PUSH' | 'PDF' | 'REPORT' | 'CERTIFICATE' | 'WELCOME';

export interface SafeUser {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  type: UserType;
  status: UserStatus;
  emailVerified: boolean;
  language: string;
  roleId: number | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions?: Array<{ permission: Permission }>;
  _count?: { users: number };
}

export interface Permission {
  id: number;
  key: string;
  group: string;
  description: string | null;
}

export interface Setting {
  key: string;
  value: string;
  group: string;
  isSecret: boolean;
  isEncrypted: boolean;
  updatedAt: string;
}

export interface Template {
  id: number;
  key: string;
  name: string;
  type: TemplateType;
  subject: string | null;
  language: string;
  isSystem: boolean;
  isActive: boolean;
  updatedAt: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  showInNav: boolean;
  showInFooter: boolean;
  navOrder: number;
  requiresAuth: boolean;
  isSystem: boolean;
  status: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface DashboardStats {
  users: { total: number; active: number; pending: number; byType: Array<{ type: UserType; count: number }> };
  roles: number;
  pages: number;
  templates: number;
  recentUsers: Array<{ id: number; email: string; name: string; type: UserType; createdAt: string }>;
  recentActivity: Array<{ id: number; action: string; entity: string; createdAt: string; userId: number | null }>;
}
