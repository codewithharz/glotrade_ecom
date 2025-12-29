# 🚀 Unified R2 Storage Setup Guide (Glotrade)

Follow these "baby steps" to set up your production storage. You only need **ONE** bucket for everything (avatars, products, and documents).

---

## 🏗️ Step 1: Create Your Bucket
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **R2 Object Storage** in the left sidebar.
3. Click **"Create bucket"**.
4. **Bucket Name**: Enter `glotrade-assets`.
5. Click **"Create bucket"**.
6. **IMPORTANT**: In the bucket settings, find **"Public Access"** and enable **"Allow Access"**. Cloudflare will provide you with a **Public URL** (e.g., `https://pub-xxx.r2.dev`). Copy this for later.

---

## 🔑 Step 2: Generate API Credentials
1. Go to the **R2 Overview** page (the main R2 screen).
2. Click **"Manage R2 API Tokens"** on the right side.
3. Click **"Create API token"**.
4. **Token Name**: Enter `Glotrade API Token`.
5. **Permissions**: Select **"Admin Read & Write"**.
6. Click **"Create API Token"**.
7. **SAVE THESE IMMEDIATELY**:
   - **Access Key ID**
   - **Secret Access Key**
   - **Endpoint** (It will look like `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`)

---

## 📝 Step 3: Update Your Environment
Open your `apps/api/.env` file and fill in the values you just saved:

```bash
# Cloudflare R2 Storage (ONE BUCKET FOR ALL)
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_account_id_from_endpoint_url
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=glotrade-assets
R2_PUBLIC_URL=https://your-public-url.r2.dev
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

> [!TIP]
> Your `R2_ACCOUNT_ID` is the string of numbers/letters right after `https://` in your endpoint URL.

---

## 📁 How the System Organizes Files
You don't need to create any folders manually. The system will automatically organize your files inside the `glotrade-assets` bucket like this:
- 👤 **Avatars**: `glotrade/avatars/{userId}/...`
- 📦 **Products**: `glotrade/products/{productId}/...`
- 📄 **Business Docs**: `glotrade/business-documents/{vendorId}/...`

---

## ✅ Step 4: Verify
1. Restart your API server (`npm run dev`).
2. Try uploading a profile picture in your user settings.
3. Check your Cloudflare Dashboard; you should see a `glotrade` folder appear inside your bucket!
