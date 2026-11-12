export const UserType = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  USER: "USER",
} as const;

export type UserType = string;

export const UserStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DELETED: "DELETED",
} as const;

export type UserStatus = string;

export const TemplateType = {
  EMAIL: "EMAIL",
  SMS: "SMS",
  WHATSAPP: "WHATSAPP",
  INVOICE: "INVOICE",
  NOTIFICATION: "NOTIFICATION",
  PUSH: "PUSH",
  PDF: "PDF",
  REPORT: "REPORT",
  CERTIFICATE: "CERTIFICATE",
  WELCOME: "WELCOME",
} as const;

export type TemplateType = string;
