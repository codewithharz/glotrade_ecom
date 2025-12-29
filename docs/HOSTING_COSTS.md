# Glotrade Platform: Monthly Hosting Cost Breakdown (500-1000 Users)

This document provides a technical and financial breakdown for hosting the Glotrade Platform at a scale of 500-1000 active users.

## Infrastructure Summary

| Component | Provider | Plan (Recommended) | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Backend API** | [Render](https://render.com) | Starter | **$7.00** |
| **Frontend Web** | [Vercel](https://vercel.com) | Pro | **$20.00** |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/pricing) | M2 (General Purpose) | **$9.00** |
| **Object Storage** | [Cloudflare R2](https://www.cloudflare.com/products/r2/) | Pay-as-you-go | **~$0.00** |
| **Email Service** | [Amazon SES](https://aws.amazon.com/ses/) | Pay-as-you-go | **~$0.10** (Free Tier) |
| **Domain** | [Namecheap/Existing] | Renewal Fee | **~$1.25** ($15/yr) |
| **Redis** | [Render Redis](https://render.com/docs/redis) | Starter | **$10.00** |
| **TOTAL** | | | **~$47.35 / month** |

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

### 4. Email (Amazon SES)
- **Plan:** Pay-as-you-go ($0.10 per 1,000 emails)
- **Why:** We have integrated SES which is significantly cheaper than SendGrid ($20/mo). With 1,000 users, you'll likely send ~5,000 emails/month, costing you only **$0.50**. Plus, there is a generous **Free Tier** for the first 12 months (3,000 messages/month).
- **Implementation:** Currently implemented with a toggle. Switch `EMAIL_PROVIDER=ses` in `.env` to activate.

### 5. Storage (Cloudflare R2)
- **Plan:** Pay-as-you-go (Free up to 10GB)
- **Why:** R2 is significantly cheaper than AWS S3 because it has **Zero Egress Fees** (you don't pay when users download images). For 1000 users uploading product photos and certificates, you will likely stay in the free tier or pay less than $1/month.

### 6. Redis
- **Current Status:** **Implemented.**
- **Why:** Integrated for **API Rate Limiting** and **Cache fallback**. It prevents server crashes and improves performance under load.
- **Provider:** I recommend **Render Redis** ($10/mo) for production stability as it's in the same region as your API. You can also use **Upstash** (Free) for dev/testing.
- **Implementation:** Toggle via `REDIS_ENABLED=true` in `.env`.

---

## Cost Optimization Tips

1. **Email:** We've already integrated Amazon SES, which saves you $20/month compared to SendGrid.
2. **Database:** Monitor your storage. If you stay under 512MB, you can stick with the Free M0 tier for a few months, but you lose automatic backups.
3. **Vercel:** You can theoretically stay on "Hobby" until they flag you for commercial use or bandwidth, but for a professional platform like Glotrade, "Pro" is recommended.

> [!IMPORTANT]
> This estimate assumes standard e-commerce usage. If you have high-frequency trading simulation or heavy real-time features, the Backend and Database costs may increase by ~$20-40.
