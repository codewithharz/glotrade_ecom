
# **1. GDIP = Glotrade Distribution Insured Partners**

GDIP is essentially:

### ➜ A structured, insured, asset-backed _commodity trading ecosystem_

### ➜ Where each partner acquires independent “trade blocks”

### ➜ And each block represents a **real physical store / depot / inventory position**

---

# **2. GDC = Glotrade Distribution Cluster**

A **GDC** is simply a _group of 10 TPIA (Trade Partners Insured Alliance) stores_.

Example:

### **GDC-10**

- TPIA-1
- TPIA-2
- …
- TPIA-10

When these 10 stores are fully subscribed, then:

### **GDC-20** is opened:

- TPIA-11
- TPIA-12
- …
- TPIA-20

Then:

### **GDC-30**

- TPIA-21 to TPIA-30
  …and so on.

It’s progressive, capacity-based opening.

---

# **3. TPIA = Trade Partners Insured Alliance**

This is the **actual unit/block/store** a partner purchases.

Each TPIA block has:

- A **unique number** (TPIA-1, TPIA-2 … TPIA-100000+)
- A **real, physical backing** (goods placed in warehouses)
- A **fixed insured value** (e.g., ₦1,000,000 per block)
- A **13-month revolving trade cycle** optional
- A **profit-sharing model** distributed via (compounding) into users wallets
- A **fixed markup** depending on commodity rotation (coming soon)
- A **time-based maturity** (coming soon)
- A **minimum annual trade calendar** (coming soon)
- Expected **5% average annual trade proceed** (coming soon)
- Monthly (37 days) profit cycles (5% trade cycles)
- **Bulk Purchase**: Partners can buy multiple TPIAs (1-10) in a single transaction
- Records tied to the partner (name/company)

This means:

### ✔ A TPIA is essentially a **digitized ownership of a warehouse-backed commodity position**

### ✔ A user dashboard = digital twin of a real store/depot slot

### ✔ The system must reflect real-life trade cycles & inventory

---

Partners can purchase:
- **Individual Blocks**: 1, 2, 5, etc.
- **Fill Current GDC**: Automatically purchase remaining slots in the active cluster.
- **Full GDC**: Purchase exactly 10 blocks to own a complete cluster.

Limits:
- Minimum: 1 TPIA
- Maximum per transaction: 10 TPIAs (1 Full GDC)
- But a partner can own blocks across multiple GDCs:

- TPIA-2 (GDC-10)
- TPIA-7 (GDC-10)
- TPIA-13 (GDC-20)
- TPIA-29 (GDC-30)

…and so on.

---

# **5. Each TPIA = A Fully Independent Trade Asset**

Each block has its own:

- Insurance certificate
- Goods placement contract
- Trade cycle
- Profit record
- Revolving logs
- Appropriation model (compounding)
- Time counter
- Maturity date
- Proceeds distribution history
- Transaction history
- Commodity type behind it (Dynamically managed by Admin)

### **TPIA = Digital mirror of a real commodity store**

---

Inside our unified system:

```
Trade Partners Alliance = GDIP Engine
TPIA = User Blocks
GDC = Batches of 10
```



# **CORE FOUNDATIONS**

---

# **1. EXECUTIVE SUMMARY**

The **Global Digital Investment Product (GDIP)** is a structured, commodity-backed digital investment system built to ensure:

- **Capital Protection**
- **Predictable Yields**
- **Commodity-backed Assurance**
- **Insurance-supported Risk Management**
- **Automated Monthly Trade Cycles**
- **User-Friendly Portfolio Monitoring**

GDIP is not a trading platform.
It is a **digital commodity allocation engine** that organizes users’ capital (TPIAs) into structured pools (GDCs) that go through monthly profit-generating cycles.

### Core Components

- **TPIA** — _Tokenized Position Investment Asset_
- **GDC** — _Global Digital Cluster (container for multiple TPIAs)_
- **TPM** — _Trade Profit Mode (compounding)_
- **EPS** — _Earning Payout System (monthly withdrawals)_
- **Lifecycle Engine** — controls month-to-month trade profit cycles
- **Insurance Model** — protects capital from real-world loss
- **Warehouse & Commodity Engine** — ensures physical asset backing and manages dynamic commodity types

### What GDIP Guarantees

- 100% _capital preservation_ (insurance-backed)
- Predictable monthly performance
- Commodity-based yield generation (hedged)
- Automated account synchronization and dashboards

This volume (Volume 1) explains the foundations needed to build and understand the entire platform.

---

# **2. TERMINOLOGIES & DEFINITIONS**

| Term                      | Meaning                                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **TPIA**                  | Tokenized Position Investment Asset: purchased by the user; represents capital allocated into commodity-backed cycles |
| **GDC**                   | Global Digital Cluster: container of 10 or 20 TPIAs that go through a trade cycle as a group                          |
| **GDC-10**                | Cluster containing 10 TPIAs (standard group)                                                                          |
| **GDC-20**                | Cluster containing 20 TPIAs (VIP / overflow cluster)                                                                  |
| **Cycle**                 | Monthly commodity trade that generates profit                                                                         |
| **TPM**                   | Trade Profit Mode: reinvests monthly profit to compound                                                               |
| **EPS**                   | Earning Payout System: monthly cash-out mode                                                                          |
| **Trade Engine**          | Runs commodity allocations + yield calculations                                                                       |
| **Insurance Pool**        | Covers capital loss due to commodity damage, market failure, warehouse issues                                         |
| **Markup Engine**         | Updates TPIA price as commodities change in market                                                                    |
| **Commodity NAV**         | Net Asset Value of unit commodity used to price TPIAs                                                                 |
| **Warehouse Certificate** | Physical backing proof for commodities                                                                                |
| **Commodity Type**        | A specific commodity (Rice, Sugar, etc.) with associated icon, managed by Admin via CRUD interface                   |
| **Auto-Balancer**         | Redistributes TPIAs when GDCs overflow                                                                                |

---

# **3. SYSTEM ARCHITECTURE (MICROSERVICES + DIAGRAMS)**

GDIP uses **service-based architecture** with isolated modules communicating via a central event bus.

---

## **3.1 High-Level Microservices Overview**

| Service                | Responsibility                             |
| ---------------------- | ------------------------------------------ |
| **Auth Service**       | Login, JWT tokens, KYC                     |
| **User Service**       | Profile, settings, mode switching          |
| **Wallet Service**     | Deposits, withdrawals, EPS payouts         |
| **TPIA Service**       | Creation, assignment, lifecycle tracking   |
| **GDC Engine**         | Group management, capacity, overflow       |
| **Trade Cycle Engine** | Executes monthly trades; calculates profit |
| **Insurance Service**  | Coverage, claims, warehouse incidents      |
| **Commodity Engine**   | Market price sync, NAV, markup rules       |
| **Admin Console**      | Back-office operations, audits             |
| **Audit Log Service**  | Every action tracked in immutable logs     |

---

## **3.2 Microservice Interaction Diagram**

```
          [ User Interface ]
                |
         ┌──────┴────────┐
         |   API Gateway  |
         └──────┬────────┘
                |
        ┌───────┴─────────────────────────────────────────┐
        |                       EVENT BUS                  |
        └───────┬─────────────────────────────────────────┘
                |
    ┌───────────┼─────────────────────────────────────────┐
    |           |            |            |                |
[User]     [Wallet]     [TPIA]      [GDC Engine]     [Trade Engine]
                 |             |            |               |
                 |         [Commodity Engine]             |
                 |                  |                    |
                 |             [Insurance]              |
                 |                  |                    |
                 └────────────→ [Admin Console] ←────────┘
```

---

## **3.3 Process Flow — Buying a TPIA**

```
User → Pay → Wallet Validates → TPIA Service Creates →
GDC Engine Assigns → Trade Engine Registers → Dashboard Updates
```

---

# **4. GDIP LOGIC FRAMEWORK**

GDIP logic operates on **four layers**:

---

## **4.1 LAYER 1 — USER CAPITAL LAYER**

- User purchases TPIAs
- Funds stored in wallet
- Capital converted to commodity-backed units

---

## **4.2 LAYER 2 — GROUP FORMATION LAYER (GDC Engine)**

- GDC-10 filled first
- Overflow triggers new GDC-10 or GDC-20
- Fully-filled GDC enters “Ready for Cycle”

---

## **4.3 LAYER 3 — TRADE CYCLE LAYER**

System evaluates:

1. Commodity price
2. Insurance availability
3. Market conditions
4. Warehouse inventory

Once validated:

- Trades executed
- Profit generated
- Profit sent to TPM or EPS

---

## **4.4 LAYER 4 — PROFIT MANAGEMENT LAYER**

### TPM Flow:

```
Profit → Added to TPIA → Increases next cycle base
```

### EPS Flow:

```
Profit → Sent to Wallet → Withdraw anytime
```

---

# **5. TPIA & GDC STRUCTURAL RULES**

---

## **5.1 TPIA Structure**                       |

---

## **5.2 GDC Structure**

---

- **Strict Sequential Filling**: GDC-10 fills completely before GDC-20 is opened.
- **Commodity Agnostic**: Forming GDCs are marked as "Mixed" allowing partners to purchase using any commodity preference; specialized trade cycles are assigned by Admin later.
- **Formulaic Numbering**: TPIA numbering is tied to GDC batches: `TPIA Number = (GDC Number - 10) + Slot Position`.
- A full GDC automatically enters "Ready" status and schedules its first cycle (+37 days).

### Flow Diagram

```
New TPIAs → Are there open GDC slots?
           ↓ Yes
         Assign
           ↓
          Full?
           ↓ No → Wait
           ↓ Yes → Enter Cycle Queue
```

---

# **6. CAPITAL ALLOCATION LOGIC**

When user buys a TPIA:

### Fund Flow

```
User → Wallet → TPIA Base Account → Commodity Allocation → GDC Assignment
```

---

## **6.1 Allocation Splits**

| Component          | Percentage |
| ------------------ | ---------- |
| Commodity Purchase | 100%       |

---

## **6.2 NAV (Net Asset Value) Calculation**

```
NAV = (Total Commodity Value + Buffer – Liabilities) ÷ Total TPIAs
```

This determines future TPIA pricing.

---

so we need to brainstorm a full system architecture specifically for GDIP

