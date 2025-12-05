# Seeding and Image Migration

This guide covers how to seed demo data and migrate existing product images to Picsum.

## Prerequisites
- Node.js and npm installed
- MongoDB connection string available as `MONGODB_URI`
- From the repo root, commands below assume the working dir is `apps/api`

## 1) Install dependencies
```bash
cd apps/api
npm install
```

## 2) Configure environment
Create a `.env` file in `apps/api` (if you don’t have one) and set your Mongo URL:
```bash
echo "MONGODB_URI=mongodb://localhost:27017/afritrade" > .env
```
Adjust the value to your environment as needed.

## 3) Seed demo data
This creates a demo seller, categories, and products.
```bash
npm run seed
```
Expected output includes:
```
🚀 MongoDB connected successfully
✅ Seed complete.
💔 Mongoose connection disconnected
```

## 4) Migrate existing images to Picsum (one‑off)
If you already have products that still use placeholder images or fewer than 5 images, run:
```bash
npm run migrate:images
```
This script:
- Replaces any `placehold.co` images
- Ensures each product has 5 Picsum images derived from the product title

Example output:
```
✅ Migrated images for 24 products.
```

## Notes
- Connection settings are read from `MONGODB_URI` in `.env` or default to `mongodb://localhost:27017/afritrade`.
- Seeding is idempotent for known records; it updates fields if products already exist.
- Migration is safe to re-run; products will simply be set to the deterministic Picsum set per title.