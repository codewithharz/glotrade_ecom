# GDIP Platform - Complete System Flow Documentation

## Overview

The **GDIP (Glotrade Distribution/Trusted Insured Partners)** platform is a commodity-backed digital investment system that allows partners to purchase insured investment blocks (TPIAs) that generate predictable returns through automated 37-day trade cycles.

---

## System Architecture

### Core Components

1. **TPIA (Trade Partners Insured Alliance)** - ₦1,000,000 investment blocks
2. **GDC (Global Digital Cluster)** - Groups of 10 TPIAs trading together
3. **Trade Cycles** - 37-day commodity trading periods
4. **Insurance System** - Capital protection mechanism
5. **Profit Distribution** - TPM (compounding) or EPS (wallet) modes

### Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Node-cron for automation
- JWT authentication

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios for API calls

---

## Complete User Flow

### 1. Partner Registration & Setup

```
User Registration → KYC Verification → Wallet Creation → GDIP Access
```

**Prerequisites:**
- Verified user account
- Active wallet with sufficient balance (₦1,000,000+)
- Completed KYC (if required)

### 2. TPIA Purchase Flow

#### Step 2.1: Navigate to Purchase Page
```
Dashboard → "Purchase New TPIA" → /gdip/purchase
```

#### Step 2.2: Select Commodity
Partner chooses from active commodities fetched dynamically via `GET /commodities/types`:
- **Dynamic Icons**: Rice 🌾, Sugar 🍬, Wheat 🌾, etc.
- **Admin Managed**: Options are configurable via Admin CRUD interface.

#### Step 2.3: Choose Profit Mode

**TPM (Trade Profit Mode) - Compounding:**
- Profits automatically reinvest into TPIA
- Increases `currentValue` for next cycle
- Higher long-term returns
- Tracked in `compoundedValue` field

**EPS (Earning Payout System) - Withdrawal:**
- Profits credited to wallet
- Available for immediate withdrawal
- Creates wallet transaction
- Steady cash flow

#### Step 2.4: Confirm Purchase

**Backend Process (purchaseBulk):**
```typescript
1. Validate wallet balance (≥ ₦1,000,000 * quantity)
2. Iterate 1 to quantity:
   a. Find or create available GDC (commodity-agnostic "Mixed" cluster)
   b. Calculate formulaic TPIA number: (gdc.gdcNumber - 10) + (gdc.currentFill + 1)
   c. Create TPIA record with:
      - tpiaId: "TPIA-{number}"
      - gdcNumber: gdc.gdcNumber
      - positionInGDC: gdc.currentFill + 1
   d. Update GDC (tpiaIds, tpiaNumbers, currentFill)
   e. Create insurance record
    f. If GDC full (10/10): 
       - Mark GDC as "ready"
       - Set formedAt
       - Auto-activate all TPIAs in GDC (status: "active")
       - Auto-activate all Insurance records (status: "active")
       - Set nextCycleStartDate (+37 days)
3. After loop: Deduct total from wallet
4. Create single bulk wallet transaction with unique idempotencyKey
```

**Database Changes:**
```javascript
// New TPIA document
{
  tpiaNumber: 1,
  tpiaId: "TPIA-1",
  partnerId: "...",
  gdcId: "...",
  gdcNumber: 10,
  positionInGDC: 1,
  purchasePrice: 1000000,
  currentValue: 1000000,
  profitMode: "TPM",
  status: "pending",
  insuranceCertificateNumber: "TPIA-1-8472619305847"
}

// Updated GDC
{
  gdcNumber: 10,
  currentFill: 1,
  isFull: false,
  tpiaIds: ["..."],
  totalCapital: 1000000
}

// New Insurance
{
  certificateNumber: "TPIA-1-8472619305847",
  tpiaId: "...",
  coverageAmount: 1000000,
  status: "pending"
}

// New Bulk Wallet Transaction
{
  type: "payment",
  amount: 2000000,
  description: "Bulk purchase of 2 TPIA blocks",
  metadata: {
    quantity: 2,
    tpiaIds: ["...", "..."],
    idempotencyKey: "BULK-TPIA-..."
  }
}
```

### 3. GDC Formation & Activation

#### Mixed Commodity Handling
During formation, GDCs are assigned `primaryCommodity: "Mixed"`. This allows partners to purchase using any commodity type (Rice, Sugar, etc.) whilst still filling the same physical cluster sequentially.

#### When GDC Reaches 10 TPIAs:

```typescript
// Automatic process in GDIPService.purchaseBulk
if (gdc.currentFill === 10) {
  gdc.isFull = true;
  gdc.status = "ready";
  gdc.formedAt = new Date();
  gdc.nextCycleStartDate = new Date(Date.now() + 37 * 24 * 60 * 60 * 1000);
  
  // Update all TPIAs and Insurance in GDC
  await TPIA.updateMany(
    { gdcId: gdc._id },
    { status: "active", activatedAt: new Date(), insuranceStatus: "active" }
  );
  
  await Insurance.updateMany(
    { tpiaId: { $in: gdc.tpiaIds } },
    { status: "active" }
  );
}
```

---

## Automated Trade Cycle System

### Cron Job Schedule

**Daily at 2:00 AM** - Start Scheduled Cycles
```typescript
// Check for cycles with startDate ≤ now
const scheduledCycles = await TradeCycle.find({
  status: "scheduled",
  startDate: { $lte: new Date() }
});

for (cycle of scheduledCycles) {
  cycle.status = "active";
  cycle.save();
}
```

**Daily at 3:00 AM** - Complete Active Cycles
```typescript
// Check for cycles with endDate ≤ now
const activeCycles = await TradeCycle.find({
  status: "active",
  endDate: { $lte: new Date() }
});

for (cycle of activeCycles) {
  // Auto-complete with target profit (5%)
  const targetProfit = cycle.totalCapital * 0.05;
  const salePrice = cycle.purchasePrice + targetProfit;
  
  await TradeCycleService.completeCycle(cycle._id, salePrice, 0);
  await TradeCycleService.distributeProfits(cycle._id);
}
```

**Daily at 4:00 AM** - Schedule New Cycles
```typescript
// Find GDCs ready for new cycle
const readyGDCs = await GDC.find({
  status: "ready",
  isFull: true,
  currentCycleId: { $exists: false }
});

for (gdc of readyGDCs) {
  await TradeCycleService.createTradeCycle(
    gdc._id,
    gdc.primaryCommodity,
    100, // quantity
    gdc.totalCapital * 0.95, // purchase price
    new Date(Date.now() + 24 * 60 * 60 * 1000) // start tomorrow
  );
}
```

### 4. Trade Cycle Execution

#### Cycle Creation (Admin or Auto)

**Concept: Why Create a Cycle?**
When partners purchase TPIA blocks, their capital pools into a "GDC Cluster" and sits as *idle cash*. The profit generation process does not begin until the Admin explicitly "Create a Cycle". This action:
1.  **Activates Capital**: Moves funds from "Idle GDC" to "Active Trade".
2.  **Starts the Clock**: Begins the 37-day countdown for ROI calculation.
3.  **Defines the Trade**: Sets the commodity (e.g., Rice, Sugar) to be traded.

**Admin Form Update:**
The Admin interface now features:
- **GDC Selector**: Dropdown to select a valid GDC (instead of manual ID entry).
- **Commodity Input**: Free-text field to specify any commodity (e.g., "Premium Parboiled Rice").

```typescript
// POST /api/gdip/admin/cycle/create
{
  gdcId: "GDC-10-ID", // Selected from dropdown
  commodityType: "Premium Rice", // Typed manually
  commodityQuantity: 250,
  purchasePrice: 9500000,
  startDate: "2025-12-26T00:00:00Z"
}

// Creates TradeCycle document
{
  cycleNumber: 1,
  cycleId: "CYCLE-1",
  gdcId: "...",
  tpiaIds: [...10 TPIAs],
  startDate: "2025-12-26",
  endDate: "2026-02-01", // +37 days
  duration: 37,
  status: "scheduled",
  totalCapital: 10000000,
  targetProfitRate: 5,
  commodityType: "Premium Rice"
}
```

#### Cycle Completion

```typescript
// POST /api/gdip/admin/cycle/:id/complete
{
  salePrice: 10500000, // Revenue from commodity sale
  tradingCosts: 50000  // Storage, transport, etc.
}

// Calculates profit
totalRevenue = 10500000
totalCosts = 9500000 + 50000 = 9550000
totalProfit = 10500000 - 9550000 = 950000
actualProfitRate = (950000 / 10000000) * 100 = 9.5%

// Updates cycle
{
  status: "processing",
  salePrice: 10500000,
  tradingCosts: 50000,
  totalProfitGenerated: 950000,
  actualProfitRate: 9.5,
  roi: 9.5
}
```

#### Profit Distribution

```typescript
// POST /api/gdip/admin/cycle/:id/distribute

profitPerTPIA = 950000 / 10 = 95000

for each TPIA:
  if (tpia.profitMode === "TPM"):
    // Compounding mode
    tpia.compoundedValue += 95000
    tpia.currentValue += 95000
    tpia.totalProfitEarned += 95000
    
  else if (tpia.profitMode === "EPS"):
    // Withdrawal mode
    wallet.balance += 95000
    wallet.totalEarned += 95000
    
    // Create transaction
    WalletTransaction.create({
      type: "earning",
      amount: 95000,
      description: "Profit from TPIA-X - Cycle 1 (9.5% ROI)"
    })
    
    tpia.totalProfitEarned += 95000

  // Update TPIA stats
  tpia.cyclesCompleted += 1
  tpia.lastCycleProfit = 95000
  tpia.currentCycleId = null

// Update GDC
gdc.cyclesCompleted += 1
gdc.totalProfitGenerated += 950000
gdc.currentCycleId = null
gdc.status = "ready" // Ready for next cycle
```

---

## Dashboard & Monitoring

### Partner Dashboard (`/gdip`)

**Portfolio Summary:**
```typescript
{
  totalTPIAs: 5,
  totalInvested: 5000000,
  currentValue: 5475000,
  totalProfitEarned: 475000,
  activeCycles: 2,
  tpiasByStatus: {
    active: 5,
    pending: 0
  },
  tpiasByMode: {
    TPM: 3,
    EPS: 2
  },
  gdcs: 1
}
```

**TPIA Grid Display:**
- Status badges (active/pending/matured)
- GDC assignment
- Current value vs invested
- Profit earned
- Profit mode indicator
- Cycles completed

### TPIA Details Page (`/gdip/tpia/[id]`)

**Displays:**
- Financial overview (purchase price, current value, profit, ROI)
- GDC assignment details
- Current trade cycle status
- Commodity backing information
- Insurance certificate details
- Profit mode switcher
- Statistics (cycles completed, dates)

### All TPIAs Page (`/gdip/tpias`)

**Features:**
- Search by TPIA ID, commodity, certificate
- Filter by status (pending/active/matured/suspended)
- Filter by profit mode (TPM/EPS)
- Grid view with detailed cards
- Click to view details

---

## Admin Panel Operations

### Cycle Management

**Create Cycle:**
```bash
POST /api/gdip/admin/cycle/create
{
  "gdcId": "GDC-10",
  "commodityType": "Rice",
  "commodityQuantity": 100,
  "purchasePrice": 9500000
}
```

**Complete Cycle:**
```bash
POST /api/gdip/admin/cycle/:id/complete
{
  "salePrice": 10500000,
  "tradingCosts": 50000
}
```

**Distribute Profits:**
```bash
POST /api/gdip/admin/cycle/:id/distribute
```

### Monitoring

**View All GDCs:**
```bash
GET /api/gdip/admin/gdcs
```

**View All TPIAs:**
```bash
GET /api/gdip/admin/tpias?status=active
```

**View All Cycles:**
```bash
GET /api/gdip/admin/cycles?status=active
```

---

## Data Flow Diagrams

### Purchase Flow
```
Partner → Select Commodity → Choose Profit Mode → Confirm
    ↓
Validate Wallet Balance
    ↓
Create TPIA (with insurance certificate)
    ↓
Assign to GDC
    ↓
Deduct from Wallet
    ↓
If GDC Full → Auto-Activate TPIAs & Insurance → Schedule First Cycle
    ↓
Return to Dashboard
```

### Cycle Flow
```
GDC Ready → Admin/Cron Creates Cycle
    ↓
Cycle Scheduled (37 days)
    ↓
Cron Starts Cycle (status: active)
    ↓
37 Days Pass
    ↓
Cron Completes Cycle (calculate profit)
    ↓
Distribute Profits:
  - TPM → Add to TPIA value
  - EPS → Credit to wallet
    ↓
Update Stats
    ↓
GDC Ready for Next Cycle
```

### Profit Distribution Flow
```
Cycle Completed → Calculate Total Profit
    ↓
Profit Per TPIA = Total / 10
    ↓
For Each TPIA:
  Check Profit Mode
    ↓
  TPM → Compound into TPIA
  EPS → Credit to Wallet
    ↓
Update TPIA Stats
    ↓
Update GDC Stats
    ↓
Mark Cycle as Distributed
```

---

## Database Schema Relationships

```
User (Partner)
  ↓ has many
TPIA
  ↓ belongs to
GDC
  ↓ has many
TradeCycle
  ↓ references
TPIA (for profit distribution)

TPIA
  ↓ has one
Insurance

TPIA
  ↓ may have
Commodity (allocation)
```

---

## Key Business Rules

1. **TPIA Price:** Fixed at ₦1,000,000
2. **GDC Capacity:** Always 10 TPIAs
3. **Cycle Duration:** 37 days
4. **Target Profit:** 5% per cycle
5. **Profit Modes:** TPM (compound) or EPS (withdraw)
6. **Insurance:** Automatic with 13-digit certificate
7. **Auto-Execution:** Cron jobs handle cycle lifecycle
8. **Capital Protection:** 100% insurance-backed

---

## Security & Compliance

### Authentication
- All endpoints require JWT token
- Admin endpoints require admin role

### Authorization
- Partners can only access their own TPIAs
- Admins can access all data

### Data Validation
- Commodity type must be valid
- Profit mode must be TPM or EPS
- Purchase price must match TPIA price
- Wallet balance must be sufficient

### Audit Trail
- All transactions logged
- Cycle execution logged
- Profit distribution tracked

---

## Performance Considerations

### Database Indexes
```javascript
// TPIAs
{ tpiaNumber: 1 } // unique
{ partnerId: 1, status: 1 }
{ gdcId: 1, positionInGDC: 1 }

// GDCs
{ gdcNumber: 1 } // unique
{ status: 1, isFull: 1 }

// TradeCycles
{ gdcId: 1, cycleNumber: 1 }
{ status: 1, endDate: 1 }
```

### Caching Strategy
- Portfolio summaries: 5 min TTL
- GDC status: 10 min TTL
- Cycle history: 1 hour TTL

---

## Error Handling

### Common Errors

**Insufficient Balance:**
```json
{
  "error": "Insufficient wallet balance"
}
```

**GDC Full:**
```json
{
  "error": "GDC must be full before starting a trade cycle"
}
```

**Invalid Commodity:**
```json
{
  "error": "Invalid commodity type"
}
```

---

## Future Enhancements

1. **PDF Generation** - Insurance certificates, purchase agreements
2. **Email Notifications** - Cycle completion, profit distribution
3. **Advanced Analytics** - Performance charts, ROI tracking
4. **Mobile App** - iOS/Android support
5. **Multi-Currency** - Support for USD, EUR
6. **Commodity Marketplace** - Real-time commodity prices
7. **Partner Referrals** - Earn bonuses for referrals

---

## Support & Maintenance

### Monitoring
- Active TPIAs count
- GDC fill rates
- Cycle completion success
- Profit distribution accuracy
- Cron job execution

### Logs
```bash
# Cron job logs
grep "GDIP Cron" logs/app.log

# Error logs
grep "Error" logs/error.log | grep "GDIP"
```

### Health Check
```bash
GET /api/gdip/health
{
  "status": "healthy",
  "tpias": 150,
  "gdcs": 15,
  "activeCycles": 5
}
```

---

**GloTrade — A Multi-Role Commerce & Distribution Infrastructure**

**Last Updated:** December 25, 2025
**Version:** 1.0.0
**Platform:** Glotrade GDIP
