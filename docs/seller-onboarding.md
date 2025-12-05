## Seller Functionality — Scope, Flow, and Requirements

This document defines the complete Seller experience for AfriTrade Hub, covering the phased onboarding, data model, API endpoints, UI pages, approvals, and operational concerns. The entry point is the “Become a Seller” CTA on the user profile.

### Dashboard essentials (modern e‑commerce)

- KPIs: products, orders, revenue, wallet/balance, payout status, disputes/returns
- Quick actions: add product, complete onboarding, connect payouts, set policies
- Orders: unified queue with filters (new/processing/shipped/delivered/disputed), per-line vendor view, status updates, packing slips/invoices, buyer messaging
- Fulfillment: shipping labels/pickups, handling-time SLA, tracking, returns/RMA workflow
- Catalog: products CRUD, inventory, pricing/discounts, variants/options, media, categories/tags, bulk import (CSV)
- Payouts: bank accounts (per country/provider), recipient status, settlements ledger, withdrawal history, exports
- Analytics: sales by day/product, top SKUs, cancellations/refunds, geo, conversion and repeat rate
- Marketing: coupons, featured items, cross/upsell, store banner/SEO
- Reviews/support: ratings management, dispute center, support tickets
- Settings: store profile/branding, addresses (business/pickup), policies (shipping/returns), notifications
- Multi‑country: country/currency selection, shipping regions, bank provider per country

### Phase 1: Quick Apply (Minimal Form)
- Goal: Let a buyer quickly create a seller account with minimal friction; collect only what is required to create a payout recipient and a basic store shell.
- Page: `/vendor/apply`
- Required fields (client):
  - Store: store name (required), description (optional), logo URL (optional)
  - Payout method: Paystack or Flutterwave (select)
  - Bank selection (dropdown populated via provider bank list)
  - Account number (text)
  - Auto-resolved account name (read-only after resolve)
- Behavior:
  - Fetch bank list from the selected provider (Paystack: `/bank`, Flutterwave: `/banks/NG`) and populate a dropdown (do not ask users to type bank code).
  - Resolve account (Paystack `/bank/resolve`, Flutterwave `/accounts/resolve`) on blur/submit to show and confirm account name.
  - Create and persist provider `recipient_code` on the server, and save it to `User.store.payout`.
  - On success: set `role: "seller"`, `store.status: "pending"`; redirect to `/vendor` with a “Complete your onboarding” banner.

### Phase 2: Seller Profile Completion (Full Onboarding)
- Page: `/vendor/profile` (or integrated sections in `/vendor`)
- Sections and fields:
  - Store Profile:
    - Store name (slug auto-generated), description, logo, banner
    - Primary category, tags
    - Store policies (shipping regions, handling time, return/refund policy)
  - Contact & Identity (KYC):
    - Full name, phone, email (pre-fill)
    - Government ID: type (NIN/BVN/Passport), ID number, ID photo upload
    - Selfie (face match, optional in v1), DOB
  - Business (if applicable):
    - Registered business name, CAC/registration number, doc upload, TIN
  - Addresses:
    - Business address, pickup address (country/city/line), default flags
  - Payouts:
    - Provider (Paystack/Flutterwave), Bank dropdown, Account number (auto-resolve), Saved `recipient_code`
  - Compliance:
    - Seller Terms consent, AML/KYC attestations
- Behavior:
  - Save incrementally to `User.store` and `User.addresses` via authenticated `PUT /api/v1/users/me` and `POST/PUT /api/v1/users/me/addresses`.
  - Show completion checklist; prevent listing until checklist passes (configurable).

### Admin Review & Approval
- Admin pages (future): `/admin/sellers`
- States: `store.status = "pending" | "approved" | "rejected"`
- Actions:
  - Review KYC/docs, payout readiness
  - Approve → seller can list products and receive payouts
  - Reject (with reason) → notify seller; allow resubmission
- API (proposed):
  - `PUT /api/v1/admin/vendors/:id/approve`
  - `PUT /api/v1/admin/vendors/:id/reject` (body: reason)

### Data Model
- `User.store` (added):
  - `name?: string`
  - `description?: string`
  - `logoUrl?: string`
  - `bannerUrl?: string`
  - `slug?: string`
  - `primaryCategory?: string`
  - `status?: "pending" | "approved" | "rejected"`
  - `payout?: { provider?: "paystack" | "flutterwave"; recipientCode?: string; bankName?: string; bankCode?: string; accountNumber?: string; accountName?: string }`
  - `policies?: { shippingRegions?: string[]; handlingDays?: number; returnPolicy?: string }`
  - `kyc?: { idType?: string; idNumber?: string; idUrl?: string; selfieUrl?: string; dob?: string; businessName?: string; regNumber?: string; regDocUrl?: string; tin?: string }`

### Backend Endpoints (current + proposed)
- Current:
  - `POST /api/v1/vendors/become` → minimal onboarding + payout recipient
  - `GET /api/v1/vendors/overview` → KPIs
  - `GET /api/v1/vendors/products` | `POST /api/v1/vendors/products` | `PUT /api/v1/vendors/products/:id` | `DELETE /api/v1/vendors/products/:id`
  - `GET /api/v1/vendors/orders` → seller-slice orders
  - `GET /api/v1/vendors/payouts`
- Proposed additions:
  - `GET /api/v1/providers/paystack/banks` (server-side proxy)
  - `GET /api/v1/providers/flutterwave/banks` (server-side proxy)
  - `POST /api/v1/vendors/payout/resolve` → resolve account (provider+bankCode+acctNumber) and return accountName
  - `PUT /api/v1/users/me` → accept `store` patch, including `store.status` guard on non-admin
  - Admin: approve/reject endpoints as above

### Frontend Pages
- `/vendor/apply` (minimal): store name, provider, bank dropdown, account number → auto-resolve → create recipient → success
- `/vendor` (dashboard): KPIs (products, orders, revenue), recent orders, CTA to complete onboarding, link to add product
- `/vendor/profile` (or tabs within `/vendor`): full onboarding sections
- `/vendor/products/new` & `/vendor/products/:id`

### Payouts & Bank Codes
- We fetch bank lists from the chosen provider and display a dropdown. The selected entry provides the `bank_code` (Paystack) or `account_bank` (Flutterwave). We never ask the seller to type bank codes.
- Account resolution is performed before saving to ensure correctness; we store the `recipientCode` for payouts.

### Notifications
- Email to seller on: application received, approved/rejected, payout failures
- Toasts and inline hints for onboarding progress

### Access Control
- Auth required for all vendor endpoints; admin routes require `role: "admin"`.
- Sellers can only manage products they own.

### Validation & UX
- Server-side validation for all fields; rate limit account resolve to prevent abuse.
- Image URL validation; file uploads can be added later (S3, etc.).
- Progressive disclosure: start minimal, guide to full onboarding.

### Analytics & Logs
- Track time-to-approval, onboarding completion rate, payout setup success, and listing conversion.

### Testing Checklist
- Apply as seller with valid bank/account → recipient created, `store.status = pending`
- Switch provider and re-enter → account resolves, payout updates
- Complete KYC and addresses → saved to user profile
- Admin approval toggles `store.status = approved` and listings enabled
- Seller creates product and sees it on dashboard; receives orders; payouts visible when generated

### Implementation status (current code)
- Minimal vendor onboarding (/vendor/apply) with Paystack bank dropdown and account resolve; saves `recipientCode`, sets user role to seller.
- Vendor dashboard (/vendor) with basic KPIs and lists.
- Seller API: `POST /vendors/become`, KPIs, products CRUD, seller orders slice, payouts list.
- Seller domain added: `Seller` model + routes (`/api/v1/sellers`).
- Provider utilities: Paystack + Flutterwave bank lists and account resolve endpoints.

### Progress log
- Added Flutterwave bank utilities and endpoints; vendor apply supports Paystack/Flutterwave with dynamic bank dropdown and account resolve (multi‑country via `country` code).
- Added `/vendor/profile` with tabs (Store, Payouts, KYC, Policies, Addresses) and save.


### Next PRs to implement
- Add provider routes for Flutterwave: list banks and resolve accounts, including multi-country.
- Build `/vendor/profile` with tabs (Store, Payouts, KYC, Policies, Addresses) and wire to APIs.
- Add vendor order status update API and UI buttons.
- Add seller analytics endpoints and frontend charts.

