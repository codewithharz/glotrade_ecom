# Glotrade Platform: Monthly Hosting Cost Breakdown (500-1000 Users)

This document provides a technical and financial breakdown for hosting the Glotrade Platform at a scale of 500-1000 active users.

## Infrastructure Summary

| Component | Provider | Plan (Recommended) | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Backend API** | [Render](https://render.com) | Starter | **$7.00** |
| **Frontend Web** | [Vercel](https://vercel.com) | Pro | **$20.00** |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/pricing) | M2 (General Purpose) | **$9.00** |
| **Object Storage** | [Cloudflare R2](https://www.cloudflare.com/products/r2/) | Pay-as-you-go | **~$0.00** |
| **Email Service** | [SendGrid](https://sendgrid.com/pricing/) | Essentials 40K | **$19.95** |
| **Domain** | [Namecheap/Existing] | Renewal Fee | **~$1.25** ($15/yr) |
| **Redis (Optional)** | [Upstash](https://upstash.com/) | Serverless (Free Tier) | **$0.00** |
| **TOTAL** | | | **~$57.20 / month** |

---

## Detailed Breakdown

### 1. Backend (Render)
- **Plan:** Starter ($7/month)
- **Why:** The Free tier on Render "sleeps" after 15 minutes of inactivity, causing "cold starts" (30s+ delays) for users. For 500-1000 users, you need the **Starter** plan to ensure 24/7 uptime and faster responses.
- **Scaling:** If performance drops as you hit 1000 users, you can upgrade to **Standard** ($25/month).

### 2. Frontend (Vercel)
- **Plan:** Pro ($20/month)
- **Why:** Once you have a commercial domain and 1000 users, Vercel's "Hobby" tier (which is for personal use only) is no longer appropriate. The Pro plan includes 100GB of bandwidth, which is more than enough for 1000 users browsing an e-commerce platform.

### 3. Database (MongoDB Atlas)
- **Plan:** M2 ($9/month) or M5 ($25/month)
- **Why:** The Free tier (M0) is limited to 512MB and Shared CPU. With 1000 users generating orders, transactions, and logs, you need a cluster with **Dedicated RAM** and **Automated Backups**. I recommend starting with M2.

### 4. Email (SendGrid)
- **Plan:** Essentials 40K ($19.95/month)
- **Why:** The Free plan only allows 100 emails/day. With 1000 users, just "Welcome" emails, Password Resets, and Order Confirmations will quickly exceed that limit. Essentials allows up to 40,000 emails/month.

### 5. Storage (Cloudflare R2)
- **Plan:** Pay-as-you-go (Free up to 10GB)
- **Why:** R2 is significantly cheaper than AWS S3 because it has **Zero Egress Fees** (you don't pay when users download images). For 1000 users uploading product photos and certificates, you will likely stay in the free tier or pay less than $1/month.

### 6. Do we have Redis? 
- **Current Status:** **No.** Your current `package.json` does not include Redis dependencies.
- **Recommendation:** I recommend adding it.
  - **Why?** It will handle **API Rate Limiting** and **Session Caching** much better than the current in-memory solution.
  - **Provider:** Use [Upstash](https://upstash.com). It is "Serverless Redis." Their Free tier allows 10,000 requests per day, which will cost you **$0/month** until you grow past the initial 1000 users.

---

## Cost Optimization Tips

1. **Email:** If $20 for SendGrid is too high initially, you can use **Amazon SES** (requires more setup) which is ~$0.10 per 1,000 emails.
2. **Database:** Monitor your storage. If you stay under 512MB, you can stick with the Free M0 tier for a few months, but you lose automatic backups.
3. **Vercel:** You can theoretically stay on "Hobby" until they flag you for commercial use or bandwidth, but for a professional platform like Glotrade, "Pro" is recommended.

> [!IMPORTANT]
> This estimate assumes standard e-commerce usage. If you have high-frequency trading simulation or heavy real-time features, the Backend and Database costs may increase by ~$20-40.
