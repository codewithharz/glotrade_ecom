# App Root Directory Reference — Core Frontend Modules

This guide details the primary routes and modules located in the root `app` directory (`apps/web/src/app`). These folders represent the user-facing features, partner dashboards, and account management systems of the Glotrade platform.

---

## 🔐 1. `auth`
- **What it is**: The platform's gatekeeper for security and identification.
- **What it does**: Handles all entry and identity recovery flows.
- **Key Sub-Paths**:
  - `login`: Standard credential-based entry.
  - `register`: Customer onboarding.
  - `register-business`: onboarding for corporate partners (Wholesalers/Distributors/Agents).
  - `forgot` / `reset`: Password recovery system.
  - `verify`: Triggers for email and identity verification links.

## 🌾 2. `gdip`
- **What it is**: The User-Side Investment Portal.
- **What it does**: Allows partners to manage their TPIA blocks and trade cycles.
- **Key Sub-Paths**:
  - `purchase`: The landing page for buying new TPIA alliance blocks.
  - `tpias` / `tpia/[id]`: Portfolio view and specific block details (Insurance certificates, cluster assignments).
  - `cycles`: Monitoring active 37-day trading rounds.
  - `statement`: Financial ledger of investment earnings and compounding history.

## 🛒 3. `marketplace`
- **What it is**: The Multi-Vendor Shopping Hub.
- **What it does**: The central engine for product discovery and selection.
- **Key Sub-Paths**:
  - `[id]`: Dynamic product detail pages.
  - `page.tsx`: Searchable catalog with category cascades and filtering chips.
- **Logic**: It dynamically fetches products from the API and supports industrial-scale catalog browsing.

## 💳 4. `wallet`
- **What it is**: Personal Financial Dashboard.
- **What it does**: Manages NGN balances, top-ups, and payout withdrawals.
- **How it works**: Synchronizes with the backend `WalletService` to show available and frozen balances. 
- **Sub-Path**: `share` — Functional tool for sharing transaction receipts or wallet identifiers.

## 👤 5. `profile`
- **What it is**: User Account & Preference Center.
- **What it does**: Manages the personal side of the Glotrade experience.
- **Key Sub-Paths**:
  - `notifications`: Centralized alert hub for order updates and platform news.
  - `reviews`: Management of product ratings and feedback.
  - `wallet`: Link to the user's specific financial settings.
  - `vouchers`: Inventory of applied and available discount coupons.

## 📦 6. `orders`
- **What it is**: Personal Procurement History.
- **What it does**: Tracks all purchases from checkout to delivery.
- **Key Sub-Paths**:
  - `[id]`: Detailed tracking, shipping status, and itemized receipts for individual orders.

## 🛍️ 7. `cart` & `checkout`
- **What they are**: The Conversion Engine.
- **What they do**: Manage the transition from shopping to purchasing.
- **How it works**:
  - `cart`: Local state and server-synced list of pending purchases.
  - `checkout`: Multi-step payment process including shipping selection and Paystack integration (`callback` / `success` handlers).

## 🏢 8. `s/[slug]`
- **What it is**: Dynamic Vendor Storefronts.
- **What it does**: Renders dedicated pages for specific vendors (e.g., `glotrade.online/s/apple-store`).
- **Features**: Includes a customizable `StoreHeader` and an `about` page for vendor business bios.

## 🕵️ 9. `security`
- **What it is**: User-Facing Safety Tools.
- **What it does**: Allows users to report fraudulent products or suspicious sellers.
- **Sub-Paths**:
  - `report`: The reporting wizard for incidents.
  - `fraud-cases`: Tracking portal for resolved or ongoing security investigations.

## 🤝 10. `agent`
- **What it is**: Sales Representative Portal.
- **What it does**: Dedicated dashboard for agents managing their downstream referrals.
- **Logic**: Tracks the MLM hierarchy, pending commissions, and the ₦100k payout threshold.

## 🆘 11. `support`
- **What it is**: Platform Help Center.
- **What it does**: Provides FAQs, troubleshooting guides, and customer service contact channels.

## ✅ 12. `verify`
- **What it is**: Identity & Link Confirmation Module.
- **What it does**: Handles the final verification step for email links (JWT verification, account activation).
- **Sub-Path**: `[id]` — Dynamic route that processes a specific verification token from an automated email.

---

## 🏗️ The App Foundation (Root Files)
Beyond folders, the root directory contains the physical foundation of the web app:

- **`layout.tsx`**: The Global Shell. Injects the Navbar, Footer, and fonts (`Poppins`, `Geist`) into every page.
- **`page.tsx`**: The Homepage Engine. Fetches dynamic banners and featured products for the main landing page.
- **`globals.css`**: The Tailwind & custom CSS layer for platform-wide styling.
- **`sitemap.ts`**: SEO Engine. Dynamically generates the list of all platform routes for Google crawler indexing.
- **`favicon.ico` / `icon.png`**: Visual branding assets for browser tabs and mobile bookmarks.

## ✨ Other Modules
- `best-selling`: Curated feed of high-velocity marketplace items.
- `wishlist`: "Save for later" storage for users.
- `dashboard`: Quick-access summary of account activity.
- `fonts`: Central storage for platform-wide typography (Poppins, Geist Sans, etc.).

---

**GloTrade — A Multi-Role Commerce & Distribution Infrastructure**
Developer: NEXGEN TECH INNOVATIONS LIMITED
Contact: codewithharz@gmail.com | +2348107060160
