# Vercel Frontend Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- ✅ Backend deployed to Render: `https://glotrade-ecom.onrender.com`
- ✅ GitHub repository pushed
- ✅ Vercel account (sign up at vercel.com)

---

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Import Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `harzjunior/glotrade_ecom`
4. Click **"Import"**

### Step 2: Configure Project
```
Framework Preset: Next.js
Root Directory: apps/web
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Step 3: Environment Variables
Add this environment variable:

**Key:** `NEXT_PUBLIC_API_URL`  
**Value:** `https://glotrade-ecom.onrender.com`

### Step 4: Deploy
Click **"Deploy"** and wait for the build to complete!

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy from apps/web directory
```bash
cd apps/web
vercel --prod
```

### Step 4: Set Environment Variable
When prompted, add:
```
NEXT_PUBLIC_API_URL=https://glotrade-ecom.onrender.com
```

---

## 📋 Vercel Configuration File

Create `vercel.json` in the repository root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://glotrade-ecom.onrender.com"
  }
}
```

---

## ⚙️ Post-Deployment Configuration

### 1. Update CORS in Render
Once your Vercel deployment is live (e.g., `https://glotrade-ecom.vercel.app`), update the `CORS_ORIGIN` environment variable in Render:

**Render Dashboard → Your Service → Environment**
```
CORS_ORIGIN=https://glotrade-ecom.vercel.app,http://localhost:3000
```

Then **"Manual Deploy"** to apply changes.

### 2. Custom Domain (Optional)
In Vercel Dashboard:
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` in Render to include your custom domain

---

## 🔍 Verify Deployment

After deployment, test these URLs:

1. **Homepage:** `https://your-app.vercel.app`
2. **API Connection:** Check browser console for API calls
3. **Authentication:** Try logging in
4. **Products:** Browse product listings

---

## 🐛 Troubleshooting

### Build Fails
**Error:** `Module not found`
**Fix:** Ensure all dependencies are in `apps/web/package.json`

### API Connection Issues
**Error:** `CORS error` or `Network error`
**Fix:** 
1. Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
2. Update `CORS_ORIGIN` in Render to include your Vercel URL

### Environment Variables Not Working
**Error:** API URL is undefined
**Fix:** 
1. Ensure variable starts with `NEXT_PUBLIC_`
2. Redeploy after adding environment variables
3. Check Vercel Dashboard → Settings → Environment Variables

---

## 📊 Expected Build Output

```
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    X kB          XX kB
├ ○ /auth/login                          X kB          XX kB
├ ○ /products                            X kB          XX kB
└ ○ /checkout                            X kB          XX kB

○  (Static)  prerendered as static content

✓ Deployment ready
```

---

## 🎉 Success Checklist

- [ ] Frontend deployed to Vercel
- [ ] Environment variable `NEXT_PUBLIC_API_URL` set
- [ ] CORS updated in Render backend
- [ ] Homepage loads successfully
- [ ] Can browse products
- [ ] Authentication works
- [ ] Checkout flow functional
- [ ] Custom domain configured (optional)

---

## 🔗 Your Deployment URLs

**Backend API:** https://glotrade-ecom.onrender.com  
**Frontend:** https://your-app.vercel.app (will be assigned after deployment)  
**API Docs:** https://glotrade-ecom.onrender.com/api-docs

---

**Ready to deploy!** 🚀

Choose Option 1 (Dashboard) for the easiest experience, or Option 2 (CLI) for more control.
