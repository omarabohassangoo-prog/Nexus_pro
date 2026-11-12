# Changelog

## [1.0.0] — 2026-11-13

### Added — PKG-01 Backend Core
- env validation (Zod), Prisma singleton
- types (common, user, auth, settings, templates)
- schemas (auth, user, settings, templates, common)
- utils: AppError, asyncHandler, logger, pagination, crypto, password, jwt, sanitize, query

### Added — PKG-02 Backend Services
- middlewares: requestId, rateLimiter, validate, errorHandler, authenticate, authorize, requirePermission
- services: settings, auth, user, role, audit, template, media, stats, backup, install, i18n, notification
- external: cache, email, sms, whatsapp, paypal
- controllers: auth, install, public, admin/*, user/*

### Added — PKG-03 Frontend
- api client (axios + refresh), auth.api, admin.api, public.api, user.api, install.api
- AuthContext, LanguageContext
- hooks: useDebounce, useToast, usePagination, useSocket, useRealtimeNotifications, useUsers
- ui: Button, Input, Modal, Table, Pagination, Badge, Spinner, ErrorBoundary
- guards: RequireAuth, RequireRole, RequireNotInstalled
- layouts: PublicLayout, AdminLayout, UserLayout
- pages: public/*, auth/*

### Added — PKG-04 Infra & Docs
- prisma/schema.prisma (17 models), seed.ts
- Dockerfile (multi-stage), docker-compose.yml, nginx.conf
- README, docs/api.md, docs/deployment.md, SECURITY.md, LICENSE
- tests: auth.test.ts, health.test.ts

### Added — PKG-05 Backend Runtime (CRITICAL)
- app.ts, server.ts (graceful shutdown)
- routes: auth, install, public, user, admin, health
- middlewares/upload.ts (multer)
- realtime: realtime.service, presence.service
- frontend router.tsx, NotFound
- pages/install/InstallPage (6 steps)
- pages/admin/* (11 pages)
- pages/user/* (4 pages)

### Added — PKG-06 Tests & Fixes
- auth.service.fixes: activate, resetPassword, loginHistory (real tokens)
- models: PasswordResetToken, EmailVerificationToken, LoginHistory, TemplatePreview
- factory-reset.ts CLI
- tests: setup, auth.flows, install.flow, rbac, templates, services, health.deep
- docs/entities.md, docs/user-types/*
- CHANGELOG, CONTRIBUTING

### Fixed
- AuthContext.permissions now populated from /auth/me
- user.service.remove() uses UserStatus.DELETED
- install.service seed import path corrected
- auth.controller.revokeSession type safety

### Security
- Real password reset tokens (1h TTL, hashed, single-use)
- Real email verification tokens (24h TTL, hashed, single-use)
- Login history tracking
- Session revocation on password reset
