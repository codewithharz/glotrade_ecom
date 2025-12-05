/*
  One-off migration: replace placeholder images with Picsum and ensure 5 images per product
*/
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import Product from "../models/Product";

dotenv.config();

function picsumImages(title: string): string[] {
  const seed = encodeURIComponent(String(title).toLowerCase().replace(/\s+/g, "-"));
  return [
    `https://picsum.photos/seed/${seed}-1/800/800`,
    `https://picsum.photos/seed/${seed}-2/1000/750`,
    `https://picsum.photos/seed/${seed}-3/900/1200`,
    `https://picsum.photos/seed/${seed}-4/1200/900`,
    `https://picsum.photos/seed/${seed}-5/800/600`,
  ];
}

async function run() {
  await connectDB();
  const placeholderRe = /placehold\.co/i;
  const toFix = await Product.find({ $or: [
    { images: { $elemMatch: { $regex: placeholderRe } } },
    { $expr: { $lt: [ { $size: "$images" }, 5 ] } },
  ] }).select("_id title images");

  let updated = 0;
  for (const p of toFix) {
    const next = picsumImages(p.title as any);
    (p as any).images = next;
    await (p as any).save();
    updated += 1;
  }
  console.log(`✅ Migrated images for ${updated} products.`);
  await mongoose.connection.close();
}

run().catch(async (err) => { console.error("❌ Migration failed:", err); await mongoose.connection.close(); process.exit(1); });

