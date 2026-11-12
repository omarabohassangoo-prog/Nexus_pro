# NEXUS Entities

## User
- id, email(unique), passwordHash, name, phone, avatarUrl
- type: SUPER_ADMIN | ADMIN | EDITOR | USER
- status: PENDING | ACTIVE | SUSPENDED | DELETED
- emailVerified, twoFactorEnabled, failedAttempts, lockedUntil
- roleId → Role, language, lastLoginAt
- Relations: sessions, notifications, auditLogs, mediaFiles, payments, chatMessages, participations, resetTokens, verifyTokens, loginHistory
- Soft delete: deletedAt

## Role / Permission / RolePermission
- Role: name(unique), isSystem
- Permission: key(unique), group
- RolePermission: composite PK (roleId, permissionId)

## Session
- id(cuid), userId, refreshHash, ipAddress, userAgent, expiresAt, revokedAt
- Refresh rotation: كل refresh يُلغي القديم ويُنشئ جديد

## SystemSetting
- key(unique), value(Text), group, isSecret, isEncrypted
- 12 groups: general, env, database, email, sms, whatsapp, paypal, files, css, i18n, cloud, secrets

## Page
- slug(unique), title, content(Text), metaTitle, metaDescription, ogImage
- showInNav, showInFooter, navOrder, requiresAuth, isSystem, status

## Template / TemplateVersion / TemplateUsage / TemplatePreview
- Template: key(unique), type(10), subject, body(Text), variables(JSON), language, isSystem, isActive
- Version: (templateId, version) unique
- Usage: channel, status, error
- Preview: context, rendered

## Notification
- userId, type, title, body(Text), data(JSON), isRead, readAt

## AuditLog
- userId?, action, entity, entityId?, changes(JSON), ipAddress, userAgent, requestId

## MediaFile
- userId?, filename, originalName, mimeType, size, storage, path, url

## Payment
- userId, provider, providerOrderId(unique), amount, currency, status, metadata

## Language / Translation
- Language: code(unique), name, direction, isDefault, isActive
- Translation: (languageId, namespace, key) unique

## Chat / ChatMessage / ChatParticipant
- Chat: type(private|group)
- Message: chatId, userId, body(Text), readAt
- Participant: (chatId, userId) composite PK

## Backup
- filename, size, status, createdBy

## PasswordResetToken / EmailVerificationToken
- tokenHash(unique), expiresAt, usedAt
- TTL: reset=1h, verify=24h

## LoginHistory
- userId, ipAddress, userAgent, success, reason
