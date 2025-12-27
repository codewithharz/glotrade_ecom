# Intensive Feature Reference — Technical Deep-Dive

This document provides intensive technical details about the core features of the Glotrade International Platform, including the underlying algorithms, constraints, and logic flows.

---

## 🌾 1. GDIP (Investment Engine)

The GDIP system is a sophisticated commodity-backed investment engine that pools capital into clusters (GDCs).

### GDC Formation Logic
- **Sequential Filling**: GDCs are filled strictly one after another. The systems looks for the oldest non-full GDC (`status: forming`, `isFull: false`) and assigns new TPIAs to it.
- **Cluster Capacity**: Every GDC has a fixed capacity of **10 TPIAs**.
- **Transformation**: Once a GDC reaches 10/10 capacity, its status changes to `ready`, it is marked as `isFull: true`, and the first trade cycle is automatically scheduled.

### TPIA Formulaic Numbering
TPIA IDs follow a strict mathematical formula to ensure unique and sequential numbering across the platform:
```text
TPIA Number = (GDC Number - 10) + (Slot Position)
```
*Example:*
- For GDC-10: Slot 1 is TPIA-1, Slot 10 is TPIA-10.
- For GDC-20: Slot 1 is TPIA-11, Slot 10 is TPIA-20.

### Trade Cycle Lifecycle (37 Days)
Each trade cycle follows a precise 37-day timeline:
1. **Scheduled**: Cycle is created with a future `startDate`.
2. **Active**: A cron job starts the cycle (usually at 2:00 AM).
3. **Processing**: After 37 days, the cycle is ready for profit calculation.
4. **Completed**: Profit is distributed and the GDC returns to `ready` status for the next cycle.

### ROI Models
- **Profit Target**: 5% per cycle is the standard target.
- **Accrued Profit Calculation**: A linear model is used to estimate daily growth:
  ```text
  Accrued = (Target Profit) * (Time Elapsed / Total Duration)
  ```

---

## 💰 2. Wallet & Financial Core

The digital wallet is the foundation of the platform's multi-role commerce.

### Balance Management
The wallet tracks three distinct values for every user:
- **Available Balance**: Funds that can be spent or withdrawn immediately.
- **Frozen Balance**: Funds held for pending orders or active trade cycles.
- **Credit Limit & Used**: For corporate roles (Wholesalers/Distributors), the platform supports a credit system where users can spend up to a set limit.

### Payment Flow (Paystack/Flutterwave)
- **Security**: Uses webhook verification with cryptographic signature checks (`x-paystack-signature`).
- **Idempotency**: All funding transactions use a unique reference to prevent double-crediting.

---

## 👥 3. MLM & Sales Agent System

The MLM system leverages a performance-based tiered structure for commissions.

### Commission Calculation (Discount-Based)
Unlike flat-rate systems, Glotrade uses a **Sales-Driven Commission Model**:
```text
Commission = Sum of (Item Price * Quantity * Discount %)
```
*Meaning*: An agent's earning is directly tied to the discount level of the products their referrals buy. If a referral buys a non-discounted product, the commission is ₦0.

### Cumulative Approval Threshold
Commissions are EARNED immediately but remain **Pending** to protect the platform.
- **Threshold**: **₦100,000**.
- **Auto-Approval**: Once an agent's cumulative pending commissions hit ₦100,000, all linked commissions are auto-approved and become available for payout requests.

### Agent Performance Tiers
Agents progress through tiers based on their **Total Referrals**:
| Tier | Referrals Required |
| :--- | :--- |
| **Bronze** | 0 - 50 |
| **Silver** | 51 - 100 |
| **Gold** | 101+ |

---

## 🛡️ 4. Role-Based Access Control (RBAC)

The platform supports a complex multi-role architecture mapping business types to system capabilities:

| Role/Type | Key Capabilities | Technical Permission |
| :--- | :--- | :--- |
| **Guest** | Browse marketplace. | Read-only access. |
| **Customer** | Complete commerce & wallet. | Buyer role. |
| **Sales Agent** | MLM commissions & referrals. | Agent Portal access. |
| **Wholesaler** | Bulk pricing & GDIP access. | Business Portal + Credit. |
| **Distributor** | Vendor tools & GDIP access. | Business Portal + Rewards. |
| **Admin** | Full platform oversight. | System-wide CRUD access. |

---

## 📈 5. Advanced Business Rules

### Distributor Reward System
- **Eligibility**: Any user with `businessType: "Distributor"`.
- **Interval**: **Every 90 Days** (3 Months).
- **Calculation**: **2%** of the **Total Wallet Balance** (Available + Frozen).
- **Process**: Automated via `DistributorService` when `nextRewardDate <= now`.

### Multi-Level Tracking (MLM)
- **Conceptual Structure**: The platform is designed for hierarchical tracking (Level 1, Level 2, etc.).
- **Current Implementation**: Direct commission calculation based on the immediate referring agent's code.

---

## 📊 6. Platform Scale & Architecture

The GDIP/Glotrade ecosystem is a high-density enterprise solution:
- **325+ API Endpoints** across 31 route files.
- **68 Frontend Pages** built on Next.js 14 (App Router).
- **31 Database Models** (MongoDB) for robust state management.
- **40+ Core Services** handling complex business logic.

---

**GloTrade — A Multi-Role Commerce & Distribution Infrastructure**
Developer: NEXGEN TECH INNOVATIONS LIMITED
Contact: codewithharz@gmail.com | +2348107060160
