# Pre-Push Checklist for GitHub

## ✅ Security Check

Before pushing to GitHub, verify that NO sensitive data is included:

### 1. Environment Files Check
- [ ] `.env` files are in `.gitignore` ✓
- [ ] `env.example` templates created (no real credentials)
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] No database credentials in code

### 2. Sensitive Data Removed
Run this command to check for potential secrets:

```bash
# Check for potential secrets in staged files
git grep -i "password\|secret\|api_key\|mongodb+srv" $(git diff --cached --name-only)
```

**Files to double-check:**
- `apps/api/.env` - Should NOT be committed
- `apps/web/.env.local` - Should NOT be committed
- `apps/web/.env.production` - Should NOT be committed

### 3. What SHOULD be committed:
- ✅ `apps/api/env.example` - Template with placeholder values
- ✅ `apps/web/env.example` - Template with placeholder values
- ✅ `env.docker.example` - Docker template
- ✅ `.gitignore` - Updated to protect secrets
- ✅ All deployment documentation

### 4. What should NOT be committed:
- ❌ `apps/api/.env` - Contains real credentials
- ❌ `apps/web/.env.local` - Contains real API URL
- ❌ `apps/web/.env.production` - Contains production config
- ❌ Any file with real API keys, passwords, or secrets

---

## 📋 Pre-Push Commands

### Step 1: Check Git Status
```bash
cd /Users/harz/Documents/backUps/glotrade_ecom
git status
```

### Step 2: Review Changes
```bash
# See what files will be committed
git diff --cached

# Or review specific files
git diff apps/api/.env
```

### Step 3: Verify .env is NOT staged
```bash
# This should show .env files
git status --ignored | grep .env

# This should NOT show .env files (only env.example)
git status | grep .env
```

### Step 4: Stage Files
```bash
# Add all files (gitignore will protect .env)
git add .

# Or add specific files
git add apps/
git add DEPLOYMENT.md
git add DEPLOYMENT_DETAILED.md
git add DOCKER.md
git add PRODUCTION_CHECKLIST.md
git add docker-compose.yml
```

### Step 5: Verify Staged Files
```bash
# List all files that will be committed
git diff --cached --name-only

# Ensure NO .env files are listed (except env.example)
git diff --cached --name-only | grep -E "\.env$"
# This should return nothing
```

### Step 6: Commit
```bash
git commit -m "feat: Complete security fixes and deployment documentation

- Fixed all 401 authentication errors
- Replaced legacy authHeader with proper JWT authentication
- Created comprehensive deployment guides (Render + Vercel)
- Added Docker configuration for containerized deployment
- Added production checklist
- Updated .gitignore to protect sensitive data
- Created environment variable templates"
```

### Step 7: Push to GitHub
```bash
# If this is your first push
git branch -M main
git remote add origin https://github.com/yourusername/glotrade_ecom.git
git push -u origin main

# If repository already exists
git push origin main
```

---

## 🔍 Final Security Verification

After pushing, verify on GitHub:

1. **Go to your repository on GitHub**
2. **Check that these files are NOT visible:**
   - `apps/api/.env`
   - `apps/web/.env.local`
   - `apps/web/.env.production`

3. **Check that these files ARE visible:**
   - `apps/api/env.example`
   - `apps/web/env.example`
   - `.gitignore`

4. **If you accidentally pushed secrets:**
   ```bash
   # Remove from history (DANGER: rewrites history)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch apps/api/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push
   git push origin --force --all
   
   # Rotate ALL secrets immediately!
   ```

---

## 📝 Your Current Environment Files

**Backend (.env):**
- ✅ MongoDB URI: `mongodb+srv://...` (PROTECTED)
- ✅ JWT Secret: Set (PROTECTED)
- ✅ Paystack Keys: Set (PROTECTED)
- ✅ Flutterwave Keys: Set (PROTECTED)
- ✅ Korapay Keys: Set (PROTECTED)
- ✅ SMTP Credentials: Set (PROTECTED)
- ✅ R2 Cloudflare: Set (PROTECTED)

**Frontend (.env.local):**
- ✅ API URL: `http://localhost:8080` (PROTECTED)

All sensitive data is properly configured and will be protected by `.gitignore`.

---

## 🚀 Quick Push Commands

```bash
# Navigate to project
cd /Users/harz/Documents/backUps/glotrade_ecom

# Check status
git status

# Add all files (protected by .gitignore)
git add .

# Verify no secrets staged
git diff --cached --name-only | grep -E "\.env$"

# Commit
git commit -m "feat: Production-ready with security fixes and deployment docs"

# Push
git push origin main
```

---

## ⚠️ Important Reminders

1. **Never commit real credentials** - Always use env.example templates
2. **Rotate secrets if exposed** - If you accidentally push secrets, rotate them immediately
3. **Use environment variables** - Never hardcode secrets in code
4. **Review before pushing** - Always check `git diff --cached` before committing
5. **Keep .gitignore updated** - Add new sensitive files as needed

---

**You're ready to push! 🎉**

Your `.gitignore` is properly configured and all sensitive data is protected.
