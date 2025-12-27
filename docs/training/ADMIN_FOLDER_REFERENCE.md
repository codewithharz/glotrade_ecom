# Admin Directory Reference — Module-by-Module Breakdown

This guide explains the 15 active modules within the Glotrade Admin Interface (`apps/web/src/app/admin`). Each section details what the folder is, what it does, and how it works.

---

## 📈 1. `analytics`
- **What it is**: The platform's visual performance dashboard.
- **What it does**: Provides a real-time overview of growth metrics, revenue trends, and user demographics.
- **How it works**: It fetches aggregated data via `apiGet("/api/v1/analytics")` and uses **Chart.js** to render line graphs (revenue over time) and bar charts (top categories).

## 🖼️ 2. `banners`
- **What it is**: Marketing Content Manager.
- **What it does**: Allows admins to upload, toggle, and sequence banners that appear on the homepage.
- **How it works**: Stores banner objects with `isActive` booleans. The frontend components subscribe to this list to display promotional slides.

## 🎟️ 3. `coupons`
- **What it is**: Promotional Discount System.
- **What it does**: Creates discount codes (Percentage, Fixed Amount, or Free Shipping).
- **How it works**: Admins can set `minOrderAmount`, `maxUsage`, and `validUntil` dates. The checkout system validates these codes against the user's cart.

## 💳 4. `credit-requests`
- **What it is**: Corporate Credit Vetting Portal.
- **What it does**: Manages applications from Wholesalers/Distributors for business credit limits.
- **How it works**: Admins review the business reason and user history, then set a `creditLimit` which is updated in the user's `Wallet` document.

## 🌾 5. `gdip`
- **What it is**: The Investment & Trading Engine.
- **What it does**: Manages GDCs (Clusters), TPIAs (Alliance Blocks), and 37-day Trade Cycles.
- **Sub-Modules**:
  - `commodities`: CRUD for trading items (Rice, Sugar).
  - `cycles`: Detailed oversight and creation of active 37-day trading rounds.
  - `gdcs`: Cluster management (viewing fills and assignee blocks).
  - `partners`: Directory of active TPIA investors.
  - `page.tsx`: The main dashboard for the investment ecosystem.
- **How it works**: It controls GDC formation (sequential filling) and allows manual triggering of profit distribution if the auto-cron needs assistance.

## 🛒 6. `orders`
- **What it is**: Order Fulfilment Center.
- **What it does**: Tracks every sale from "Pending" to "Delivered".
- **How it works**: Admins can update shipping statuses, process cancellations, and initiate refunds. It links orders to the corresponding Vendor and Buyer profiles.

## 📦 7. `products`
- **What it is**: Central Catalog Management.
- **What it does**: Oversees all items listed by vendors.
- **Sub-Modules**:
  - `new`: Standardized form for admins/vendors to list new inventory.
  - `[id]`: Dynamic route for editing existing product details and images.
  - `page.tsx`: The primary searchable table of all platform inventory.
- **How it works**: Supports global CRUD. Admins can feature products on the homepage or delete prohibited listings.

## 📊 8. `reports`
- **What it is**: Deep Data & Audit Logging.
- **What it does**: Generates complex, paginated reports for sales, vendor performance, and platform tax/revenue.
- **How it works**: Uses high-performance APIs to fetch large datasets and provides "Export to CSV" functionality for accounting.

## 🤝 9. `sales-agents`
- **What it is**: MLM & Referral Management.
- **What it does**: Monitors the 3-tier agent system (Bronze, Silver, Gold).
- **How it works**: Tracks `totalCommissionEarned` and `activeReferrals`. It handles the ₦100k threshold verification before commissions are approved.

## 🛡️ 10. `security`
- **What it is**: Incident & Integrity Shield.
- **What it does**: Tracks security reports (Suspicious communication, Website vulnerabilities, Fraud flags).
- **How it works**: Users report suspicious activity, and admins use this module to investigate, status-track, and resolve security tickets.

## ⚙️ 11. `settings`
- **What it is**: Global Platform Config.
- **What it does**: Hard-coded system toggles for maintenance mode, fee percentages, and API keys.
- **How it works**: Changes here update the `GlobalConfig` collection in the database, immediately affecting platform logic like tax calculation.

## 🏬 12. `store`
- **What it is**: Platform Branding Manager.
- **What it does**: Manages the Glotrade corporate identity (Logo, Favicon, Storefront Theme).
- **How it works**: Interacts with the `StoreSettings` API to update visual assets globally across the marketplace and emails.

## 👥 13. `users`
- **What it is**: Central Identity Controller.
- **What it does**: Manages all user roles, KYC statuses, and block-lists.
- **How it works**: Handles the **Two-Tiered Verification** (User vs Business). It can block/unblock accounts and modify user roles (Customer -> Agent).

## 💰 14. `wallets`
- **What it is**: Financial Oversight Portal.
- **What it does**: Direct monitoring of NGN balances across the platform.
- **How it works**: Allows admins to freeze suspicious wallets, view transaction histories, and adjust balances for manual reconciliations.

## 💸 15. `withdrawals`
- **What it is**: Payout Settlement System.
- **What it does**: Processes request from agents and vendors to move funds to their physical bank accounts.
- **How it works**: Validates account details, tracks payment status (`Pending` -> `Processing` -> `Completed`), and stores transaction references.

---

**GloTrade — A Multi-Role Commerce & Distribution Infrastructure**
Developer: NEXGEN TECH INNOVATIONS LIMITED
Contact: codewithharz@gmail.com | +2348107060160
