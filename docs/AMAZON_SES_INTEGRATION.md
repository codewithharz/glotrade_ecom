# Amazon SES Integration & Email Service Refactor

This document outlines the refactoring of the email sending logic into a centralized `EmailService` and the integration of Amazon SES with a provider toggle.

## Changes Overview

### Centralized Email Logic
- **EmailService.ts**: A new service located at `apps/api/src/services/EmailService.ts` that handles all email interactions.
- **Provider Toggle**: Added an `EMAIL_PROVIDER` environment variable to switch between `smtp` (Gmail) and `ses` (Amazon SES).
- **AuthController Refactor**: Updated `apps/api/src/controllers/auth.controller.ts` to use the new service instead of direct `nodemailer` calls.

### Configuration
The following environment variables have been added to the system (see `apps/api/env.example`):

- `EMAIL_PROVIDER`: Switch between `smtp` (default) and `ses`.
- `AWS_REGION`: The AWS region for SES (e.g., `us-east-1`).
- `AWS_ACCESS_KEY_ID`: Your AWS access key.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key.

---

## How to Verify

### 1. SMTP (Gmail/Existing Setup)
By default, the system remains on SMTP to prevent breaking existing flows.
1. Ensure `EMAIL_PROVIDER=smtp` (or leave it unset) in your `.env`.
2. Run the test script to verify:
   ```bash
   cd apps/api
   npx ts-node -r dotenv/config src/scripts/test-email.ts your-email@example.com
   ```

### 2. Amazon SES (New Setup)
Once you are ready to switch:
1. Update your `.env` with the `ses` provider and AWS credentials.
2. Run the same test script:
   ```bash
   npx ts-node -r dotenv/config src/scripts/test-email.ts your-email@example.com
   ```

> [!NOTE]
> **SES Sandbox Mode**: While in Sandbox mode, you can only send emails to **verified** email addresses in your AWS Console. You must request "Production Access" to send to any recipient.

---

## Technical Implementation

### Provider Logic
The `EmailService` determines the provider at runtime based on the environment configuration:

```typescript
constructor() {
  this.provider = (process.env.EMAIL_PROVIDER as EmailProvider) || EmailProvider.SMTP;
  this.initProvider();
}
```

### Usage Example
Controllers now call shorthand methods for common emails:

```typescript
EmailService.sendVerificationEmail(email, url).catch(err => 
  console.warn("Verification email failed to send:", err)
);
```
