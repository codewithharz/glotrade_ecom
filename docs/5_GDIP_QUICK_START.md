# GDIP Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd apps/api
npm install node-cron
```

### Step 2: Integrate GDIP Routes

**Option A: Simple Integration (Recommended)**

Add to your `apps/api/src/index.ts`:

```typescript
import { setupGDIP, initializeGDIPAutomation } from './integrations/gdip.integration';

// After creating your Express app
setupGDIP(app);

// After database connection
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connected');
  initializeGDIPAutomation();
});
```

**Option B: Manual Integration**

```typescript
import gdipRoutes from './routes/gdip.routes';
import initializeGDIPCronJobs from './jobs/gdipCronJobs';

// Register routes
app.use('/api/gdip', gdipRoutes);

// Initialize cron jobs (after DB connection)
mongoose.connection.once('open', () => {
  initializeGDIPCronJobs();
});
```

### Step 3: Start Your Server

```bash
npm run dev
```

You should see:
```
✅ GDIP routes registered successfully
✅ GDIP cron jobs initialized successfully
   - Cycle start check: Daily at 2:00 AM
   - Cycle completion: Daily at 3:00 AM
   - New cycle scheduling: Daily at 4:00 AM
```

### Step 4: Test TPIA Purchase

**Using Postman/Insomnia:**

```bash
POST http://localhost:5000/api/gdip/tpia/purchase
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "commodityType": "Rice",
  "profitMode": "TPM"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully purchased TPIA-1",
  "data": {
    "tpiaId": "TPIA-1",
    "insuranceCertificateNumber": "TPIA-1-8472619305847",
    "gdcNumber": 10,
    "status": "pending"
  }
}
```

### Step 5: Access Frontend

Navigate to:
- Partner Dashboard: `http://localhost:3000/gdip`
- Admin Dashboard: `http://localhost:3000/admin/gdip`

---

## 📋 Quick Testing Checklist

- [ ] Backend server starts without errors
- [ ] GDIP routes registered
- [ ] Cron jobs initialized
- [ ] Can purchase TPIA via API
- [ ] Wallet debited correctly
- [ ] TPIA appears in dashboard
- [ ] Insurance certificate generated
- [ ] GDC assignment works
- [ ] Admin can create cycles
- [ ] Admin can complete cycles
- [ ] Profit distribution works

---

## 🔧 Configuration Options

### Environment Variables (Optional)

Add to `.env`:

```env
# GDIP Configuration
GDIP_DEFAULT_INSURANCE_PROVIDER=Default Insurance Provider
GDIP_TARGET_PROFIT_RATE=5
GDIP_CYCLE_DURATION_DAYS=37
GDIP_ENABLE_CRON=true
```

### Access Control

Edit `apps/api/src/middleware/gdip.middleware.ts` to customize:
- Who can access GDIP
- Minimum balance requirements
- KYC verification requirements

---

## 🐛 Common Issues

### Issue: "Module not found: node-cron"
**Solution:** `npm install node-cron`

### Issue: "Insufficient wallet balance"
**Solution:** Ensure user has ₦1,000,000 in wallet

### Issue: Cron jobs not running
**Solution:** Check server timezone matches expected schedule

---

## 📚 Next Steps

1. ✅ Test TPIA purchase flow
2. ✅ Create first GDC (10 TPIAs)
3. ✅ Create trade cycle (admin)
4. ✅ Complete cycle and distribute profits
5. ✅ Monitor via admin dashboard

---

## 🆘 Need Help?

- **Documentation:** `/docs/2_GDIP_COMPLETE_FLOW.md`
- **API Reference:** `/docs/3_GDIP_API_REFERENCE.md`
- **Deployment Guide:** `/docs/4_GDIP_DEPLOYMENT_GUIDE.md`

---

**Ready to go!** 🎉
