# GDIP Platform Access Guide

## 🚀 Quick Start - Accessing GDIP

### Frontend is Running!
✅ **URL:** http://localhost:3000  
✅ **Status:** Ready

---

## 📍 GDIP Platform URLs

### Partner Pages (7 pages)

#### 1. **GDIP Dashboard** - Main Overview
```
http://localhost:3000/gdip
```
**Features:**
- Portfolio summary (Total TPIAs, Invested, Profit, Value)
- Quick action buttons
- TPIA grid display

#### 2. **Purchase TPIA** - Buy Investment Block
```
http://localhost:3000/gdip/purchase
```
**Features:**
- Select commodity (Rice, Sugar, Wheat, Corn, Soybeans)
- Choose profit mode (TPM/EPS)
- Investment summary (₦1,000,000)

#### 3. **All TPIAs** - Investment Listing
```
http://localhost:3000/gdip/tpias
```
**Features:**
- Search by TPIA ID, commodity, certificate
- Filter by status and profit mode
- Detailed TPIA cards

#### 4. **TPIA Details** - Individual Investment View
```
http://localhost:3000/gdip/tpia/[id]
```
**Example:** `http://localhost:3000/gdip/tpia/TPIA-1`

**Features:**
- Financial overview (ROI, profit, value)
- GDC information
- Current cycle status
- Insurance details
- Profit mode switcher

#### 5. **Insurance Certificate** - Coverage Details
```
http://localhost:3000/gdip/tpia/[id]/certificate
```
**Example:** `http://localhost:3000/gdip/tpia/TPIA-1/certificate`

**Features:**
- Certificate display
- Download PDF (placeholder)
- Coverage information

#### 6. **Commodity Backing** - Physical Assets
```
http://localhost:3000/gdip/tpia/[id]/commodity-backing
```
**Example:** `http://localhost:3000/gdip/tpia/TPIA-1/commodity-backing`

**Features:**
- Physical assets backing TPIA
- Commodity details
- Warehouse location

#### 7. **Trade Cycles** - Cycle History
```
http://localhost:3000/gdip/cycles
```
**Features:**
- Cycle timeline visualization
- Status filtering
- Performance tracking

---

### Admin Pages (5 pages)

#### 1. **Admin Dashboard** - Platform Overview
```
http://localhost:3000/admin/gdip
```
**Features:**
- Platform statistics
- Recent GDCs and cycles
- Quick action buttons

#### 2. **GDC Management** - Cluster Monitoring
```
http://localhost:3000/admin/gdip/gdcs
```
**Features:**
- All GDCs listing
- Capacity monitoring (fill rate)
- Performance tracking
- Status filtering

#### 3. **Cycle Management** - Trade Cycle Control
```
http://localhost:3000/admin/gdip/cycles
```
**Features:**
- All cycles with status
- Complete cycle controls
- Distribute profits functionality

#### 4. **Create Cycle** - Schedule New Cycle
```
http://localhost:3000/admin/gdip/cycles/create
```
**Features:**
- Form to create 37-day cycles
- GDC and commodity configuration
- Start date scheduling

#### 5. **Partner Management** - KYC & Verification
```
http://localhost:3000/admin/gdip/partners
```
**Features:**
- All GDIP partners listing
- KYC verification status
- Partner statistics
- Search and filtering

---

## 🔐 Authentication Required

**Note:** Most GDIP pages require authentication. You'll need to:

1. **Register/Login** first at:
   ```
   http://localhost:3000/auth/login
   ```

2. **User Requirements for GDIP Access:**
   - ✅ KYC verified
   - ✅ Business type: Distributor or Wholesaler
   - ✅ Account status: Active
   - ✅ Wallet balance: ≥ ₦1,000,000 (for purchase)

## 🔐 Account Requirements
**Do I need a new account?**
No. You use your existing Glotrade account. However, to access GDIP features, your account **MUST** be verified.

**Required Status:**
- **KYC Status**: `Verified`
- **Business Type** (Optional): `Distributor` or `Wholesaler` preference

> **Note**: If you see a "403 Forbidden" or "KYC Required" message, please ensure your profile verification is complete.
>
> **How to Verify (for Testing):**
> Since there is currently no self-service KYC upload, an **Admin** must manually verify the user:
> 1. Log in as Admin
> 2. Go to **Admin > Users** (`/admin/users`)
> 3. Find the user
> 4. Click **"Verify User"** button


---

## 🎨 What You'll See

### Partner Dashboard (`/gdip`)
- **Portfolio Cards:** 4 summary cards showing your investment stats
- **Quick Actions:** 3 buttons (Purchase, View TPIAs, View Cycles)
- **TPIA Grid:** Visual cards for each investment
- **Modern Design:** Gradient backgrounds, glassmorphism effects

### Purchase Page (`/gdip/purchase`)
- **Commodity Selection:** 5 visual cards with icons
- **Profit Mode Toggle:** TPM (compound) vs EPS (withdraw)
- **Investment Summary:** Breakdown of ₦1M investment
- **Confirmation Modal:** Success feedback

### Admin Dashboard (`/admin/gdip`)
- **Statistics Overview:** Total TPIAs, GDCs, cycles, ROI
- **Recent Activity:** Latest GDCs and cycles
- **Management Links:** Navigate to GDCs, cycles, partners

---

## 🛠️ Backend API (if needed)

If you also want to test the backend API directly:

```bash
# Start backend (in another terminal)
cd apps/api
npm run dev

# Backend will run on:
http://localhost:8080
# or
http://localhost:5000
```

### Test API Endpoints:
```bash
# Get portfolio (requires auth token)
curl http://localhost:8080/api/gdip/portfolio \
  -H "Authorization: Bearer YOUR_TOKEN"

# Purchase TPIA
curl -X POST http://localhost:8080/api/gdip/tpia/purchase \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "commodityType": "rice",
    "profitMode": "TPM"
  }'
```

---

## 📊 Testing Workflow

### For Partners:
1. **Login** → `/auth/login`
2. **View Dashboard** → `/gdip`
3. **Purchase TPIA** → `/gdip/purchase`
4. **Check Portfolio** → `/gdip` or `/gdip/tpias`
5. **View Details** → `/gdip/tpia/[id]`
6. **Track Cycles** → `/gdip/cycles`

### For Admins:
1. **Login as Admin** → `/auth/login`
2. **Admin Dashboard** → `/admin/gdip`
3. **Monitor GDCs** → `/admin/gdip/gdcs`
4. **Manage Cycles** → `/admin/gdip/cycles`
5. **Create Cycle** → `/admin/gdip/cycles/create`
6. **Verify Partners** → `/admin/gdip/partners`

---

---

## 🎯 Next Steps

1. **Access the pages** using the URLs above
2. **Test the functionality** (requires authentication)
3. **Fix remaining build errors** for production readiness
4. **Deploy to production** when ready

---

**Happy Testing! 🚀**
