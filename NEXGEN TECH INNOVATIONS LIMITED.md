# Glotrade International Platform
## Complete Enterprise E-Commerce & Investment Ecosystem

**Version:** 1.0.0  
**Platform:** Glotrade International  
**Developer:** NEXGEN TECH INNOVATIONS LIMITED  
**Last Updated:** December 25, 2025  
**Status:** ✅ Production Ready  

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Platform Overview](#platform-overview)
3. [Technical Architecture](#technical-architecture)
4. [Platform Valuation](#platform-valuation)
5. [Core Modules](#core-modules)
6. [API Endpoints](#api-endpoints)
7. [Database Models](#database-models)
8. [Frontend Pages](#frontend-pages)
9. [Security & Compliance](#security--compliance)
10. [Business Logic](#business-logic)
11. [Automation & Cron Jobs](#automation--cron-jobs)
12. [Deployment Guide](#deployment-guide)
13. [Pricing Strategy](#pricing-strategy)
14. [Client Proposal Template](#client-proposal-template)
15. [Revenue Opportunities](#revenue-opportunities)

---

## 🎯 Executive Summary

Glotrade International is a **comprehensive enterprise platform** that combines six major systems into one unified solution:

### Platform Components

1. **Multi-Vendor E-Commerce Marketplace** - Complete online shopping platform
2. **Integrated FinTech Wallet System** - Digital payments & transactions
3. **GDIP Investment Trading Platform** - Automated commodity-backed investments
4. **MLM Commission Network** - Multi-level referral & agent system
5. **Business Credit Management** - Corporate financing & credit limits
6. **Enterprise Admin Platform** - Complete oversight & analytics

### Scale & Statistics

- **325+ REST API Endpoints** across 31 route files
- **68 Frontend Pages** (Next.js App Router with TypeScript)
- **31 Database Models** (MongoDB with Mongoose ODM)
- **26 Controllers** handling business logic
- **40+ Services** for core functionality
- **6 Middleware Layers** for security & validation
- **8,000+ Lines of TypeScript Code**
- **Multi-role Architecture** (6 user types)

### Technology Stack

```typescript
// Backend
- Runtime: Node.js
- Framework: Express.js
- Language: TypeScript
- Database: MongoDB + Mongoose ODM
- Authentication: JWT + Cookie-based sessions
- Payments: Paystack Integration
- Real-time: WebSocket support
- Scheduling: node-cron

// Frontend
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: React Hooks
- API Client: Fetch API / Axios

// Infrastructure
- Frontend Hosting: Vercel
- Backend Hosting: Render
- Database: MongoDB Atlas
- CDN: Cloudflare R2
- SSL: Let's Encrypt
```

---

## 🏗️ Platform Overview

### What Makes Glotrade Unique

Glotrade International is not just an e-commerce platform - it's a **complete business ecosystem** that enables:

1. **Product Commerce** - Buy and sell physical/digital goods
2. **Investment Trading** - Automated 37-day trade cycles with insurance
3. **Agent Networking** - Multi-level commission structure
4. **Digital Payments** - Integrated wallet for all transactions
5. **Business Credit** - Corporate financing capabilities
6. **Real-time Operations** - Live updates and notifications

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     GLOTRADE INTERNATIONAL                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Customer │  │  Vendor  │  │   Agent  │  │  Admin   │      │
│  │Dashboard │  │Dashboard │  │Dashboard │  │Dashboard │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │              │             │              │
│       └─────────────┴──────────────┴─────────────┘              │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │   Next.js 14    │                           │
│                   │   TypeScript    │                           │
│                   └────────┬────────┘                           │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │  API Gateway    │                           │
│                   │  Express.js     │                           │
│                   │  319+ Endpoints │                           │
│                   └────────┬────────┘                           │
│                            │                                     │
│       ┌────────────────────┼────────────────────┐              │
│       │                    │                    │              │
│  ┌────▼─────┐  ┌──────────▼──────────┐  ┌─────▼──────┐       │
│  │ Market   │  │  GDIP Investment    │  │   Wallet   │       │
│  │ System   │  │  Trading Platform   │  │   System   │       │
│  │ 60+ APIs │  │     21+ APIs        │  │  45+ APIs  │       │
│  └────┬─────┘  └──────────┬──────────┘  └─────┬──────┘       │
│       │                    │                    │              │
│       └────────────────────┼────────────────────┘              │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │    MongoDB      │                           │
│                   │  31 Collections │                           │
│                   └─────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### User Roles & Capabilities

| Role | Dashboard Access | Key Features | API Endpoints |
|------|-----------------|--------------|---------------|
| **Guest Buyer** | Limited | Browse, cart, checkout | 40+ |
| **Registered Customer** | Full | Orders, wallet, reviews, GDIP | 100+ |
| **Sales Agent** | Agent Portal | Referrals, commissions, payouts | 30+ |
| **Wholesaler** | Business Portal | Bulk orders, credit, GDIP | 80+ |
| **Distributor** | Business Portal | Vendor tools, credit, GDIP | 90+ |
| **Trusted Insured Partner** | GDIP Portal | Investment, cycles, insurance | 25+ |
| **Vendor/Seller** | Vendor Dashboard | Products, orders, analytics | 70+ |
| **Admin** | Admin Dashboard | Complete oversight | 150+ |

---

## 💰 Platform Valuation

### Individual Module Valuations

#### 1. Multi-Vendor E-Commerce Platform
**Market Value: ₦20,000,000 - ₦35,000,000**

Features:
- Product catalog management (1,000+ products)
- Category hierarchy & filtering
- Advanced search with faceted navigation
- Shopping cart & wishlist
- Order management system
- Inventory tracking
- Product reviews & ratings (5-star system)
- Vendor onboarding & management
- Multi-vendor commission tracking
- Best-selling products analytics

Comparable Platforms:
- Jumia (basic): $50M+ valuation
- Konga clone: ₦15M - ₦25M
- Custom marketplace: ₦20M - ₦40M

#### 2. FinTech Wallet & Payment System
**Market Value: ₦25,000,000 - ₦45,000,000**

Features:
- Digital wallet infrastructure
- Paystack payment gateway integration
- Wallet-to-wallet transfers
- Transaction history & statements
- Payment verification & webhooks
- Refund processing
- Balance management
- Multiple payment methods
- PCI-DSS compliance
- Real-time transaction notifications

Comparable Platforms:
- Paystack (payments only): $200M valuation
- OPay wallet system: $2B valuation
- Custom wallet: ₦20M - ₦40M

#### 3. GDIP Investment Trading Platform
**Market Value: ₦30,000,000 - ₦50,000,000**

Features:
- ₦1,000,000 investment blocks (TPIAs)
- Automated GDC clustering (10 TPIAs per cluster)
- 37-day automated trade cycles
- Dual profit modes (TPM compound / EPS withdrawal)
- 5% target ROI per cycle
- 100% insurance coverage
- Unique 13-digit insurance certificates
- Commodity backing (Rice, Sugar, Wheat, Corn, etc.)
- Dynamic commodity selection (Admin manageable)
- Real-time portfolio tracking
- Automated profit distribution
- Claims processing system
- Commodity CRUD management for Admins

Comparable Platforms:
- Piggyvest: $300M+ valuation
- Risevest: $100M+ valuation
- Custom investment platform: ₦25M - ₦45M

#### 4. MLM Commission Network
**Market Value: ₦15,000,000 - ₦25,000,000**

Features:
- Multi-level referral tracking
- Unique referral links per agent
- Automated commission calculations
- Commission based on product discounts
- Agent performance dashboard
- Payout management system
- Withdrawal requests (₦100k threshold)
- Commission history & analytics
- Team performance tracking
- Downline management

Comparable Platforms:
- PalmPay agent network: $1B+ valuation
- Custom MLM system: ₦12M - ₦20M

#### 5. Business Credit Management
**Market Value: ₦10,000,000 - ₦20,000,000**

Features:
- Credit application workflow
- Document upload & verification
- Credit limit assignment
- Usage tracking
- Credit history
- Payment reminders
- Interest calculations
- Approval workflows
- Business document management

Comparable Platforms:
- TradeDepot credit: $110M valuation
- Custom B2B credit: ₦8M - ₦15M

#### 6. Enterprise Admin Platform
**Market Value: ₦15,000,000 - ₦25,000,000**

Features:
- User management (all roles)
- Vendor approval workflows
- Order oversight & intervention
- Payment monitoring
- GDIP cycle management
- Commission approval
- Credit request processing
- Security incident reports
- System analytics & KPIs
- Performance dashboards
- Audit logs

### Total Platform Valuation

| Component | Conservative | Market Rate | Premium |
|-----------|-------------|-------------|---------|
| E-Commerce | ₦20M | ₦27.5M | ₦35M |
| FinTech Wallet | ₦25M | ₦35M | ₦45M |
| GDIP Investment | ₦30M | ₦40M | ₦50M |
| MLM Network | ₦15M | ₦20M | ₦25M |
| Credit Management | ₦10M | ₦15M | ₦20M |
| Admin Platform | ₦15M | ₦20M | ₦25M |
| **TOTAL** | **₦115M** | **₦157.5M** | **₦200M** |

### International Comparison

If built by offshore development teams:

| Region | Hourly Rate | Est. Hours | Total Cost |
|--------|------------|------------|------------|
| **United States** | $150 - $250 | 2,000+ | $300K - $500K |
| **Western Europe** | $100 - $180 | 2,000+ | $200K - $360K |
| **Eastern Europe** | $50 - $100 | 2,000+ | $100K - $200K |
| **Nigeria (NEXGEN)** | Competitive | 2,000+ | ₦60M - ₦80M |

**Conversion to Naira (at ₦640/$):**
- US Build: ₦192M - ₦320M
- EU Build: ₦128M - ₦230M
- NEXGEN: ₦60M - ₦80M (65-75% savings!)

---

## 🔧 Core Modules

### Module 1: Authentication & User Management

**Location:** `apps/api/src/routes/auth.routes.ts`  
**Endpoints:** 40+  
**Models:** User, Token, UserPreferences

#### Key Features

```typescript
// User Registration with Role Assignment
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "businessType": "distributor", // wholesaler, distributor, agent
  "role": "customer" // auto-assigned based on businessType
}

// JWT Authentication
POST /api/v1/auth/login
Response: {
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { /* user object */ }
}

// KYC Verification (Required for GDIP)
POST /api/v1/users/kyc/submit
PUT /api/v1/admin/users/:id/kyc/verify
```

#### Business Logic

- **Role-Based Access Control (RBAC):**
  - Guest: Browse only
  - Customer: Full shopping + wallet
  - Agent: + Referral tracking
  - Wholesaler: + Bulk orders + GDIP access
  - Distributor: + Vendor tools + GDIP access
  - Admin: Complete control

- **KYC Requirements:**
  - Business registration documents
  - Bank account verification
  - ID card/passport
  - Business address proof
  - Required for: GDIP access, high-value transactions

### Module 2: Multi-Vendor Marketplace

**Location:** `apps/api/src/routes/market.routes.ts`  
**Endpoints:** 60+  
**Models:** Product, Category, ProductReview, Seller

#### Product Management

```typescript
// Create Product (Vendor)
POST /api/v1/market/products
{
  "name": "MacBook Pro 2025",
  "brand": "Apple",
  "category": "Laptops",
  "price": 1500000,
  "discountPrice": 1350000,
  "minOrder": 50,
  "stock": 100,
  "description": "Latest MacBook Pro...",
  "images": ["url1", "url2"],
  "specifications": {
    "processor": "M3 Pro",
    "ram": "16GB",
    "storage": "512GB SSD"
  }
}

// Advanced Search & Filtering
GET /api/v1/market/products?
  category=Laptops&
  minPrice=1000000&
  maxPrice=2000000&
  brand=Apple&
  ratingMin=4&
  sort=-createdAt&
  page=1&
  limit=20

// Product Reviews
POST /api/v1/market/products/:id/reviews
{
  "rating": 5,
  "comment": "Excellent product!",
  "images": ["review_img1.jpg"]
}
```

#### Category Hierarchy

```
Electronics
├── Laptops
├── Smartphones
│   ├── iOS
│   └── Android
├── Accessories
└── Gaming

Fashion
├── Men's Clothing
├── Women's Clothing
├── Shoes
└── Accessories

Food & Beverages
├── Groceries
├── Beverages
└── Snacks
```

### Module 3: Order Management

**Location:** `apps/api/src/routes/orders.routes.ts`  
**Endpoints:** 35+  
**Models:** Order, Transaction

#### Order Flow

```typescript
// Create Order from Cart
POST /api/v1/orders/create
{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 1350000
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "zipCode": "100001",
    "phone": "+2348012345678"
  },
  "paymentMethod": "wallet", // or "paystack"
  "useWallet": true
}

// Order Status Workflow
Pending → Confirmed → Processing → Shipped → Delivered → Completed

// Track Order
GET /api/v1/orders/:orderId/track
Response: {
  "orderId": "ORD-2025-001",
  "status": "shipped",
  "tracking": [
    { "status": "confirmed", "timestamp": "2025-12-20T10:00:00Z" },
    { "status": "processing", "timestamp": "2025-12-20T14:00:00Z" },
    { "status": "shipped", "timestamp": "2025-12-21T09:00:00Z" }
  ],
  "estimatedDelivery": "2025-12-23"
}
```

### Module 4: Wallet & Payment System

**Location:** `apps/api/src/routes/wallets.routes.ts`, `payments.routes.ts`  
**Endpoints:** 45+  
**Models:** Wallet, WalletTransaction, Payment

#### Wallet Operations

```typescript
// Fund Wallet (Paystack)
POST /api/v1/wallets/fund
{
  "amount": 50000,
  "method": "paystack"
}
Response: {
  "authorization_url": "https://checkout.paystack.com/...",
  "reference": "TXN_123456789"
}

// Wallet Transfer
POST /api/v1/wallets/transfer
{
  "recipientEmail": "recipient@example.com",
  "amount": 10000,
  "description": "Payment for goods"
}

// Checkout Options
1. Wallet Only: Deduct from balance
2. Paystack Only: Direct card payment
3. Mixed: Wallet + Paystack (if insufficient balance)

// Transaction History
GET /api/v1/wallets/transactions?
  type=credit&
  startDate=2025-01-01&
  endDate=2025-12-31&
  page=1&
  limit=50
```

#### Paystack Integration

```typescript
// Webhook Handler
POST /api/v1/payments/paystack/webhook
Headers: {
  "x-paystack-signature": "signature_here"
}

// Payment Verification
GET /api/v1/payments/verify/:reference
Response: {
  "status": "success",
  "amount": 50000,
  "currency": "NGN",
  "customer": { /* customer details */ }
}
```

### Module 5: GDIP Investment Platform

**Location:** `apps/api/src/routes/gdip.routes.ts`  
**Endpoints:** 25+  
**Models:** TPIA, GDC, TradeCycle, Insurance, Commodity, CommodityType  

#### Investment Flow

```typescript
// Purchase TPIA (₦1M Investment Block)
POST /api/v1/gdip/tpia/purchase
{
  "commodityType": "rice", // sugar, oil, wheat, etc.
  "profitMode": "TPM" // or "EPS"
}

// Requirements:
- KYC verified
- Business type: Wholesaler or Distributor
- Wallet balance: ≥ ₦1,000,000
- Account status: Active

// Auto-processes:
1. Deduct ₦1M from wallet
2. Create TPIA with unique ID (e.g., TPIA-2025-001-0001)
3. Generate insurance certificate (13-digit)
4. Assign to available GDC
5. If GDC full (10/10), schedule first 37-day cycle
6. Create wallet transaction record
7. Admin: Dynamically manage commodity options via CRUD interface

// TPIA Details
GET /api/v1/gdip/tpia/:id
Response: {
  "tpiaId": "TPIA-2025-001-0001",
  "userId": "user_123",
  "investmentAmount": 1000000,
  "currentValue": 1050000, // After profit
  "profitMode": "TPM",
  "commodityType": "rice",
  "gdcId": "GDC-2025-001",
  "insuranceNumber": "INS1234567890",
  "status": "active",
  "completedCycles": 2,
  "totalProfit": 50000,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### GDC Clustering System

```typescript
// GDC Structure
{
  "gdcId": "GDC-2025-001",
  "tpias": ["TPIA-001", "TPIA-002", ..., "TPIA-010"],
  "capacity": 10,
  "filled": 10,
  "status": "full",
  "totalInvestment": 10000000, // ₦10M
  "activeCycles": 3,
  "totalProfitDistributed": 1500000
}

// Auto-clustering Logic:
1. User purchases TPIA
2. System finds available GDC (capacity < 10)
3. Assigns TPIA to GDC
4. If GDC reaches 10/10:
   - Mark as "full"
   - Schedule first trade cycle (37 days from now)
   - Create new empty GDC for future TPIAs
```

#### Trade Cycle Automation

```typescript
// Cycle Lifecycle (37 Days)
Scheduled → Active → Processing → Completed

// Cron Job Schedule
Daily 2:00 AM - Start scheduled cycles
Daily 3:00 AM - Complete active cycles (calculate 5% profit)
Daily 4:00 AM - Schedule new cycles for full GDCs
Sunday 1:00 AM - Generate weekly reports

// Profit Distribution
TPM Mode (Compound):
- 5% added to TPIA currentValue
- Example: ₦1,000,000 → ₦1,050,000

EPS Mode (Withdrawal):
- 5% credited to user wallet
- Example: ₦1,000,000 investment → ₦50,000 to wallet
- TPIA value remains ₦1,000,000

// Switch Profit Mode
PUT /api/v1/gdip/tpia/:id/profit-mode
{
  "profitMode": "EPS" // or "TPM"
}
// Takes effect on next cycle
```

#### Insurance System

```typescript
// Insurance Certificate
GET /api/v1/insurance/certificate/:tpiaId
Response: {
  "insuranceNumber": "INS1234567890",
  "tpiaId": "TPIA-2025-001-0001",
  "coverageAmount": 1000000,
  "issuedDate": "2025-01-15",
  "expiryDate": "2026-01-15",
  "status": "active",
  "claimsHistory": []
}

// File Insurance Claim
POST /api/v1/insurance/claim/:tpiaId
{
  "claimType": "total_loss", // or "partial_loss"
  "reason": "Commodity damage",
  "evidence": ["doc1.pdf", "photo1.jpg"]
}

// Admin: Process Claim
PUT /api/v1/insurance/:insuranceId/claim/:claimNum
{
  "status": "approved", // or "rejected"
  "payoutAmount": 1000000,
  "notes": "Verified commodity loss"
}
```

#### Commodity Backing

```typescript
// Commodity Price Updates
PUT /api/v1/commodity/:commodityId/price
{
  "currentPrice": 45000, // per bag/unit
  "previousPrice": 42000,
  "priceChange": 7.14
}

// Bulk Update (Admin)
POST /api/v1/commodity/prices/bulk
{
  "prices": [
    { "type": "rice", "price": 45000 },
    { "type": "sugar", "price": 38000 },
    { "type": "oil", "price": 52000 }
  ]
}

// TPIA Commodity Backing
GET /api/v1/commodity/backing/:tpiaId
Response: {
  "tpiaId": "TPIA-2025-001-0001",
  "commodityType": "rice",
  "quantityBacked": 22.22, // bags (₦1M ÷ ₦45k)
  "currentMarketValue": 1000000,
  "warehouseLocation": "Lagos Warehouse A",
  "lastAuditDate": "2025-12-01"
}
```

### Module 6: Commission & Referral System

**Location:** `apps/api/src/routes/commissions.routes.ts`, `referrals.routes.ts`  
**Endpoints:** 20+  
**Models:** Commission, Referral

#### Referral Mechanism

```typescript
// Agent Referral Link
GET /api/v1/referrals/my-link
Response: {
  "referralCode": "AG-2025-JD-123456",
  "referralLink": "https://glotrade.com/register?ref=AG-2025-JD-123456",
  "totalReferrals": 45,
  "activeReferrals": 32,
  "totalCommissions": 1250000
}

// Commission Calculation Logic
1. User signs up via agent's referral link
2. User purchases discounted product
3. Commission = Original Price - Discounted Price
4. Example:
   - Original: ₦150,000
   - Discount: ₦135,000
   - Commission: ₦15,000 → Agent's wallet

// Multi-Level Tracking
{
  "level1": {
    "referrals": 10,
    "commissions": 500000
  },
  "level2": {
    "referrals": 35,
    "commissions": 750000
  }
}
```

#### Withdrawal System

```typescript
// Request Withdrawal
POST /api/v1/commissions/withdraw
{
  "amount": 150000,
  "bankAccount": {
    "bankName": "GTBank",
    "accountNumber": "0123456789",
    "accountName": "John Doe"
  }
}

// Requirements:
- Minimum balance: ₦100,000
- KYC verified
- Bank account verified

// Admin: Process Withdrawal
PUT /api/v1/admin/withdrawals/:id/process
{
  "status": "approved", // or "rejected"
  "transactionReference": "TXN_987654321",
  "notes": "Processed via bank transfer"
}
```

---

## 📡 API Endpoints (325+ Total)

### Complete Endpoint List by Module

#### Authentication & Users (40+)
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email
GET    /api/v1/auth/me
PUT    /api/v1/auth/change-password

GET    /api/v1/users/profile
PUT    /api/v1/users/profile
DELETE /api/v1/users/account
POST   /api/v1/users/avatar
GET    /api/v1/users/preferences
PUT    /api/v1/users/preferences
POST   /api/v1/users/kyc/submit
GET    /api/v1/users/kyc/status
PUT    /api/v1/users/kyc/documents
```

#### Marketplace (60+)
```
# Products
GET    /api/v1/market/products
GET    /api/v1/market/products/:id
POST   /api/v1/market/products (Vendor)
PUT    /api/v1/market/products/:id (Vendor)
DELETE /api/v1/market/products/:id (Vendor)
GET    /api/v1/market/products/search
GET    /api/v1/market/products/best-selling
GET    /api/v1/market/products/featured
GET    /api/v1/market/products/new-arrivals

# Categories
GET    /api/v1/market/categories
GET    /api/v1/market/categories/:id/products
POST   /api/v1/market/categories (Admin)
PUT    /api/v1/market/categories/:id (Admin)

# Reviews
GET    /api/v1/market/products/:id/reviews
POST   /api/v1/market/products/:id/reviews
PUT    /api/v1/market/reviews/:id
DELETE /api/v1/market/reviews/:id

# Wishlist
GET    /api/v1/market/wishlist
POST   /api/v1/market/wishlist/:productId
DELETE /api/v1/market/wishlist/:productId
```

#### Orders (35+)
```
GET    /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders/create
PUT    /api/v1/orders/:id/cancel
GET    /api/v1/orders/:id/track
GET    /api/v1/orders/:id/invoice

# Vendor Order Management
GET    /api/v1/vendors/orders
PUT    /api/v1/vendors/orders/:id/confirm
PUT    /api/v1/vendors/orders/:id/ship
PUT    /api/v1/vendors/orders/:id/deliver

# Admin Oversight
GET    /api/v1/admin/orders
PUT    /api/v1/admin/orders/:id/intervene
```

#### Payments & Wallet (45+)
```
# Wallet Operations
GET    /api/v1/wallets/balance
GET    /api/v1/wallets/transactions
POST   /api/v1/wallets/fund
POST   /api/v1/wallets/transfer
GET    /api/v1/wallets/statement

# Paystack Integration
POST   /api/v1/payments/initialize
GET    /api/v1/payments/verify/:reference
POST   /api/v1/payments/paystack/webhook
GET    /api/v1/payments/history

# Payouts
GET    /api/v1/payouts
POST   /api/v1/payouts/request
GET    /api/v1/payouts/:id
PUT    /api/v1/admin/payouts/:id/approve
```

#### GDIP Platform (21+)
```
# TPIA Management
POST   /api/v1/gdip/tpia/purchase
GET    /api/v1/gdip/portfolio
GET    /api/v1/gdip/tpias
GET    /api/v1/gdip/tpia/:id
PUT    /api/v1/gdip/tpia/:id/profit-mode
GET    /api/v1/gdip/tpia/:id/cycles

# GDC Operations
GET    /api/v1/gdip/gdc/:id
GET    /api/v1/admin/gdip/gdcs
GET    /api/v1/admin/gdip/gdcs/:id/details

# Trade Cycles
POST   /api/v1/admin/gdip/cycle/create
POST   /api/v1/admin/gdip/cycle/:id/complete
POST   /api/v1/admin/gdip/cycle/:id/distribute
GET    /api/v1/admin/gdip/cycles
GET    /api/v1/admin/gdip/tpias
GET    /api/v1/admin/gdip/partners

# Insurance
GET    /api/v1/insurance/certificate/:tpiaId
POST   /api/v1/insurance/claim/:tpiaId
PUT    /api/v1/insurance/:id/claim/:claimNum
GET    /api/v1/insurance/claims

# Commodity
PUT    /api/v1/commodity/:id/price
POST   /api/v1/commodity/prices/bulk
GET    /api/v1/commodity/prices
GET    /api/v1/commodity/backing/:tpiaId
```

#### Vendor Management (30+)
```
# Vendor Registration & Profile
POST   /api/v1/vendors/register
GET    /api/v1/vendors/profile
PUT    /api/v1/vendors/profile
POST   /api/v1/vendors/documents

# Product Management
GET    /api/v1/vendors/products
POST   /api/v1/vendors/products
PUT    /api/v1/vendors/products/:id
DELETE /api/v1/vendors/products/:id
PUT    /api/v1/vendors/products/:id/stock

# Analytics
GET    /api/v1/vendors/analytics/sales
GET    /api/v1/vendors/analytics/products
GET    /api/v1/vendors/analytics/customers
GET    /api/v1/vendors/analytics/revenue

# Store Management
GET    /api/v1/sellers/:id
POST   /api/v1/sellers/:id/follow
DELETE /api/v1/sellers/:id/unfollow
GET    /api/v1/sellers/:id/followers
GET    /api/v1/sellers/:id/products
```

#### Commission & Referrals (20+)
```
# Referral System
GET    /api/v1/referrals/my-link
GET    /api/v1/referrals/stats
GET    /api/v1/referrals/downline
GET    /api/v1/referrals/history

# Commission Management
GET    /api/v1/commissions/balance
GET    /api/v1/commissions/history
POST   /api/v1/commissions/withdraw
GET    /api/v1/commissions/withdrawals
GET    /api/v1/commissions/analytics

# Admin Commission Control
GET    /api/v1/admin/commissions/pending
PUT    /api/v1/admin/commissions/:id/approve
GET    /api/v1/admin/commissions/stats
```

#### Credit Management (15+)
```
# Credit Requests
POST   /api/v1/credit-requests
GET    /api/v1/credit-requests
GET    /api/v1/credit-requests/:id
PUT    /api/v1/credit-requests/:id/cancel

# Admin Credit Control
GET    /api/v1/admin/credit-requests
PUT    /api/v1/admin/credit-requests/:id/approve
PUT    /api/v1/admin/credit-requests/:id/reject
GET    /api/v1/admin/credit-requests/stats

# Credit Usage
GET    /api/v1/credit/balance
GET    /api/v1/credit/history
POST   /api/v1/credit/repay
```

#### Admin Panel (50+)
```
# User Management
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
PUT    /api/v1/admin/users/:id/status
PUT    /api/v1/admin/users/:id/role
DELETE /api/v1/admin/users/:id
PUT    /api/v1/admin/users/:id/kyc/verify

# Vendor Management
GET    /api/v1/admin/vendors
PUT    /api/v1/admin/vendors/:id/approve
PUT    /api/v1/admin/vendors/:id/suspend
GET    /api/v1/admin/vendors/:id/documents

# Order Management
GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/stats
PUT    /api/v1/admin/orders/:id/intervene
DELETE /api/v1/admin/orders/:id

# Payment Monitoring
GET    /api/v1/admin/payments
GET    /api/v1/admin/payments/stats
GET    /api/v1/admin/wallets/overview
GET    /api/v1/admin/transactions

# Platform Analytics
GET    /api/v1/admin/dashboard/stats
GET    /api/v1/admin/analytics/revenue
GET    /api/v1/admin/analytics/users
GET    /api/v1/admin/analytics/products
GET    /api/v1/admin/analytics/gdip
GET    /api/v1/admin/reports/generate
```

#### Notifications (15+)
```
GET    /api/v1/notifications
GET    /api/v1/notifications/unread
PUT    /api/v1/notifications/:id/read
PUT    /api/v1/notifications/read-all
DELETE /api/v1/notifications/:id
GET    /api/v1/notifications/preferences
PUT    /api/v1/notifications/preferences
```

#### Security & Compliance (20+)
```
# Security Reports
POST   /api/v1/security-reports
GET    /api/v1/security-reports
GET    /api/v1/security-reports/:id
PUT    /api/v1/admin/security-reports/:id/investigate

# Business Documents
POST   /api/v1/business-documents
GET    /api/v1/business-documents
PUT    /api/v1/business-documents/:id
DELETE /api/v1/business-documents/:id
PUT    /api/v1/admin/business-documents/:id/verify

# Audit Logs
GET    /api/v1/admin/audit-logs
GET    /api/v1/admin/audit-logs/user/:userId
GET    /api/v1/admin/audit-logs/action/:action
```

#### File Management (15+)
```
POST   /api/v1/files/upload
GET    /api/v1/files/:id
DELETE /api/v1/files/:id
POST   /api/v1/avatars/upload
POST   /api/v1/product-images/upload
POST   /api/v1/banners/upload
GET    /api/v1/banners
PUT    /api/v1/admin/banners/:id
```

#### Vouchers & Promotions (10+)
```
GET    /api/v1/vouchers
POST   /api/v1/vouchers/apply
GET    /api/v1/vouchers/:code/validate
POST   /api/v1/admin/vouchers
PUT    /api/v1/admin/vouchers/:id
DELETE /api/v1/admin/vouchers/:id
GET    /api/v1/admin/vouchers/stats
```

---

## 💾 Database Models (30 Collections)

### Core User Models

#### 1. User Model
```typescript
interface IUser {
  _id: ObjectId;
  email: string; // unique, indexed
  password: string; // bcrypt hashed
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'vendor' | 'agent' | 'admin';
  businessType?: 'wholesaler' | 'distributor' | 'agent';
  
  // KYC
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycDocuments: string[];
  kycVerifiedAt?: Date;
  
  // Account Status
  isActive: boolean;
  isEmailVerified: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  
  // Profile
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Referral
  referralCode: string; // unique
  referredBy?: ObjectId; // User ID
  
  // Metadata
  lastLogin?: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
email: unique
referralCode: unique
kycStatus, businessType: compound
```

#### 2. Token Model
```typescript
interface IToken {
  _id: ObjectId;
  userId: ObjectId; // ref: User
  token: string; // JWT token
  type: 'access' | 'refresh' | 'reset' | 'verification';
  expires: Date;
  isRevoked: boolean;
  createdAt: Date;
}

// Indexes
token: unique
userId, type: compound
expires: TTL index (auto-delete expired)
```

#### 3. UserPreferences Model
```typescript
interface IUserPreferences {
  _id: ObjectId;
  userId: ObjectId; // ref: User
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  
  // Communication Preferences
  marketingEmails: boolean;
  orderUpdates: boolean;
  promotionalSMS: boolean;
  
  // Display
  language: string; // 'en', 'yo', etc.
  currency: string; // 'NGN'
  
  updatedAt: Date;
}
```

### Marketplace Models

#### 4. Product Model
```typescript
interface IProduct {
  _id: ObjectId;
  name: string;
  slug: string; // unique, indexed
  brand: string;
  category: string;
  
  // Pricing
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  
  // Inventory
  stock: number;
  minOrder: number;
  sku?: string;
  
  // Details
  description: string;
  shortDescription?: string;
  specifications?: Record<string, any>;
  
  // Media
  images: string[];
  mainImage: string;
  
  // Vendor
  vendorId: ObjectId; // ref: User
  
  // Status
  isActive: boolean;
  isFeatured: boolean;
  
  // Metrics
  views: number;
  sales: number;
  rating: number;
  reviewCount: number;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
slug: unique
vendorId, isActive: compound
category, price: compound
name: text index (for search)
```

#### 5. Category Model
```typescript
interface ICategory {
  _id: ObjectId;
  name: string;
  slug: string; // unique
  description?: string;
  icon?: string;
  image?: string;
  parentId?: ObjectId; // ref: Category (for hierarchy)
  isActive: boolean;
  order: number; // display order
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 6. ProductReview Model
```typescript
interface IProductReview {
  _id: ObjectId;
  productId: ObjectId; // ref: Product
  userId: ObjectId; // ref: User
  orderId: ObjectId; // ref: Order
  
  rating: number; // 1-5
  comment: string;
  images?: string[];
  
  // Status
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  
  // Helpfulness
  helpfulCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
productId, userId: compound unique
productId, isApproved: compound
```

### Transaction Models

#### 7. Order Model
```typescript
interface IOrder {
  _id: ObjectId;
  orderNumber: string; // unique, e.g., "ORD-2025-001"
  userId: ObjectId; // ref: User
  
  // Items
  items: [{
    productId: ObjectId;
    productName: string;
    quantity: number;
    price: number;
    discountPrice?: number;
    vendorId: ObjectId;
  }];
  
  // Amounts
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  
  // Shipping
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  
  // Payment
  paymentMethod: 'wallet' | 'paystack' | 'credit';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  statusHistory: [{
    status: string;
    timestamp: Date;
    note?: string;
  }];
  
  // Tracking
  trackingNumber?: string;
  estimatedDelivery?: Date;
  
  // Metadata
  notes?: string;
  cancelReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
orderNumber: unique
userId, status: compound
createdAt: descending
```

#### 8. Payment Model
```typescript
interface IPayment {
  _id: ObjectId;
  userId: ObjectId; // ref: User
  orderId?: ObjectId; // ref: Order
  
  amount: number;
  currency: string; // 'NGN'
  method: 'wallet' | 'paystack' | 'bank_transfer';
  
  // Paystack
  paystackReference?: string;
  paystackAuthorizationUrl?: string;
  
  // Status
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  
  // Metadata
  metadata?: Record<string, any>;
  failureReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 9. Wallet Model
```typescript
interface IWallet {
  _id: ObjectId;
  userId: ObjectId; // ref: User, unique
  
  balance: number; // current balance
  availableBalance: number; // balance - locked funds
  lockedBalance: number; // funds on hold
  
  currency: string; // 'NGN'
  
  // Limits
  dailyLimit: number;
  monthlyLimit: number;
  
  // Status
  isActive: boolean;
  isFrozen: boolean;
  freezeReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
userId: unique
```

#### 10. WalletTransaction Model
```typescript
interface IWalletTransaction {
  _id: ObjectId;
  walletId: ObjectId; // ref: Wallet
  userId: ObjectId; // ref: User
  
  type: 'credit' | 'debit';
  amount: number;
  
  // Categories
  category: 'deposit' | 'withdrawal' | 'order' | 'refund' | 'commission' | 'transfer' | 'gdip_investment' | 'gdip_profit';
  
  // References
  referenceId?: ObjectId; // Order, TPIA, etc.
  referenceType?: string; // 'Order', 'TPIA', etc.
  
  // Balance After Transaction
  balanceBefore: number;
  balanceAfter: number;
  
  description: string;
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  
  createdAt: Date;
}

// Indexes
walletId, createdAt: compound
userId, category: compound
```

### GDIP Models

#### 11. TPIA Model
```typescript
interface ITPIA {
  _id: ObjectId;
  tpiaId: string; // unique, e.g., "TPIA-2025-001-0001"
  userId: ObjectId; // ref: User
  
  // Investment
  investmentAmount: number; // ₦1,000,000
  currentValue: number; // increases with TPM mode
  
  // Profit Configuration
  profitMode: 'TPM' | 'EPS';
  // TPM: Total Profit Mode (compound)
  // EPS: Earned Profit System (withdraw)
  
  // Commodity
  commodityType: 'rice' | 'sugar' | 'oil' | 'wheat' | 'others';
  quantityBacked: number; // physical quantity
  
  // GDC Assignment
  gdcId?: ObjectId; // ref: GDC
  
  // Insurance
  insuranceNumber: string; // unique, 13-digit
  insuranceCoverage: number; // 100% of investment
  
  // Status
  status: 'active' | 'matured' | 'claimed' | 'suspended';
  
  // Cycle Tracking
  totalCycles: number;
  completedCycles: number;
  activeCycleId?: ObjectId; // ref: TradeCycle
  
  // Profit Tracking
  totalProfit: number;
  totalProfitWithdrawn: number; // for EPS mode
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
tpiaId: unique
userId, status: compound
gdcId: index
insuranceNumber: unique
```

#### 12. GDC Model
```typescript
interface IGDC {
  _id: ObjectId;
  gdcId: string; // unique, e.g., "GDC-2025-001"
  
  // Capacity
  capacity: number; // always 10
  currentFill: number; // 0-10
  tpias: ObjectId[]; // ref: TPIA[]
  
  // Status
  status: 'filling' | 'full' | 'active' | 'completed';
  
  // Investment
  totalInvestment: number; // sum of all TPIAs
  
  // Cycle Tracking
  totalCycles: number;
  activeCycles: number;
  completedCycles: number;
  
  // Profit Tracking
  totalProfitGenerated: number;
  totalProfitDistributed: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
gdcId: unique
status: index
```

#### 13. TradeCycle Model
```typescript
interface ITradeCycle {
  _id: ObjectId;
  cycleId: string; // unique, e.g., "CYCLE-2025-001"
  gdcId: ObjectId; // ref: GDC
  
  // Duration
  startDate: Date;
  endDate: Date; // startDate + 37 days
  duration: number; // 37 days
  
  // Status
  status: 'scheduled' | 'active' | 'processing' | 'completed' | 'failed';
  
  // Investment
  totalInvestment: number;
  
  // Profit
  targetProfitRate: number; // 5%
  actualProfitRate?: number;
  totalProfit?: number;
  
  // Distribution
  distributionDate?: Date;
  distributionStatus: 'pending' | 'distributed' | 'failed';
  
  // TPIAs in this cycle
  tpias: ObjectId[]; // ref: TPIA[]
  
  // Metadata
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
cycleId: unique
gdcId, status: compound
startDate, endDate: compound
```

#### 14. Insurance Model
```typescript
interface IInsurance {
  _id: ObjectId;
  insuranceNumber: string; // unique, 13-digit
  tpiaId: ObjectId; // ref: TPIA
  userId: ObjectId; // ref: User
  
  // Coverage
  coverageAmount: number; // 100% of investment
  commodityType: string;
  
  // Dates
  issuedDate: Date;
  expiryDate: Date; // typically 1 year
  
  // Status
  status: 'active' | 'expired' | 'claimed' | 'cancelled';
  
  // Claims
  claims: [{
    claimNumber: string;
    claimDate: Date;
    claimType: 'total_loss' | 'partial_loss';
    claimAmount: number;
    status: 'filed' | 'investigating' | 'approved' | 'rejected' | 'paid';
    evidence: string[];
    resolution?: string;
    paidDate?: Date;
  }];
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
insuranceNumber: unique
tpiaId: unique
userId, status: compound
```

#### 15. Commodity Model
```typescript
interface ICommodity {
  _id: ObjectId;
  type: string; // 'rice', 'sugar', 'oil', etc.
  name: string;
  unit: string; // 'bag', 'ton', 'liter'
  
  // Pricing
  currentPrice: number;
  previousPrice: number;
  priceChange: number; // percentage
  lastUpdated: Date;
  
  // Supply
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number; // backed by TPIAs
  
  // Storage
  warehouseLocations: [{
    location: string;
    quantity: number;
  }];
  
  // Audit
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Business Models

#### 16. Commission Model
```typescript
interface ICommission {
  _id: ObjectId;
  agentId: ObjectId; // ref: User
  customerId: ObjectId; // ref: User (referral)
  
  // Source
  sourceType: 'product_purchase' | 'order' | 'subscription';
  sourceId: ObjectId;
  
  // Amount
  orderAmount: number;
  discountAmount: number;
  commissionAmount: number; // = discountAmount
  commissionRate?: number; // percentage
  
  // Status
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  
  // Payment
  paidDate?: Date;
  paymentReference?: string;
  
  // Level (for multi-level tracking)
  level: number; // 1, 2, 3, etc.
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
agentId, status: compound
customerId: index
createdAt: descending
```

#### 17. Referral Model
```typescript
interface IReferral {
  _id: ObjectId;
  referrerId: ObjectId; // ref: User (agent)
  referredId: ObjectId; // ref: User (customer)
  
  referralCode: string;
  
  // Status
  status: 'active' | 'inactive' | 'suspended';
  isConverted: boolean; // made a purchase
  conversionDate?: Date;
  
  // Tracking
  totalOrders: number;
  totalSpent: number;
  totalCommissions: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
referrerId, referredId: compound unique
referralCode: index
```

#### 18. CreditRequest Model
```typescript
interface ICreditRequest {
  _id: ObjectId;
  requestNumber: string; // unique
  userId: ObjectId; // ref: User
  
  // Request Details
  requestedAmount: number;
  purpose: string;
  
  // Documents
  documents: [{
    type: 'cac' | 'bank_statement' | 'tax_clearance' | 'others';
    url: string;
    uploadedAt: Date;
  }];
  
  // Business Info
  businessName: string;
  businessType: string;
  yearsInBusiness: number;
  monthlyRevenue: number;
  
  // Status
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'disbursed';
  
  // Approval
  reviewedBy?: ObjectId; // ref: User (admin)
  reviewDate?: Date;
  reviewNotes?: string;
  
  // Credit Terms
  approvedAmount?: number;
  interestRate?: number;
  tenure?: number; // months
  
  // Disbursement
  disbursementDate?: Date;
  disbursementReference?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 19. Payout Model
```typescript
interface IPayout {
  _id: ObjectId;
  payoutNumber: string; // unique
  userId: ObjectId; // ref: User
  
  // Amount
  amount: number;
  currency: string; // 'NGN'
  
  // Type
  type: 'commission' | 'vendor_sales' | 'refund';
  
  // Bank Details
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Processing
  processedBy?: ObjectId; // ref: User (admin)
  processedDate?: Date;
  transactionReference?: string;
  
  // Failure
  failureReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 20. WithdrawalRequest Model
```typescript
interface IWithdrawalRequest {
  _id: ObjectId;
  userId: ObjectId; // ref: User
  
  // Amount
  amount: number;
  source: 'wallet' | 'commission';
  
  // Bank Details
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  
  // Status
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  
  // Processing
  approvedBy?: ObjectId;
  processedDate?: Date;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Vendor Models

#### 21. Seller Model
```typescript
interface ISeller {
  _id: ObjectId;
  userId: ObjectId; // ref: User, unique
  
  // Store Info
  storeName: string;
  storeSlug: string; // unique
  storeDescription: string;
  storeLogo?: string;
  storeBanner?: string;
  
  // Contact
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
  };
  
  // Business
  businessName: string;
  businessType: string;
  cacNumber?: string;
  taxId?: string;
  
  // Status
  isVerified: boolean;
  verifiedAt?: Date;
  isActive: boolean;
  
  // Metrics
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  
  // Social
  followerCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
userId: unique
storeSlug: unique
isVerified, isActive: compound
```

#### 22. SellerFollow Model
```typescript
interface ISellerFollow {
  _id: ObjectId;
  sellerId: ObjectId; // ref: Seller
  followerId: ObjectId; // ref: User
  createdAt: Date;
}

// Indexes
sellerId, followerId: compound unique
```

### Additional Models

#### 23. Voucher Model
```typescript
interface IVoucher {
  _id: ObjectId;
  code: string; // unique
  
  // Discount
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number; // for percentage type
  
  // Conditions
  minPurchase: number;
  applicableProducts?: ObjectId[];
  applicableCategories?: string[];
  
  // Usage
  totalUsageLimit: number;
  usagePerUser: number;
  currentUsage: number;
  
  // Dates
  startDate: Date;
  endDate: Date;
  
  // Status
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
code: unique
startDate, endDate: compound
```

#### 24. Notification Model
```typescript
interface INotification {
  _id: ObjectId;
  userId: ObjectId; // ref: User
  
  // Content
  title: string;
  message: string;
  type: 'order' | 'payment' | 'gdip' | 'commission' | 'system';
  
  // Link
  link?: string;
  actionText?: string;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Priority
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  createdAt: Date;
}

// Indexes
userId, isRead: compound
createdAt: descending
```

#### 25. SecurityReport Model
```typescript
interface ISecurityReport {
  _id: ObjectId;
  reportNumber: string; // unique
  reportedBy: ObjectId; // ref: User
  
  // Incident
  incidentType: 'fraud' | 'phishing' | 'unauthorized_access' | 'data_breach' | 'others';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  
  // Evidence
  evidence: string[];
  
  // Status
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  
  // Investigation
  assignedTo?: ObjectId; // ref: User (admin)
  investigationNotes?: string;
  resolution?: string;
  resolvedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 26. BusinessDocument Model
```typescript
interface IBusinessDocument {
  _id: ObjectId;
  userId: ObjectId; // ref: User
  
  // Document
  documentType: 'cac' | 'tin' | 'business_permit' | 'bank_statement' | 'others';
  documentNumber: string;
  documentUrl: string;
  
  // Status
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: ObjectId; // ref: User (admin)
  verifiedAt?: Date;
  rejectionReason?: string;
  
  // Expiry
  expiryDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### 27-30. Additional Models
```typescript
// Contact, Banner, Transaction, AuditLog, etc.
// (Following similar patterns as above)
```

---

## 🎨 Frontend Pages (67 Total)