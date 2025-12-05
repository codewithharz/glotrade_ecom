# Detailed Deployment Guide - Render + Vercel

Complete step-by-step guide for deploying your e-commerce platform to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Scaling](#scaling-considerations)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [ ] GitHub account with repository pushed
- [ ] MongoDB Atlas account
- [ ] Render account
- [ ] Vercel account
- [ ] Payment provider credentials (Paystack, Flutterwave)
- [ ] Domain name (optional)

---

## MongoDB Atlas Setup

### Create Database

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create new cluster:
   - **Tier**: M0 Sandbox (Free)
   - **Provider**: AWS/GCP/Azure
   - **Region**: Closest to your users
4. Wait for cluster creation (2-5 minutes)

### Configure Access

**Network Access:**
1. Sidebar → **Network Access**
2. **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
3. Confirm

**Database User:**
1. Sidebar → **Database Access**
2. **Add New Database User**
3. Authentication: **Password**
4. Username: `afritrade_user`
5. Password: Generate secure password (save it!)
6. Database User Privileges: **Read and write to any database**
7. **Add User**

### Get Connection String

1. Click **Connect** on your cluster
2. **Connect your application**
3. Driver: **Node.js** version **4.1 or later**
4. Copy connection string:
   ```
   mongodb+srv://afritrade_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `/afritrade` before the `?`
   ```
   mongodb+srv://afritrade_user:yourpassword@cluster0.xxxxx.mongodb.net/afritrade?retryWrites=true&w=majority
   ```

---

## Backend Deployment (Render)

### Prepare Backend Code

1. Ensure `apps/api/package.json` has correct scripts:
```json
{
  "name": "api",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn src/index.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    // ... other dependencies
  }
}
```

2. Verify `apps/api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Deploy to Render

1. **Go to Render**: https://dashboard.render.com/
2. **New Web Service**: Click "New +" → "Web Service"
3. **Connect Repository**:
   - Connect GitHub account if not already
   - Select your repository
   - Click "Connect"

4. **Configure Service**:
   ```
   Name: afritrade-api
   Region: Oregon (US West) or closest to users
   Branch: main
   Root Directory: apps/api
   Runtime: Node
   Build Command: yarn install && yarn build
   Start Command: yarn start
   Instance Type: Free (or Starter $7/month for production)
   ```

5. **Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   
   ```bash
   # Required
   NODE_ENV=production
   PORT=5000
   
   # Database
   MONGODB_URI=mongodb+srv://afritrade_user:yourpassword@cluster0.xxxxx.mongodb.net/afritrade?retryWrites=true&w=majority
   
   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long_random_string
   
   # Payment Providers
   PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
   FLUTTERWAVE_SECRET_KEY=FLWSECK-your_flutterwave_secret_key
   
   # Frontend URL (update after Vercel deployment)
   FRONTEND_URL=https://your-app.vercel.app
   
   # Optional
   MAX_FILE_SIZE=5242880
   ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif
   ```

6. **Create Web Service**: Click "Create Web Service"

7. **Wait for Deployment**: 5-10 minutes
   - Watch build logs in real-time
   - Look for "Your service is live 🎉"

8. **Copy Backend URL**: 
   ```
   https://afritrade-api.onrender.com
   ```

### Test Backend

```bash
# Health check
curl https://afritrade-api.onrender.com/health

# Should return:
# {"status":"ok","timestamp":"2024-..."}
```

---

## Frontend Deployment (Vercel)

### Prepare Frontend Code

1. Ensure `apps/web/.env.example` exists:
```env
NEXT_PUBLIC_API_URL=https://afritrade-api.onrender.com
```

2. Verify `apps/web/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
```

### Deploy to Vercel

1. **Go to Vercel**: https://vercel.com/dashboard
2. **New Project**: Click "Add New..." → "Project"
3. **Import Repository**:
   - Connect GitHub if not already
   - Find your repository
   - Click "Import"

4. **Configure Project**:
   ```
   Framework Preset: Next.js (auto-detected)
   Root Directory: apps/web
   Build Command: yarn build (default)
   Output Directory: .next (default)
   Install Command: yarn install (default)
   Development Command: yarn dev (default)
   ```

5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://afritrade-api.onrender.com
   ```

6. **Deploy**: Click "Deploy"

7. **Wait for Deployment**: 3-5 minutes
   - Watch build progress
   - Look for "Congratulations!" message

8. **Your App is Live**:
   ```
   https://your-app-name.vercel.app
   ```

### Configure Custom Domain (Optional)

1. **Go to Project Settings** → **Domains**
2. **Add Domain**: Enter your domain (e.g., `afritrade.com`)
3. **Update DNS Records** (at your domain registrar):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. **Wait for Verification**: 24-48 hours max
5. **SSL Certificate**: Automatic (Let's Encrypt)

---

## Post-Deployment Configuration

### Update Backend CORS

1. **Edit** `apps/api/src/index.ts` or middleware file:
```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'https://afritrade.com', // if using custom domain
    'https://www.afritrade.com',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

2. **Commit and Push**:
```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

3. **Auto-Deploy**: Render will automatically redeploy

### Update Frontend Environment

If you added a custom domain for backend:

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Edit** `NEXT_PUBLIC_API_URL`:
   ```
   NEXT_PUBLIC_API_URL=https://api.afritrade.com
   ```
3. **Redeploy**: Vercel → Deployments → Latest → "..." → "Redeploy"

### Create Super Admin

**Option 1: Via API**
```bash
curl -X POST https://afritrade-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@afritrade.com",
    "username": "admin",
    "password": "SecurePassword123!"
  }'
```

Then manually update in MongoDB Atlas:
1. Go to **Collections**
2. Find **users** collection
3. Find your admin user
4. Edit document:
   ```json
   {
     "isSuperAdmin": true,
     "role": "admin"
   }
   ```

**Option 2: Via Render Shell**
1. Render Dashboard → Your Service → **Shell** tab
2. Run:
```bash
node dist/scripts/createSuperAdmin.js
```

---

## Monitoring & Maintenance

### Enable Auto-Deploy

**Render:**
- Already enabled by default
- Every push to `main` triggers deployment

**Vercel:**
- Already enabled by default
- Every push triggers preview deployment
- Merges to `main` trigger production deployment

### Set Up Health Checks

**Render:**
1. Dashboard → Your Service → **Settings**
2. **Health Check Path**: `/health`
3. **Save Changes**

### Configure Alerts

**Render:**
1. Settings → **Notifications**
2. Enable **Deploy Failed** alerts
3. Enable **Service Down** alerts
4. Add email/Slack webhook

**Vercel:**
1. Project Settings → **Notifications**
2. Enable deployment notifications
3. Add email/Slack integration

### Monitor Logs

**Render Logs:**
- Dashboard → Your Service → **Logs** tab
- Real-time streaming
- Filter by log level

**Vercel Logs:**
- Dashboard → Your Project → **Deployments**
- Click deployment → **View Function Logs**
- Filter by function/route

### Database Backups

**MongoDB Atlas:**
1. **Clusters** → **Backup** tab
2. Enable **Cloud Backup** (paid feature, $0.20/GB/month)
3. Or use `mongodump` for manual backups:
```bash
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/afritrade" --out=./backup
```

---

## Scaling Considerations

### When to Upgrade Render

**Free Tier Limitations:**
- Spins down after 15 minutes inactivity
- 512 MB RAM
- Shared CPU
- Cold start: 30-60 seconds

**Upgrade to Starter ($7/month) when:**
- You have consistent traffic (> 100 requests/day)
- Cold starts affect user experience
- Need more RAM/CPU
- Want 24/7 uptime

**Upgrade to Standard ($25/month) when:**
- High traffic (> 10,000 requests/day)
- Need dedicated resources
- Require horizontal scaling

### When to Upgrade Vercel

**Free Tier (Hobby):**
- 100 GB bandwidth/month
- 100 GB-hours serverless function execution
- 6,000 build minutes/month

**Upgrade to Pro ($20/month) when:**
- Exceeding bandwidth limits
- Need team collaboration
- Want advanced analytics
- Require password protection

### Horizontal Scaling

**Backend (Render):**
1. Settings → **Scaling**
2. Increase instance count
3. Enable auto-scaling (Pro plan)

**Frontend (Vercel):**
- Automatic edge caching
- Global CDN (automatic)
- No manual scaling needed

---

## Troubleshooting

### Backend Issues

**Problem: 502 Bad Gateway**

*Cause*: Backend not starting or crashing

*Solution*:
1. Check Render logs for errors
2. Verify all environment variables set
3. Test MongoDB connection:
```bash
# In Render Shell
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(err => console.error(err));"
```

**Problem: CORS Errors**

*Cause*: Frontend domain not in CORS whitelist

*Solution*:
1. Verify `FRONTEND_URL` environment variable
2. Check CORS configuration includes Vercel domain
3. Redeploy after changes

**Problem: JWT Errors**

*Cause*: JWT_SECRET not set or too short

*Solution*:
1. Ensure `JWT_SECRET` is at least 32 characters
2. Generate new secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Issues

**Problem: API Calls Failing**

*Cause*: Incorrect API URL or CORS

*Solution*:
1. Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. Verify backend is running: `curl https://your-api.onrender.com/health`
3. Check browser console for actual error

**Problem: Build Fails**

*Cause*: Missing dependencies or TypeScript errors

*Solution*:
1. Check Vercel build logs
2. Test locally: `cd apps/web && yarn build`
3. Fix TypeScript errors
4. Ensure all dependencies in `package.json`

**Problem: Environment Variables Not Working**

*Cause*: Not prefixed with `NEXT_PUBLIC_`

*Solution*:
1. Client-side variables MUST start with `NEXT_PUBLIC_`
2. Redeploy after adding variables
3. Clear Vercel cache: Settings → Data Cache → Clear

---

## Security Checklist

Before going live:

- [ ] `JWT_SECRET` is strong (min 32 chars, random)
- [ ] MongoDB user has limited permissions
- [ ] Environment variables never in git
- [ ] HTTPS enabled (automatic)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Payment webhooks verified
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection (React escapes by default)
- [ ] CSRF protection for state-changing operations
- [ ] Helmet.js configured for security headers

---

## Rollback Procedure

### Render Rollback

1. Dashboard → Your Service → **Manual Deploy**
2. Select previous commit from dropdown
3. Click **Deploy Selected Commit**
4. Wait for deployment

### Vercel Rollback

1. Dashboard → Your Project → **Deployments**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**
4. Confirm

---

## Performance Optimization

### Backend

1. **Enable Compression**:
```typescript
import compression from 'compression';
app.use(compression());
```

2. **Add Caching**:
```typescript
import redis from 'redis';
// Cache frequently accessed data
```

3. **Database Indexing**:
```typescript
// Add indexes to frequently queried fields
userSchema.index({ email: 1 });
productSchema.index({ category: 1, price: 1 });
```

### Frontend

1. **Image Optimization**: Already handled by Next.js Image component

2. **Code Splitting**: Automatic with Next.js

3. **Enable Analytics**:
   - Vercel Dashboard → Your Project → **Analytics**
   - Enable Web Analytics (free)

---

## Support Resources

- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Next.js**: https://nextjs.org/docs
- **Express**: https://expressjs.com

---

## Cost Breakdown

### Free Tier (Development/Testing)

| Service | Cost | Limitations |
|---------|------|-------------|
| Render | $0 | Spins down after 15min |
| Vercel | $0 | 100GB bandwidth |
| MongoDB Atlas | $0 | 512MB storage |
| **Total** | **$0/month** | Good for testing |

### Production (Recommended)

| Service | Plan | Cost |
|---------|------|------|
| Render | Starter | $7/month |
| Vercel | Pro | $20/month |
| MongoDB Atlas | M2 | $9/month |
| **Total** | | **$36/month** |

---

**🎉 Congratulations! Your platform is production-ready!**

For Docker deployment, see `docker-compose.yml`
For pre-launch checklist, see `PRODUCTION_CHECKLIST.md`
