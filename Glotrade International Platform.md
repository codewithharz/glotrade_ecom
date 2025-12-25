# GloTrade International Platform
### Enterprise B2B Commerce & Digital Trade Infrastructure
**Version:** 2.1  
**Last Updated:** December 2025 (Latest: Auto-Activation, Progress Sync, QR Certificates)  
**Developed & Implemented by:** NexGen Tech Innovations Ltd / NEXGEN TECH INNOVATIONS LIMITED  
**Product Owner / Intellectual Property:** Client Organization (Confidential)  
**Deployment Status:** Production-Ready  

---
## 1. Executive Summary
GloTrade International Platform is a **custom-built, enterprise-grade B2B commerce and digital trade infrastructure** designed for large-scale wholesale distribution, complex multi-role operations, wallet-based financial flows, referral-driven growth, controlled trade credit, and insured commodity-backed investment cycles.

The platform supports a **single central seller** model while enabling multiple economic actors — guest buyers, sales agents, wholesalers, distributors, trusted/insured trade partners (GDIP), and administrators — to operate securely within a unified, auditable system.

GloTrade replaces traditional e-commerce or CMS-based solutions with a **modern, scalable digital trading infrastructure** that combines:
- Wholesale bulk purchasing and pricing tiers
- Internal wallet and credit-based payments
- Referral and commission incentives
- Automated insured trade cycles (GDIP)
- Full administrative governance and risk control

It is not a consumer retail shop or multi-vendor marketplace — it is a **controlled commerce and capital-flow platform** built for real-world B2B trade, partner incentives, and automated financial processes.

---
## 2. Business Objectives & Evolution
### Objectives
- Centralize wholesale distribution under a single seller
- Enable bulk purchasing with flexible pricing and credit options
- Reduce transaction friction via internal wallets
- Drive organic growth through referral commissions
- Support insured commodity trade participation (GDIP)
- Digitize approval-based operations (credit, withdrawals, trade cycles)
- Ensure transparency, auditability, and long-term scalability

### Platform Evolution
- **v1.0:** Multi-role commerce with referral system and early GDIP concepts
- **v2.0 (Strategic Pivot):** Enterprise single-seller B2B model
  - Removed multi-vendor competition
  - Introduced centralized inventory/pricing control
  - Added wholesale-specific pricing tiers and trade credit system
  - Enhanced wallet governance and admin risk controls
  - Retained and refined referral and GDIP modules for aligned growth and investment

This evolution transformed the platform into a true **enterprise distribution and trade finance system**.

---
## 3. Supported User Roles & Permissions
| Role                          | Key Capabilities                                                                 | Access Level                  |
|-------------------------------|----------------------------------------------------------------------------------|-------------------------------|
| Guest Buyers                  | Browse and purchase products (discounted pricing)                                | Limited                       |
| Sales Agents                  | Unique referral links, downline tracking, commission earnings                    | Restricted + Referral tools   |
| Wholesalers / Distributors    | Bulk orders, wallet management, credit requests, transaction history             | Business operations           |
| Trusted / Insured Partners (GDIP) | Participate in insured trade cycles (TPIA/GDC blocks)                          | Investment + Trade modules    |
| Platform Administrators       | Full control: products, inventory, orders, wallets, credit, commissions, GDIP, analytics | Full system authority         |

All roles operate under strict role-based access control (RBAC) with isolated dashboards and workflows.

---
## 4. Core Features & Capabilities
### 4.1 Product & Inventory Management
- Admin-controlled catalog with multi-level categories
- Real-time inventory tracking
- Bulk/wholesale pricing tiers (automatic quantity-based discounts)
- Cloud-hosted product media

### 4.2 Order & Checkout Management
- Cart → Checkout → Payment → Processing → Shipping → Delivery lifecycle
- Support for Purchase Order (PO) references
- Automated invoice generation
- Dual checkout options:
  - **External:** Paystack / Flutterwave
  - **Internal:** Wallet balance (with optional credit usage)

### 4.3 Wallet System
- Personal internal wallet with full ledger (credits, debits, earnings)
- Top-ups via external gateways
- Wallet-first payment priority during checkout
- Withdrawal requests with admin approval and configurable thresholds
- Admin adjustments with immutable audit logs

### 4.4 Credit Request & Trade Credit System
- Verified partners can request revolving credit limits
- Admin review and approval workflow
- Automatic credit usage after wallet balance is exhausted
- Top-ups automatically repay credit before adding to wallet
- Full monitoring and risk exposure dashboards for admins

### 4.5 Sales Agent & Referral System
- Unique referral links and downline tracking
- Sustainable commission model based on **product discount margins** (no external budget required)
- Automatic commission calculation and wallet crediting
- Withdrawal eligibility based on thresholds

### 4.6 GDIP – GloTrade Digital Investment Protocol
- Module for trusted/insured trade partners
- Key units:
  - **TPIA:** ₦1,000,000 trade blocks
  - **GDC:** Clusters of 10 TPIAs
- **Automated Lifecycle**: 
  - **Auto-Activation**: Instant transition to "Active" status for TPIAs and Insurance once a cluster fills.
  - **Visual Progress Sync**: Real-time progress bars and daily profit estimations for active cycles.
  - **QR-Verified Certificates**: Professional printable insurance certificates with secure public verification.
- **Profit Modes**: Support for TPM (Compounding) and EPS (Withdrawal) modes.
- **Full Automation**: Pooling, scheduling, profit calculation, distribution, and reset handled by background system.

---
## 5. Automation & Background Processes
Node-Cron scheduled jobs handle:
- GDIP trade cycle activation/completion
- Profit calculation and distribution
- Commission settlements
- System state transitions
- Notification triggers

All processes are deterministic, logged, and admin-overridable where required.

---
## 6. Technology Stack
### Backend
- Node.js + Express.js (TypeScript)
- MongoDB + Mongoose
- JWT authentication & RBAC
- Modular service-layer architecture
- Ledger-based accounting

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios for API communication

### Infrastructure & Integrations
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Payments: Paystack + Flutterwave
- Storage: Cloudflare R2
- Notifications: Server-Sent Events
- DNS: Namecheap → Vercel

---
## 7. Admin Panel & Governance
Administrators have comprehensive control and visibility over:
- Product catalog and pricing
- Inventory and order fulfillment
- User verification and role management
- Wallet balances, transactions, and withdrawals
- Credit requests and exposure monitoring
- Sales agent commissions and downlines
- GDIP clusters, cycles, and profit distribution
- Platform analytics, reports, and logs

All sensitive actions require approval and are fully audited.

---
## 8. Security, Compliance & Auditability
- JWT-secured endpoints with role-based authorization
- Secure password hashing and input validation
- Idempotent and immutable transaction handling
- Complete audit trails for:
  - Financial transactions
  - Wallet ledger entries
  - Credit and withdrawal approvals
  - GDIP cycle executions
  - Admin actions

Designed to meet enterprise financial and compliance standards.

---
## 9. Performance & Scalability
- Optimized and indexed database queries
- Cached summaries (portfolios, analytics)
- Modular services ready for horizontal scaling
- Container-ready deployment

Built to handle growth in users, transactions, orders, and trade cycles.

---
## 10. Reporting & Analytics
### Business Users
- Order/invoice history
- Wallet and credit statements
- Transaction summaries

### Administrators
- Revenue and sales analytics
- Credit utilization and risk reports
- Withdrawal and payout tracking
- User/activity reports
- GDIP performance summaries

---
## 11. Future Enhancements (Planned)
- **Public Document Verification Portal** (Implemented)
- **PDF generation** (Statements, Invoices)
- Enhanced email/SMS notification system
- Advanced real-time analytics dashboards
- Native mobile applications
- Multi-currency support
- Real-time commodity pricing feeds

---
## 12. Intellectual Property & Attribution
The **business concept, market model, operational vision, and product strategy** are the exclusive intellectual property of the client organization.

**NexGen Tech Innovations Ltd / NEXGEN TECH INNOVATIONS LIMITED** was responsible for:
- Technical architecture and system design
- Full-stack development (backend, frontend, financial logic)
- Automation, security, and access control implementation
- Production deployment and infrastructure setup

This documentation describes the **technical and business implementation** of the platform as delivered.

---
## 13. Support & Maintenance
The platform includes built-in monitoring for:
- System health and performance
- Transaction integrity
- Automation execution
- Error and activity logging

Ongoing maintenance ensures security updates, performance optimization, and operational continuity.

---
**Documentation Version:** Consolidated (v1.0 + v2.0)  
**Status:** Production-Ready  

This merged README preserves all vital details from both original documents while eliminating redundancy, clarifying the platform's evolution from v1.0 to v2.0, and presenting a unified, comprehensive overview of the current system.