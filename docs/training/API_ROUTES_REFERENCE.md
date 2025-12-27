# API Routes Reference — Backend Architecture Breakdown

This document provides a comprehensive map of the Glotrade Backend API (`apps/api/src/routes`). The platform implements over **325+ endpoints**, organized into logical functional domains to manage identity, commerce, and the complex GDIP investment engine.

---

## 🔐 1. Identity & Access Control
Manages the lifecycle of users, security tokens, and permission-based routing.
- **`auth.routes.ts`**: Core entry points: `/register`, `/login`, `/verify`, and password recovery flows.
- **`user.routes.ts`**: Personal profile management, KYC status tracking, and account settings.
- **`token.routes.ts`**: Lifecycle of JWT and refresh tokens to maintain secure, persistent sessions.
- **`userPreferences.routes.ts`**: Personalized settings (e.g., notification toggles, UI themes).

## 🛒 2. Marketplace & Enterprise Commerce
The engine for the multi-vendor catalogue and product interactions.
- **`market.routes.ts` / `seller.routes.ts`**: Searchable product index, category structures, and specific seller/vendor listing data.
- **`vendor.routes.ts`**: High-level vendor management, including business verification, store analytics, and inventory health.
- **`order.routes.ts`**: The lifecycle of a sale: creation, tracking, status updates, and automated invoice generation.
- **`voucher.routes.ts`**: Creation and validation of discount coupons/codes used during checkout.
- **`productImage.routes.ts` / `fileUpload.routes.ts`**: Industrial-scale image processing and secure document hosting for KYB (Know Your Business).

## 💰 3. FinTech & Wallet Infrastructure
The financial heart of the platform, managing balances and atomic transactions.
- **`wallet.routes.ts`**: Direct monitoring of NGN balances, transaction history, and wallet freezing (admin).
- **`payment.routes.ts`**: The gateway to **Paystack** and **Flutterwave**. Handles initialization and verification of all incoming funds.
- **`webhook.routes.ts`**: Asynchronous listeners for payment providers to confirm transaction success/failure.
- **`withdrawal.routes.ts` / `payout.routes.ts`**: Processes requests for external fund transfers to agent/vendor bank accounts.
- **`creditRequest.routes.ts`**: Portal for businesses to apply for and manage their platform credit limits.

## 🌾 4. GDIP Investment Engine
Specialized routes for the **Global Digital Cluster** (GDC) and **Trusted Insured Partners** (TPIA).
- **`gdip.routes.ts`**: The primary controller for TPIA purchases, GDC formation (sequential filling), and 37-day trade cycle triggers.
- **`insurance.routes.ts`**: Manages the risk-mitigation layer, including certificate generation and automated insurance claims for trade cycles.
- **`commission.routes.ts`**: Tracks the multi-level commission payouts and distributor rewards (2% quarterly).

## 🛡️ 5. Security & Communications
System-wide integrity monitoring and real-time interaction.
- **`securityReport.routes.ts`**: Centralized hub for reporting fraud, suspicious communication, or platform vulnerabilities.
- **`notification.routes.ts`**: Management of the in-app notification center (unread counts, archiving).
- **`realtime.routes.ts`**: Socket.io-driven routes for live updates (e.g., instant order alerts, price changes).

## ⚙️ 6. System Administration
Reserved endpoints for internal oversight and platform configuration.
- **`admin.routes.ts`**: The "Admin Root" containing dashboard health metrics, bulk user operations, and global system toggles.
- **`admin/` Sub-Directory**: Contains nested administrative logic, specifically for centralized commission oversight.
- **`banner.routes.ts`**: CMS for managing the visual marketing assets on the platform homepages.

---

## 🏗️ Technical Integration (`index.ts`)
Everything is unified under the `/api/v1` namespace. Each route file acts as a module that maps clean RESTful paths (e.g., `/api/v1/market/products`) to their underlying Controller logic.

**GloTrade — A Multi-Role Commerce & Distribution Infrastructure**
Developer: NEXGEN TECH INNOVATIONS LIMITED
Contact: codewithharz@gmail.com | +2348107060160
