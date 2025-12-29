# Glotrade Advanced Infrastructure & Module Toggles

This document provides an overview of the provider-agnostic infrastructure modules implemented in the Glotrade Platform. These modules allow seamless switching between local development, staging, and high-performance production environments using environment variables.

---

## 1. Email Service & Amazon SES
Centralized email sending that supports both traditional SMTP (Gmail) and Amazon SES.

- **Service**: `apps/api/src/services/EmailService.ts`
- **Toggle**: `EMAIL_PROVIDER=smtp | ses`
- **Feature**: 
  - Direct AWS SDK v3 integration for SES (reliable and manual-error proof).
  - Fallback to SMTP for local development.
  - Automatic email formatting for common flows (Verification, Password Reset).

---

## 2. Cache Service & Redis
High-performance caching and rate limiting with a safety fallback.

- **Service**: `apps/api/src/services/CacheService.ts`
- **Toggle**: `REDIS_ENABLED=true | false`
- **Feature**: 
  - Integrated into the global **API Rate Limiter** (`app.ts`).
  - Automatically falls back to internal memory cache if Redis is disabled or unreachable.
  - Prevents "Multiple Instances" state drift in production.

---

## 3. Universal Storage Provider
Flexible file storage for avatars, product images, and business documents.

- **Service**: `apps/api/src/services/R2Service.ts`
- **Toggle**: `STORAGE_PROVIDER=local | r2`
- **Feature**: 
  - **Local Mode**: Saves files to `apps/api/public/uploads`. Best for offline dev.
  - **R2 Mode**: Saves to Cloudflare R2 (Global CDN). Best for production.
  - Automated directory creation and unique key generation.

---

## 4. Automatic Notification Emails
Connects the in-app notification system directly to the email service.

- **Service**: `apps/api/src/services/NotificationService.ts`
- **Toggle**: `EMAIL_ENABLED=true | false`
- **Feature**: 
  - Every time a notification is created (e.g., `order_placed`), the system checks the template.
  - If the template includes the `email` channel, an email is automatically sent to the user.
  - Uses the formatted subject and message from the notification template.

---

## Environment Variables Summary

Add these to your `.env` to control the infrastructure:

```env
# Email
EMAIL_PROVIDER=smtp       # 'smtp' or 'ses'
EMAIL_ENABLED=true        # master switch for notification emails

# Redis
REDIS_ENABLED=false       # enable for production rate limiting
REDIS_URL=redis://localhost:6379

# Storage
STORAGE_PROVIDER=local    # 'local' or 'r2'
LOCAL_PUBLIC_URL=http://localhost:8080/uploads
R2_PUBLIC_URL=https://your-public-domain.r2.dev
```

---

## Verification Scripts
Use these scripts to verify your configuration at any time:

```bash
# Test Email
npx ts-node -r dotenv/config src/scripts/test-email.ts your-email@example.com

# Test Redis/Cache
npx ts-node -r dotenv/config src/scripts/test-redis.ts

# Test Storage (Local/R2)
npx ts-node -r dotenv/config src/scripts/test-storage.ts

# Test Notification Emails
npx ts-node -r dotenv/config src/scripts/test-notifications.ts
```
