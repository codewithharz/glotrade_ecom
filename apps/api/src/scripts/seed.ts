/*
  Seed database with a demo seller, categories, and featured products
  Run this script to seed the database with a demo seller, categories, and featured products
  cd apps/api
  npm run seed
*/
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import Category from "../models/Category";
import Product from "../models/Product";

dotenv.config();

async function run() {
  await connectDB();

  // Platform owner (Glotrade) - Single seller platform
  const platformAddress = "0x1111111111111111111111111111111111111111";

  let seller = await User.findOne({ address: platformAddress });

  if (seller) {
    // Update existing user to be admin
    seller.username = "glotrade";
    seller.email = "admin@glotrade.com";
    seller.role = "admin";
    seller.isSuperAdmin = true;
    seller.firstName = "Glotrade";
    seller.lastName = "Admin";
    await seller.save();
    console.log("Updated existing user to platform admin");
  } else {
    seller = await User.create({
      address: platformAddress,
      username: "glotrade",
      email: "admin@glotrade.com",
      role: "admin",
      isSuperAdmin: true,
      isVerified: true,
      country: "Nigeria",
      city: "Lagos",
      firstName: "Glotrade",
      lastName: "Admin",
    });
    console.log("Created new platform admin user");
  }

  // 3-level Categories (Department > Category > Subcategory)
  const categories = [
    // ============================================
    // LEVEL 1: ELECTRONICS (Department)
    // ============================================
    {
      name: "Electronics",
      description: "Devices, gadgets and electronic accessories",
      slug: "electronics",
    },

    // Level 2: Electronics Categories
    {
      name: "Computers & Accessories",
      parentSlug: "electronics",
      slug: "computers-accessories",
    },
    {
      name: "Mobile Phones & Tablets",
      parentSlug: "electronics",
      slug: "mobile-phones-tablets",
    },
    { name: "Audio & Sound", parentSlug: "electronics", slug: "audio-sound" },
    {
      name: "Cameras & Photography",
      parentSlug: "electronics",
      slug: "cameras-photography",
    },
    {
      name: "Smart Home & IoT",
      parentSlug: "electronics",
      slug: "smart-home-iot",
    },
    {
      name: "Wearable Technology",
      parentSlug: "electronics",
      slug: "wearable-technology",
    },
    { name: "Gaming", parentSlug: "electronics", slug: "gaming" },
    {
      name: "TV & Home Entertainment",
      parentSlug: "electronics",
      slug: "tv-home-entertainment",
    },

    // Level 3: Computers & Accessories Subcategories
    { name: "Laptops", parentSlug: "computers-accessories", slug: "laptops" },
    {
      name: "Desktop Computers",
      parentSlug: "computers-accessories",
      slug: "desktop-computers",
    },
    {
      name: "Monitors & Displays",
      parentSlug: "computers-accessories",
      slug: "monitors-displays",
    },
    {
      name: "Computer Components",
      parentSlug: "computers-accessories",
      slug: "computer-components",
    },
    {
      name: "Keyboards & Mice",
      parentSlug: "computers-accessories",
      slug: "keyboards-mice",
    },
    {
      name: "Storage Devices",
      parentSlug: "computers-accessories",
      slug: "storage-devices",
    },
    {
      name: "Networking Equipment",
      parentSlug: "computers-accessories",
      slug: "networking-equipment",
    },
    {
      name: "Printers & Scanners",
      parentSlug: "computers-accessories",
      slug: "printers-scanners",
    },

    // Level 3: Mobile Phones & Tablets Subcategories
    {
      name: "Smartphones",
      parentSlug: "mobile-phones-tablets",
      slug: "smartphones",
    },
    {
      name: "Tablets & iPads",
      parentSlug: "mobile-phones-tablets",
      slug: "tablets-ipads",
    },
    {
      name: "Phone Cases & Covers",
      parentSlug: "mobile-phones-tablets",
      slug: "phone-cases-covers",
    },
    {
      name: "Screen Protectors",
      parentSlug: "mobile-phones-tablets",
      slug: "screen-protectors",
    },
    {
      name: "Chargers & Cables",
      parentSlug: "mobile-phones-tablets",
      slug: "chargers-cables",
    },
    {
      name: "Power Banks",
      parentSlug: "mobile-phones-tablets",
      slug: "power-banks",
    },
    {
      name: "Phone Accessories",
      parentSlug: "mobile-phones-tablets",
      slug: "phone-accessories",
    },

    // Level 3: Audio & Sound Subcategories
    { name: "Headphones", parentSlug: "audio-sound", slug: "headphones" },
    {
      name: "Earbuds & Earphones",
      parentSlug: "audio-sound",
      slug: "earbuds-earphones",
    },
    {
      name: "Bluetooth Speakers",
      parentSlug: "audio-sound",
      slug: "bluetooth-speakers",
    },
    { name: "Soundbars", parentSlug: "audio-sound", slug: "soundbars" },
    {
      name: "Home Theater Systems",
      parentSlug: "audio-sound",
      slug: "home-theater-systems",
    },
    { name: "Microphones", parentSlug: "audio-sound", slug: "microphones" },
    {
      name: "Audio Accessories",
      parentSlug: "audio-sound",
      slug: "audio-accessories",
    },

    // Level 3: Cameras & Photography Subcategories
    {
      name: "DSLR Cameras",
      parentSlug: "cameras-photography",
      slug: "dslr-cameras",
    },
    {
      name: "Mirrorless Cameras",
      parentSlug: "cameras-photography",
      slug: "mirrorless-cameras",
    },
    {
      name: "Action Cameras",
      parentSlug: "cameras-photography",
      slug: "action-cameras",
    },
    {
      name: "Camera Lenses",
      parentSlug: "cameras-photography",
      slug: "camera-lenses",
    },
    {
      name: "Tripods & Stands",
      parentSlug: "cameras-photography",
      slug: "tripods-stands",
    },
    {
      name: "Camera Bags",
      parentSlug: "cameras-photography",
      slug: "camera-bags",
    },
    { name: "Drones", parentSlug: "cameras-photography", slug: "drones" },

    // Level 3: Smart Home & IoT Subcategories
    {
      name: "Smart Speakers",
      parentSlug: "smart-home-iot",
      slug: "smart-speakers",
    },
    {
      name: "Smart Lighting",
      parentSlug: "smart-home-iot",
      slug: "smart-lighting",
    },
    {
      name: "Smart Security",
      parentSlug: "smart-home-iot",
      slug: "smart-security",
    },
    {
      name: "Smart Plugs & Switches",
      parentSlug: "smart-home-iot",
      slug: "smart-plugs-switches",
    },
    {
      name: "Smart Thermostats",
      parentSlug: "smart-home-iot",
      slug: "smart-thermostats",
    },

    // Level 3: Wearable Technology Subcategories
    {
      name: "Smart Watches",
      parentSlug: "wearable-technology",
      slug: "smart-watches",
    },
    {
      name: "Fitness Trackers",
      parentSlug: "wearable-technology",
      slug: "fitness-trackers",
    },
    {
      name: "VR Headsets",
      parentSlug: "wearable-technology",
      slug: "vr-headsets",
    },

    // Level 3: Gaming Subcategories
    { name: "Gaming Consoles", parentSlug: "gaming", slug: "gaming-consoles" },
    {
      name: "Gaming Accessories",
      parentSlug: "gaming",
      slug: "gaming-accessories",
    },
    { name: "Video Games", parentSlug: "gaming", slug: "video-games" },
    { name: "Gaming Chairs", parentSlug: "gaming", slug: "gaming-chairs" },

    // Level 3: TV & Home Entertainment Subcategories
    {
      name: "Televisions",
      parentSlug: "tv-home-entertainment",
      slug: "televisions",
    },
    {
      name: "Streaming Devices",
      parentSlug: "tv-home-entertainment",
      slug: "streaming-devices",
    },
    {
      name: "Media Players",
      parentSlug: "tv-home-entertainment",
      slug: "media-players",
    },

    // ============================================
    // LEVEL 1: FASHION & APPAREL (Department)
    // ============================================
    {
      name: "Fashion & Apparel",
      description: "Clothing, shoes and fashion accessories",
      slug: "fashion-apparel",
    },

    // Level 2: Fashion Categories
    {
      name: "Women's Fashion",
      parentSlug: "fashion-apparel",
      slug: "womens-fashion",
    },
    {
      name: "Men's Fashion",
      parentSlug: "fashion-apparel",
      slug: "mens-fashion",
    },
    {
      name: "Kids & Babies",
      parentSlug: "fashion-apparel",
      slug: "kids-babies",
    },
    {
      name: "Fashion Accessories",
      parentSlug: "fashion-apparel",
      slug: "fashion-accessories",
    },
    {
      name: "Plus Size Fashion",
      parentSlug: "fashion-apparel",
      slug: "plus-size-fashion",
    },

    // Level 3: Women's Fashion Subcategories
    {
      name: "Women's Clothing",
      parentSlug: "womens-fashion",
      slug: "womens-clothing",
    },
    { name: "Dresses", parentSlug: "womens-fashion", slug: "dresses" },
    {
      name: "Tops & Blouses",
      parentSlug: "womens-fashion",
      slug: "tops-blouses",
    },
    {
      name: "Pants & Trousers",
      parentSlug: "womens-fashion",
      slug: "pants-trousers",
    },
    { name: "Skirts", parentSlug: "womens-fashion", slug: "skirts" },
    {
      name: "Women's Shoes",
      parentSlug: "womens-fashion",
      slug: "womens-shoes",
    },
    { name: "Handbags", parentSlug: "womens-fashion", slug: "handbags" },
    {
      name: "Women's Activewear",
      parentSlug: "womens-fashion",
      slug: "womens-activewear",
    },
    {
      name: "Lingerie & Sleepwear",
      parentSlug: "womens-fashion",
      slug: "lingerie-sleepwear",
    },

    // Level 3: Men's Fashion Subcategories
    {
      name: "Men's Clothing",
      parentSlug: "mens-fashion",
      slug: "mens-clothing",
    },
    { name: "Shirts", parentSlug: "mens-fashion", slug: "shirts" },
    { name: "T-Shirts", parentSlug: "mens-fashion", slug: "t-shirts" },
    { name: "Jeans", parentSlug: "mens-fashion", slug: "jeans" },
    {
      name: "Suits & Blazers",
      parentSlug: "mens-fashion",
      slug: "suits-blazers",
    },
    { name: "Men's Shoes", parentSlug: "mens-fashion", slug: "mens-shoes" },
    {
      name: "Men's Activewear",
      parentSlug: "mens-fashion",
      slug: "mens-activewear",
    },
    {
      name: "Men's Accessories",
      parentSlug: "mens-fashion",
      slug: "mens-accessories",
    },

    // Level 3: Kids & Babies Subcategories
    { name: "Baby Clothing", parentSlug: "kids-babies", slug: "baby-clothing" },
    {
      name: "Baby Boy Clothing",
      parentSlug: "kids-babies",
      slug: "baby-boy-clothing",
    },
    {
      name: "Baby Girl Clothing",
      parentSlug: "kids-babies",
      slug: "baby-girl-clothing",
    },
    { name: "Kids Clothing", parentSlug: "kids-babies", slug: "kids-clothing" },
    { name: "Kids Shoes", parentSlug: "kids-babies", slug: "kids-shoes" },
    { name: "Baby Gear", parentSlug: "kids-babies", slug: "baby-gear" },
    { name: "Strollers", parentSlug: "kids-babies", slug: "strollers" },
    { name: "Car Seats", parentSlug: "kids-babies", slug: "car-seats" },
    { name: "Toys", parentSlug: "kids-babies", slug: "toys" },

    // Level 3: Fashion Accessories Subcategories
    { name: "Belts", parentSlug: "fashion-accessories", slug: "belts" },
    {
      name: "Hats & Caps",
      parentSlug: "fashion-accessories",
      slug: "hats-caps",
    },
    {
      name: "Sunglasses",
      parentSlug: "fashion-accessories",
      slug: "sunglasses",
    },
    {
      name: "Scarves & Shawls",
      parentSlug: "fashion-accessories",
      slug: "scarves-shawls",
    },
    {
      name: "Wallets & Purses",
      parentSlug: "fashion-accessories",
      slug: "wallets-purses",
    },
    { name: "Gloves", parentSlug: "fashion-accessories", slug: "gloves" },

    // Level 3: Plus Size Fashion Subcategories
    {
      name: "Plus Size Women",
      parentSlug: "plus-size-fashion",
      slug: "plus-size-women",
    },
    {
      name: "Plus Size Men",
      parentSlug: "plus-size-fashion",
      slug: "plus-size-men",
    },

    // ============================================
    // LEVEL 1: HOME & LIVING (Department)
    // ============================================
    {
      name: "Home & Living",
      description: "Furniture, appliances and home essentials",
      slug: "home-living",
    },

    // Level 2: Home & Living Categories
    {
      name: "Large Appliances",
      parentSlug: "home-living",
      slug: "large-appliances",
    },
    {
      name: "Small Appliances",
      parentSlug: "home-living",
      slug: "small-appliances",
    },
    { name: "Furniture", parentSlug: "home-living", slug: "furniture" },
    { name: "Home Decor", parentSlug: "home-living", slug: "home-decor" },
    {
      name: "Kitchen & Dining",
      parentSlug: "home-living",
      slug: "kitchen-dining",
    },
    { name: "Bedding & Bath", parentSlug: "home-living", slug: "bedding-bath" },
    {
      name: "Storage & Organization",
      parentSlug: "home-living",
      slug: "storage-organization",
    },
    {
      name: "Garden & Outdoor",
      parentSlug: "home-living",
      slug: "garden-outdoor",
    },

    // Level 3: Large Appliances Subcategories
    {
      name: "Refrigerators & Freezers",
      parentSlug: "large-appliances",
      slug: "refrigerators-freezers",
    },
    {
      name: "Washing Machines",
      parentSlug: "large-appliances",
      slug: "washing-machines",
    },
    { name: "Dryers", parentSlug: "large-appliances", slug: "dryers" },
    {
      name: "Air Conditioners",
      parentSlug: "large-appliances",
      slug: "air-conditioners",
    },
    {
      name: "Dishwashers",
      parentSlug: "large-appliances",
      slug: "dishwashers",
    },
    {
      name: "Water Heaters",
      parentSlug: "large-appliances",
      slug: "water-heaters",
    },
    { name: "Generators", parentSlug: "large-appliances", slug: "generators" },

    // Level 3: Small Appliances Subcategories
    { name: "Blenders", parentSlug: "small-appliances", slug: "blenders" },
    { name: "Microwaves", parentSlug: "small-appliances", slug: "microwaves" },
    {
      name: "Toasters & Ovens",
      parentSlug: "small-appliances",
      slug: "toasters-ovens",
    },
    {
      name: "Coffee Makers",
      parentSlug: "small-appliances",
      slug: "coffee-makers",
    },
    {
      name: "Rice Cookers",
      parentSlug: "small-appliances",
      slug: "rice-cookers",
    },
    { name: "Air Fryers", parentSlug: "small-appliances", slug: "air-fryers" },
    {
      name: "Vacuum Cleaners",
      parentSlug: "small-appliances",
      slug: "vacuum-cleaners",
    },
    {
      name: "Irons & Steamers",
      parentSlug: "small-appliances",
      slug: "irons-steamers",
    },

    // Level 3: Furniture Subcategories
    { name: "Sofas & Couches", parentSlug: "furniture", slug: "sofas-couches" },
    { name: "Dining Tables", parentSlug: "furniture", slug: "dining-tables" },
    { name: "Dining Chairs", parentSlug: "furniture", slug: "dining-chairs" },
    { name: "Office Chairs", parentSlug: "furniture", slug: "office-chairs" },
    { name: "Office Desks", parentSlug: "furniture", slug: "office-desks" },
    { name: "Beds & Frames", parentSlug: "furniture", slug: "beds-frames" },
    { name: "Mattresses", parentSlug: "furniture", slug: "mattresses" },
    { name: "Wardrobes", parentSlug: "furniture", slug: "wardrobes" },
    { name: "Bookcases", parentSlug: "furniture", slug: "bookcases" },

    // Level 3: Home Decor Subcategories
    { name: "Lighting", parentSlug: "home-decor", slug: "lighting" },
    { name: "Wall Art", parentSlug: "home-decor", slug: "wall-art" },
    { name: "Mirrors", parentSlug: "home-decor", slug: "mirrors" },
    { name: "Rugs & Carpets", parentSlug: "home-decor", slug: "rugs-carpets" },
    {
      name: "Curtains & Blinds",
      parentSlug: "home-decor",
      slug: "curtains-blinds",
    },
    {
      name: "Cushions & Throws",
      parentSlug: "home-decor",
      slug: "cushions-throws",
    },
    {
      name: "Vases & Planters",
      parentSlug: "home-decor",
      slug: "vases-planters",
    },
    {
      name: "Candles & Holders",
      parentSlug: "home-decor",
      slug: "candles-holders",
    },

    // Level 3: Kitchen & Dining Subcategories
    { name: "Cookware", parentSlug: "kitchen-dining", slug: "cookware" },
    { name: "Dinnerware", parentSlug: "kitchen-dining", slug: "dinnerware" },
    { name: "Cutlery", parentSlug: "kitchen-dining", slug: "cutlery" },
    {
      name: "Kitchen Utensils",
      parentSlug: "kitchen-dining",
      slug: "kitchen-utensils",
    },
    {
      name: "Food Storage",
      parentSlug: "kitchen-dining",
      slug: "food-storage",
    },
    { name: "Bakeware", parentSlug: "kitchen-dining", slug: "bakeware" },

    // Level 3: Bedding & Bath Subcategories
    { name: "Bed Sheets", parentSlug: "bedding-bath", slug: "bed-sheets" },
    {
      name: "Comforters & Duvets",
      parentSlug: "bedding-bath",
      slug: "comforters-duvets",
    },
    { name: "Pillows", parentSlug: "bedding-bath", slug: "pillows" },
    { name: "Towels", parentSlug: "bedding-bath", slug: "towels" },
    { name: "Bath Mats", parentSlug: "bedding-bath", slug: "bath-mats" },
    {
      name: "Shower Curtains",
      parentSlug: "bedding-bath",
      slug: "shower-curtains",
    },

    // Level 3: Storage & Organization Subcategories
    {
      name: "Storage Boxes",
      parentSlug: "storage-organization",
      slug: "storage-boxes",
    },
    {
      name: "Closet Organizers",
      parentSlug: "storage-organization",
      slug: "closet-organizers",
    },
    {
      name: "Laundry Baskets",
      parentSlug: "storage-organization",
      slug: "laundry-baskets",
    },
    {
      name: "Hooks & Hangers",
      parentSlug: "storage-organization",
      slug: "hooks-hangers",
    },

    // Level 3: Garden & Outdoor Subcategories
    {
      name: "Gardening Tools",
      parentSlug: "garden-outdoor",
      slug: "gardening-tools",
    },
    {
      name: "Outdoor Furniture",
      parentSlug: "garden-outdoor",
      slug: "outdoor-furniture",
    },
    { name: "BBQ & Grills", parentSlug: "garden-outdoor", slug: "bbq-grills" },

    // ============================================
    // LEVEL 1: BEAUTY & PERSONAL CARE (Department)
    // ============================================
    {
      name: "Beauty & Personal Care",
      description: "Cosmetics, skincare and personal care products",
      slug: "beauty-personal-care",
    },

    // Level 2: Beauty & Personal Care Categories
    {
      name: "Hair Care & Accessories",
      parentSlug: "beauty-personal-care",
      slug: "hair-care-accessories",
    },
    { name: "Skincare", parentSlug: "beauty-personal-care", slug: "skincare" },
    {
      name: "Makeup & Cosmetics",
      parentSlug: "beauty-personal-care",
      slug: "makeup-cosmetics",
    },
    {
      name: "Fragrances",
      parentSlug: "beauty-personal-care",
      slug: "fragrances",
    },
    {
      name: "Health & Supplements",
      parentSlug: "beauty-personal-care",
      slug: "health-supplements",
    },
    {
      name: "Personal Care",
      parentSlug: "beauty-personal-care",
      slug: "personal-care",
    },

    // Level 3: Hair Care & Accessories Subcategories
    {
      name: "Hair Care Products",
      parentSlug: "hair-care-accessories",
      slug: "hair-care-products",
    },
    {
      name: "Wigs & Extensions",
      parentSlug: "hair-care-accessories",
      slug: "wigs-extensions",
    },
    {
      name: "Hair Styling Tools",
      parentSlug: "hair-care-accessories",
      slug: "hair-styling-tools",
    },
    {
      name: "Hair Accessories",
      parentSlug: "hair-care-accessories",
      slug: "hair-accessories",
    },

    // Level 3: Skincare Subcategories
    { name: "Face Care", parentSlug: "skincare", slug: "face-care" },
    { name: "Body Care", parentSlug: "skincare", slug: "body-care" },
    { name: "Sunscreen", parentSlug: "skincare", slug: "sunscreen" },
    { name: "Anti-Aging", parentSlug: "skincare", slug: "anti-aging" },

    // Level 3: Makeup & Cosmetics Subcategories
    {
      name: "Face Makeup",
      parentSlug: "makeup-cosmetics",
      slug: "face-makeup",
    },
    { name: "Eye Makeup", parentSlug: "makeup-cosmetics", slug: "eye-makeup" },
    { name: "Lip Makeup", parentSlug: "makeup-cosmetics", slug: "lip-makeup" },
    {
      name: "Makeup Tools",
      parentSlug: "makeup-cosmetics",
      slug: "makeup-tools",
    },

    // Level 3: Fragrances Subcategories
    { name: "Perfumes", parentSlug: "fragrances", slug: "perfumes" },
    { name: "Colognes", parentSlug: "fragrances", slug: "colognes" },
    { name: "Body Sprays", parentSlug: "fragrances", slug: "body-sprays" },
    { name: "Deodorants", parentSlug: "fragrances", slug: "deodorants" },

    // Level 3: Health & Supplements Subcategories
    {
      name: "Vitamins & Minerals",
      parentSlug: "health-supplements",
      slug: "vitamins-minerals",
    },
    {
      name: "Fitness Supplements",
      parentSlug: "health-supplements",
      slug: "fitness-supplements",
    },
    {
      name: "Herbal Supplements",
      parentSlug: "health-supplements",
      slug: "herbal-supplements",
    },
    {
      name: "Personal Health",
      parentSlug: "health-supplements",
      slug: "personal-health",
    },

    // Level 3: Personal Care Subcategories
    { name: "Oral Care", parentSlug: "personal-care", slug: "oral-care" },
    { name: "Bath & Shower", parentSlug: "personal-care", slug: "bath-shower" },
    {
      name: "Men's Grooming",
      parentSlug: "personal-care",
      slug: "mens-grooming",
    },
    {
      name: "Shaving & Hair Removal",
      parentSlug: "personal-care",
      slug: "shaving-hair-removal",
    },

    // ============================================
    // LEVEL 1: SPORTS & OUTDOORS (Department)
    // ============================================
    {
      name: "Sports & Outdoors",
      description: "Fitness equipment and outdoor gear",
      slug: "sports-outdoors",
    },

    // Level 2: Sports & Outdoors Categories
    {
      name: "Sports & Fitness",
      parentSlug: "sports-outdoors",
      slug: "sports-fitness",
    },
    {
      name: "Outdoor & Recreation",
      parentSlug: "sports-outdoors",
      slug: "outdoor-recreation",
    },
    { name: "Sportswear", parentSlug: "sports-outdoors", slug: "sportswear" },
    { name: "Team Sports", parentSlug: "sports-outdoors", slug: "team-sports" },

    // Level 3: Sports & Fitness Subcategories
    {
      name: "Exercise Equipment",
      parentSlug: "sports-fitness",
      slug: "exercise-equipment",
    },
    {
      name: "Yoga & Pilates",
      parentSlug: "sports-fitness",
      slug: "yoga-pilates",
    },
    {
      name: "Weights & Dumbbells",
      parentSlug: "sports-fitness",
      slug: "weights-dumbbells",
    },
    {
      name: "Treadmills & Bikes",
      parentSlug: "sports-fitness",
      slug: "treadmills-bikes",
    },
    {
      name: "Sports Accessories",
      parentSlug: "sports-fitness",
      slug: "sports-accessories",
    },

    // Level 3: Outdoor & Recreation Subcategories
    {
      name: "Camping & Hiking",
      parentSlug: "outdoor-recreation",
      slug: "camping-hiking",
    },
    { name: "Cycling", parentSlug: "outdoor-recreation", slug: "cycling" },
    { name: "Fishing", parentSlug: "outdoor-recreation", slug: "fishing" },
    {
      name: "Water Sports",
      parentSlug: "outdoor-recreation",
      slug: "water-sports",
    },

    // Level 3: Sportswear Subcategories
    {
      name: "Men's Sportswear",
      parentSlug: "sportswear",
      slug: "mens-sportswear",
    },
    {
      name: "Women's Sportswear",
      parentSlug: "sportswear",
      slug: "womens-sportswear",
    },
    { name: "Sports Shoes", parentSlug: "sportswear", slug: "sports-shoes" },
    { name: "Swimwear", parentSlug: "sportswear", slug: "swimwear" },

    // Level 3: Team Sports Subcategories
    {
      name: "Football & Soccer",
      parentSlug: "team-sports",
      slug: "football-soccer",
    },
    { name: "Basketball", parentSlug: "team-sports", slug: "basketball" },
    {
      name: "Tennis & Badminton",
      parentSlug: "team-sports",
      slug: "tennis-badminton",
    },
    { name: "Volleyball", parentSlug: "team-sports", slug: "volleyball" },

    // ============================================
    // LEVEL 1: JEWELRY & WATCHES (Department)
    // ============================================
    {
      name: "Jewelry & Watches",
      description: "Fashion and luxury jewelry, watches",
      slug: "jewelry-watches",
    },

    // Level 2: Jewelry & Watches Categories
    {
      name: "Women's Jewelry",
      parentSlug: "jewelry-watches",
      slug: "womens-jewelry",
    },
    {
      name: "Men's Jewelry",
      parentSlug: "jewelry-watches",
      slug: "mens-jewelry",
    },
    { name: "Watches", parentSlug: "jewelry-watches", slug: "watches" },
    {
      name: "Fashion Jewelry",
      parentSlug: "jewelry-watches",
      slug: "fashion-jewelry",
    },

    // Level 3: Women's Jewelry Subcategories
    {
      name: "Necklaces & Pendants",
      parentSlug: "womens-jewelry",
      slug: "necklaces-pendants",
    },
    { name: "Earrings", parentSlug: "womens-jewelry", slug: "earrings" },
    {
      name: "Bracelets & Bangles",
      parentSlug: "womens-jewelry",
      slug: "bracelets-bangles",
    },
    { name: "Rings", parentSlug: "womens-jewelry", slug: "rings" },
    {
      name: "Jewelry Sets",
      parentSlug: "womens-jewelry",
      slug: "jewelry-sets",
    },

    // Level 3: Men's Jewelry Subcategories
    {
      name: "Men's Bracelets",
      parentSlug: "mens-jewelry",
      slug: "mens-bracelets",
    },
    { name: "Men's Rings", parentSlug: "mens-jewelry", slug: "mens-rings" },
    {
      name: "Men's Necklaces",
      parentSlug: "mens-jewelry",
      slug: "mens-necklaces",
    },
    { name: "Cufflinks", parentSlug: "mens-jewelry", slug: "cufflinks" },

    // Level 3: Watches Subcategories
    { name: "Women's Watches", parentSlug: "watches", slug: "womens-watches" },
    { name: "Men's Watches", parentSlug: "watches", slug: "mens-watches" },
    { name: "Luxury Watches", parentSlug: "watches", slug: "luxury-watches" },
    { name: "Sport Watches", parentSlug: "watches", slug: "sport-watches" },

    // Level 3: Fashion Jewelry Subcategories
    {
      name: "Costume Jewelry",
      parentSlug: "fashion-jewelry",
      slug: "costume-jewelry",
    },
    {
      name: "Body Jewelry",
      parentSlug: "fashion-jewelry",
      slug: "body-jewelry",
    },

    // ============================================
    // LEVEL 1: AUTOMOBILES & PARTS (Department)
    // ============================================
    {
      name: "Automobiles & Parts",
      description: "Vehicles for sale, car accessories, parts and maintenance",
      slug: "automobiles-parts",
    },

    // Level 2: Automobiles & Parts Categories
    {
      name: "Vehicles for Sale",
      parentSlug: "automobiles-parts",
      slug: "vehicles-for-sale",
    },
    {
      name: "Car Accessories",
      parentSlug: "automobiles-parts",
      slug: "car-accessories",
    },
    { name: "Car Parts", parentSlug: "automobiles-parts", slug: "car-parts" },
    {
      name: "Car Care & Maintenance",
      parentSlug: "automobiles-parts",
      slug: "car-care-maintenance",
    },
    {
      name: "Motorcycles & Accessories",
      parentSlug: "automobiles-parts",
      slug: "motorcycles-accessories",
    },

    // Level 3: Vehicles for Sale Subcategories
    { name: "New Cars", parentSlug: "vehicles-for-sale", slug: "new-cars" },
    { name: "Used Cars", parentSlug: "vehicles-for-sale", slug: "used-cars" },
    {
      name: "Luxury & Sports Cars",
      parentSlug: "vehicles-for-sale",
      slug: "luxury-sports-cars",
    },
    {
      name: "SUVs & Trucks",
      parentSlug: "vehicles-for-sale",
      slug: "suvs-trucks",
    },
    {
      name: "Vans & Commercial Vehicles",
      parentSlug: "vehicles-for-sale",
      slug: "vans-commercial-vehicles",
    },
    {
      name: "Electric & Hybrid Vehicles",
      parentSlug: "vehicles-for-sale",
      slug: "electric-hybrid-vehicles",
    },

    // Level 3: Car Accessories Subcategories
    {
      name: "Interior Accessories",
      parentSlug: "car-accessories",
      slug: "interior-accessories",
    },
    {
      name: "Exterior Accessories",
      parentSlug: "car-accessories",
      slug: "exterior-accessories",
    },
    {
      name: "Car Electronics",
      parentSlug: "car-accessories",
      slug: "car-electronics",
    },
    { name: "Car Safety", parentSlug: "car-accessories", slug: "car-safety" },
    {
      name: "Car Audio & Video",
      parentSlug: "car-accessories",
      slug: "car-audio-video",
    },

    // Level 3: Car Parts Subcategories
    { name: "Engine Parts", parentSlug: "car-parts", slug: "engine-parts" },
    { name: "Brake Parts", parentSlug: "car-parts", slug: "brake-parts" },
    { name: "Batteries", parentSlug: "car-parts", slug: "batteries" },
    { name: "Lights & Bulbs", parentSlug: "car-parts", slug: "lights-bulbs" },
    { name: "Tires & Wheels", parentSlug: "car-parts", slug: "tires-wheels" },
    {
      name: "Transmission Parts",
      parentSlug: "car-parts",
      slug: "transmission-parts",
    },

    // Level 3: Car Care & Maintenance Subcategories
    {
      name: "Car Wash Supplies",
      parentSlug: "car-care-maintenance",
      slug: "car-wash-supplies",
    },
    {
      name: "Motor Oils",
      parentSlug: "car-care-maintenance",
      slug: "motor-oils",
    },
    {
      name: "Cleaning Tools",
      parentSlug: "car-care-maintenance",
      slug: "cleaning-tools",
    },
    {
      name: "Polishes & Waxes",
      parentSlug: "car-care-maintenance",
      slug: "polishes-waxes",
    },

    // Level 3: Motorcycles & Accessories Subcategories
    {
      name: "Motorcycles for Sale",
      parentSlug: "motorcycles-accessories",
      slug: "motorcycles-for-sale",
    },
    { name: "Helmets", parentSlug: "motorcycles-accessories", slug: "helmets" },
    {
      name: "Riding Gear",
      parentSlug: "motorcycles-accessories",
      slug: "riding-gear",
    },
    {
      name: "Motorcycle Parts",
      parentSlug: "motorcycles-accessories",
      slug: "motorcycle-parts",
    },
    {
      name: "Motorcycle Accessories",
      parentSlug: "motorcycles-accessories",
      slug: "motorcycle-accessories",
    },

    {
      name: "Automobiles & Parts",
      description: "Car accessories, parts and maintenance",
      slug: "automobiles-parts",
    },

    // Level 2: Automobiles & Parts Categories
    {
      name: "Car Accessories",
      parentSlug: "automobiles-parts",
      slug: "car-accessories",
    },
    { name: "Car Parts", parentSlug: "automobiles-parts", slug: "car-parts" },
    {
      name: "Car Care & Maintenance",
      parentSlug: "automobiles-parts",
      slug: "car-care-maintenance",
    },
    {
      name: "Motorcycle Accessories",
      parentSlug: "automobiles-parts",
      slug: "motorcycle-accessories",
    },

    // Level 3: Car Accessories Subcategories
    {
      name: "Interior Accessories",
      parentSlug: "car-accessories",
      slug: "interior-accessories",
    },
    {
      name: "Exterior Accessories",
      parentSlug: "car-accessories",
      slug: "exterior-accessories",
    },
    {
      name: "Car Electronics",
      parentSlug: "car-accessories",
      slug: "car-electronics",
    },
    { name: "Car Safety", parentSlug: "car-accessories", slug: "car-safety" },

    // Level 3: Car Parts Subcategories
    { name: "Engine Parts", parentSlug: "car-parts", slug: "engine-parts" },
    { name: "Brake Parts", parentSlug: "car-parts", slug: "brake-parts" },
    { name: "Batteries", parentSlug: "car-parts", slug: "batteries" },
    { name: "Lights & Bulbs", parentSlug: "car-parts", slug: "lights-bulbs" },

    // Level 3: Car Care & Maintenance Subcategories
    {
      name: "Car Wash Supplies",
      parentSlug: "car-care-maintenance",
      slug: "car-wash-supplies",
    },
    {
      name: "Motor Oils",
      parentSlug: "car-care-maintenance",
      slug: "motor-oils",
    },
    {
      name: "Cleaning Tools",
      parentSlug: "car-care-maintenance",
      slug: "cleaning-tools",
    },

    // Level 3: Motorcycle Accessories Subcategories
    { name: "Helmets", parentSlug: "motorcycle-accessories", slug: "helmets" },
    {
      name: "Riding Gear",
      parentSlug: "motorcycle-accessories",
      slug: "riding-gear",
    },
    {
      name: "Motorcycle Parts",
      parentSlug: "motorcycle-accessories",
      slug: "motorcycle-parts",
    },

    // ============================================
    // LEVEL 1: AGRICULTURE & FARMING (Department)
    // ============================================
    {
      name: "Agriculture & Farming",
      description: "Farming tools, equipment and supplies",
      slug: "agriculture-farming",
    },

    // Level 2: Agriculture & Farming Categories
    {
      name: "Farming Tools & Equipment",
      parentSlug: "agriculture-farming",
      slug: "farming-tools-equipment",
    },
    {
      name: "Seeds & Plants",
      parentSlug: "agriculture-farming",
      slug: "seeds-plants",
    },
    {
      name: "Fertilizers & Pesticides",
      parentSlug: "agriculture-farming",
      slug: "fertilizers-pesticides",
    },
    {
      name: "Animal Husbandry",
      parentSlug: "agriculture-farming",
      slug: "animal-husbandry",
    },

    // Level 3: Farming Tools & Equipment Subcategories
    {
      name: "Hand Tools",
      parentSlug: "farming-tools-equipment",
      slug: "hand-tools",
    },
    {
      name: "Power Tools",
      parentSlug: "farming-tools-equipment",
      slug: "power-tools",
    },
    {
      name: "Irrigation Systems",
      parentSlug: "farming-tools-equipment",
      slug: "irrigation-systems",
    },
    {
      name: "Wheelbarrows & Carts",
      parentSlug: "farming-tools-equipment",
      slug: "wheelbarrows-carts",
    },

    // Level 3: Seeds & Plants Subcategories
    {
      name: "Vegetable Seeds",
      parentSlug: "seeds-plants",
      slug: "vegetable-seeds",
    },
    { name: "Fruit Seeds", parentSlug: "seeds-plants", slug: "fruit-seeds" },
    { name: "Flower Seeds", parentSlug: "seeds-plants", slug: "flower-seeds" },
    {
      name: "Seedlings & Saplings",
      parentSlug: "seeds-plants",
      slug: "seedlings-saplings",
    },

    // Level 3: Fertilizers & Pesticides Subcategories
    {
      name: "Organic Fertilizers",
      parentSlug: "fertilizers-pesticides",
      slug: "organic-fertilizers",
    },
    {
      name: "Chemical Fertilizers",
      parentSlug: "fertilizers-pesticides",
      slug: "chemical-fertilizers",
    },
    {
      name: "Pesticides",
      parentSlug: "fertilizers-pesticides",
      slug: "pesticides",
    },
    {
      name: "Herbicides",
      parentSlug: "fertilizers-pesticides",
      slug: "herbicides",
    },

    // Level 3: Animal Husbandry Subcategories
    {
      name: "Poultry Supplies",
      parentSlug: "animal-husbandry",
      slug: "poultry-supplies",
    },
    {
      name: "Livestock Feed",
      parentSlug: "animal-husbandry",
      slug: "livestock-feed",
    },
    {
      name: "Animal Health Products",
      parentSlug: "animal-husbandry",
      slug: "animal-health-products",
    },

    // ============================================
    // LEVEL 1: BAGS & LUGGAGE (Department)
    // ============================================
    {
      name: "Bags & Luggage",
      description: "Backpacks, travel bags and luggage",
      slug: "bags-luggage",
    },

    // Level 2: Bags & Luggage Categories
    { name: "Backpacks", parentSlug: "bags-luggage", slug: "backpacks" },
    {
      name: "Travel Luggage",
      parentSlug: "bags-luggage",
      slug: "travel-luggage",
    },
    {
      name: "Handbags & Purses",
      parentSlug: "bags-luggage",
      slug: "handbags-purses",
    },
    {
      name: "Professional Bags",
      parentSlug: "bags-luggage",
      slug: "professional-bags",
    },

    // Level 3: Backpacks Subcategories
    {
      name: "School Backpacks",
      parentSlug: "backpacks",
      slug: "school-backpacks",
    },
    {
      name: "Laptop Backpacks",
      parentSlug: "backpacks",
      slug: "laptop-backpacks",
    },
    {
      name: "Travel Backpacks",
      parentSlug: "backpacks",
      slug: "travel-backpacks",
    },
    {
      name: "Hiking Backpacks",
      parentSlug: "backpacks",
      slug: "hiking-backpacks",
    },

    // Level 3: Travel Luggage Subcategories
    {
      name: "Carry-On Luggage",
      parentSlug: "travel-luggage",
      slug: "carry-on-luggage",
    },
    {
      name: "Checked Luggage",
      parentSlug: "travel-luggage",
      slug: "checked-luggage",
    },
    {
      name: "Luggage Sets",
      parentSlug: "travel-luggage",
      slug: "luggage-sets",
    },
    { name: "Duffel Bags", parentSlug: "travel-luggage", slug: "duffel-bags" },

    // Level 3: Handbags & Purses Subcategories
    {
      name: "Shoulder Bags",
      parentSlug: "handbags-purses",
      slug: "shoulder-bags",
    },
    {
      name: "Crossbody Bags",
      parentSlug: "handbags-purses",
      slug: "crossbody-bags",
    },
    { name: "Clutches", parentSlug: "handbags-purses", slug: "clutches" },
    { name: "Tote Bags", parentSlug: "handbags-purses", slug: "tote-bags" },

    // Level 3: Professional Bags Subcategories
    {
      name: "Laptop Bags",
      parentSlug: "professional-bags",
      slug: "laptop-bags",
    },
    { name: "Briefcases", parentSlug: "professional-bags", slug: "briefcases" },
    {
      name: "Messenger Bags",
      parentSlug: "professional-bags",
      slug: "messenger-bags",
    },

    // ============================================
    // LEVEL 1: BOOKS, MEDIA & ENTERTAINMENT (Department)
    // ============================================
    {
      name: "Books, Media & Entertainment",
      description: "Books, movies, music and instruments",
      slug: "books-media-entertainment",
    },

    // Level 2: Books, Media & Entertainment Categories
    { name: "Books", parentSlug: "books-media-entertainment", slug: "books" },
    {
      name: "Movies & Music",
      parentSlug: "books-media-entertainment",
      slug: "movies-music",
    },
    {
      name: "Musical Instruments",
      parentSlug: "books-media-entertainment",
      slug: "musical-instruments",
    },

    // Level 3: Books Subcategories
    { name: "Fiction", parentSlug: "books", slug: "fiction" },
    { name: "Non-Fiction", parentSlug: "books", slug: "non-fiction" },
    {
      name: "Educational Books",
      parentSlug: "books",
      slug: "educational-books",
    },
    { name: "Children's Books", parentSlug: "books", slug: "childrens-books" },
    { name: "Religious Books", parentSlug: "books", slug: "religious-books" },

    // Level 3: Movies & Music Subcategories
    {
      name: "DVDs & Blu-rays",
      parentSlug: "movies-music",
      slug: "dvds-blu-rays",
    },
    { name: "Music CDs", parentSlug: "movies-music", slug: "music-cds" },
    {
      name: "Vinyl Records",
      parentSlug: "movies-music",
      slug: "vinyl-records",
    },

    // Level 3: Musical Instruments Subcategories
    { name: "Guitars", parentSlug: "musical-instruments", slug: "guitars" },
    {
      name: "Keyboards & Pianos",
      parentSlug: "musical-instruments",
      slug: "keyboards-pianos",
    },
    {
      name: "Drums & Percussion",
      parentSlug: "musical-instruments",
      slug: "drums-percussion",
    },
    {
      name: "Instrument Accessories",
      parentSlug: "musical-instruments",
      slug: "instrument-accessories",
    },

    // ============================================
    // LEVEL 1: OFFICE & SCHOOL SUPPLIES (Department)
    // ============================================
    {
      name: "Office & School Supplies",
      description: "Stationery, office furniture and supplies",
      slug: "office-school-supplies",
    },

    // Level 2: Office & School Supplies Categories
    {
      name: "Office Furniture",
      parentSlug: "office-school-supplies",
      slug: "office-furniture",
    },
    {
      name: "Stationery",
      parentSlug: "office-school-supplies",
      slug: "stationery",
    },
    {
      name: "Office Electronics",
      parentSlug: "office-school-supplies",
      slug: "office-electronics",
    },
    {
      name: "School Supplies",
      parentSlug: "office-school-supplies",
      slug: "school-supplies",
    },

    // Level 3: Office Furniture Subcategories
    {
      name: "Office Desks",
      parentSlug: "office-furniture",
      slug: "office-desks",
    },
    {
      name: "Office Chairs",
      parentSlug: "office-furniture",
      slug: "office-chairs",
    },
    {
      name: "Filing Cabinets",
      parentSlug: "office-furniture",
      slug: "filing-cabinets",
    },
    {
      name: "Office Storage",
      parentSlug: "office-furniture",
      slug: "office-storage",
    },

    // Level 3: Stationery Subcategories
    { name: "Pens & Pencils", parentSlug: "stationery", slug: "pens-pencils" },
    { name: "Notebooks", parentSlug: "stationery", slug: "notebooks" },
    {
      name: "Folders & Binders",
      parentSlug: "stationery",
      slug: "folders-binders",
    },
    {
      name: "Paper Products",
      parentSlug: "stationery",
      slug: "paper-products",
    },

    // Level 3: Office Electronics Subcategories
    {
      name: "Printers & Scanners",
      parentSlug: "office-electronics",
      slug: "printers-scanners",
    },
    {
      name: "Calculators",
      parentSlug: "office-electronics",
      slug: "calculators",
    },
    {
      name: "Laminators",
      parentSlug: "office-electronics",
      slug: "laminators",
    },
    { name: "Shredders", parentSlug: "office-electronics", slug: "shredders" },

    // Level 3: School Supplies Subcategories
    {
      name: "School Backpacks",
      parentSlug: "school-supplies",
      slug: "school-backpacks",
    },
    { name: "Lunch Boxes", parentSlug: "school-supplies", slug: "lunch-boxes" },
    {
      name: "Art Supplies",
      parentSlug: "school-supplies",
      slug: "art-supplies",
    },
    {
      name: "Educational Materials",
      parentSlug: "school-supplies",
      slug: "educational-materials",
    },

    // ============================================
    // LEVEL 1: PET SUPPLIES (Department)
    // ============================================
    {
      name: "Pet Supplies",
      description: "Food and accessories for pets",
      slug: "pet-supplies",
    },

    // Level 2: Pet Supplies Categories
    { name: "Dog Supplies", parentSlug: "pet-supplies", slug: "dog-supplies" },
    { name: "Cat Supplies", parentSlug: "pet-supplies", slug: "cat-supplies" },
    { name: "Other Pets", parentSlug: "pet-supplies", slug: "other-pets" },

    // Level 3: Dog Supplies Subcategories
    { name: "Dog Food", parentSlug: "dog-supplies", slug: "dog-food" },
    { name: "Dog Toys", parentSlug: "dog-supplies", slug: "dog-toys" },
    {
      name: "Dog Accessories",
      parentSlug: "dog-supplies",
      slug: "dog-accessories",
    },
    { name: "Dog Grooming", parentSlug: "dog-supplies", slug: "dog-grooming" },

    // Level 3: Cat Supplies Subcategories
    { name: "Cat Food", parentSlug: "cat-supplies", slug: "cat-food" },
    { name: "Cat Litter", parentSlug: "cat-supplies", slug: "cat-litter" },
    { name: "Cat Toys", parentSlug: "cat-supplies", slug: "cat-toys" },
    {
      name: "Cat Accessories",
      parentSlug: "cat-supplies",
      slug: "cat-accessories",
    },

    // Level 3: Other Pets Subcategories
    { name: "Bird Supplies", parentSlug: "other-pets", slug: "bird-supplies" },
    {
      name: "Fish & Aquarium",
      parentSlug: "other-pets",
      slug: "fish-aquarium",
    },
    {
      name: "Small Animal Supplies",
      parentSlug: "other-pets",
      slug: "small-animal-supplies",
    },

    // ============================================
    // LEVEL 1: FOOD & BEVERAGES (Department)
    // ============================================
    {
      name: "Food & Beverages",
      description: "Groceries, snacks and beverages",
      slug: "food-beverages",
    },

    // Level 2: Food & Beverages Categories
    { name: "Groceries", parentSlug: "food-beverages", slug: "groceries" },
    {
      name: "Snacks & Treats",
      parentSlug: "food-beverages",
      slug: "snacks-treats",
    },
    { name: "Beverages", parentSlug: "food-beverages", slug: "beverages" },
    {
      name: "Baby Food & Formula",
      parentSlug: "food-beverages",
      slug: "baby-food-formula",
    },

    // Level 3: Groceries Subcategories
    { name: "Rice & Grains", parentSlug: "groceries", slug: "rice-grains" },
    { name: "Cooking Oil", parentSlug: "groceries", slug: "cooking-oil" },
    { name: "Pasta & Noodles", parentSlug: "groceries", slug: "pasta-noodles" },
    { name: "Canned Foods", parentSlug: "groceries", slug: "canned-foods" },

    // Level 3: Snacks & Treats Subcategories
    {
      name: "Chips & Crisps",
      parentSlug: "snacks-treats",
      slug: "chips-crisps",
    },
    {
      name: "Cookies & Biscuits",
      parentSlug: "snacks-treats",
      slug: "cookies-biscuits",
    },
    {
      name: "Candy & Chocolate",
      parentSlug: "snacks-treats",
      slug: "candy-chocolate",
    },
    {
      name: "Nuts & Dried Fruits",
      parentSlug: "snacks-treats",
      slug: "nuts-dried-fruits",
    },

    // Level 3: Beverages Subcategories
    { name: "Soft Drinks", parentSlug: "beverages", slug: "soft-drinks" },
    { name: "Juices", parentSlug: "beverages", slug: "juices" },
    { name: "Tea & Coffee", parentSlug: "beverages", slug: "tea-coffee" },
    { name: "Energy Drinks", parentSlug: "beverages", slug: "energy-drinks" },

    // Level 3: Baby Food & Formula Subcategories
    {
      name: "Infant Formula",
      parentSlug: "baby-food-formula",
      slug: "infant-formula",
    },
    {
      name: "Baby Cereals",
      parentSlug: "baby-food-formula",
      slug: "baby-cereals",
    },
    {
      name: "Baby Snacks",
      parentSlug: "baby-food-formula",
      slug: "baby-snacks",
    },

    // ============================================
    // LEVEL 1: INDUSTRIAL & SCIENTIFIC (Department)
    // ============================================
    {
      name: "Industrial & Scientific",
      description: "Professional tools and equipment",
      slug: "industrial-scientific",
    },

    // Level 2: Industrial & Scientific Categories
    {
      name: "Power Tools",
      parentSlug: "industrial-scientific",
      slug: "power-tools",
    },
    {
      name: "Hand Tools",
      parentSlug: "industrial-scientific",
      slug: "hand-tools",
    },
    {
      name: "Safety Equipment",
      parentSlug: "industrial-scientific",
      slug: "safety-equipment",
    },
    {
      name: "Electrical Equipment",
      parentSlug: "industrial-scientific",
      slug: "electrical-equipment",
    },

    // Level 3: Power Tools Subcategories
    { name: "Drills", parentSlug: "power-tools", slug: "drills" },
    { name: "Saws", parentSlug: "power-tools", slug: "saws" },
    { name: "Sanders", parentSlug: "power-tools", slug: "sanders" },
    { name: "Grinders", parentSlug: "power-tools", slug: "grinders" },

    // Level 3: Hand Tools Subcategories
    { name: "Hammers", parentSlug: "hand-tools", slug: "hammers" },
    { name: "Screwdrivers", parentSlug: "hand-tools", slug: "screwdrivers" },
    { name: "Wrenches", parentSlug: "hand-tools", slug: "wrenches" },
    { name: "Pliers", parentSlug: "hand-tools", slug: "pliers" },

    // Level 3: Safety Equipment Subcategories
    {
      name: "Safety Gloves",
      parentSlug: "safety-equipment",
      slug: "safety-gloves",
    },
    {
      name: "Safety Glasses",
      parentSlug: "safety-equipment",
      slug: "safety-glasses",
    },
    { name: "Hard Hats", parentSlug: "safety-equipment", slug: "hard-hats" },
    {
      name: "Safety Boots",
      parentSlug: "safety-equipment",
      slug: "safety-boots",
    },

    // Level 3: Electrical Equipment Subcategories
    {
      name: "Electrical Cables",
      parentSlug: "electrical-equipment",
      slug: "electrical-cables",
    },
    {
      name: "Circuit Breakers",
      parentSlug: "electrical-equipment",
      slug: "circuit-breakers",
    },
    {
      name: "Switches & Sockets",
      parentSlug: "electrical-equipment",
      slug: "switches-sockets",
    },
    {
      name: "Lighting Fixtures",
      parentSlug: "electrical-equipment",
      slug: "lighting-fixtures",
    },
  ] as Array<{
    name: string;
    description?: string;
    slug: string;
    parentSlug?: string;
  }>;

  // ============================================
  // SUMMARY STATS WITH VEHICLE SALES
  // ============================================
  // Total Departments (Level 1): 13
  // Total Categories (Level 2): ~95+
  // Total Subcategories (Level 3): ~370+
  // Total Category Items: 475+
  //
  // NEW: Vehicles for Sale category includes:
  // - New Cars, Used Cars, Luxury & Sports Cars
  // - SUVs & Trucks, Vans & Commercial Vehicles
  // - Electric & Hybrid Vehicles
  // - Motorcycles for Sale
  // ============================================

  const createdCategories: {
    [slug: string]: mongoose.Document & { id: string };
  } = {};
  // Remove categories not in canonical list to enforce exact structure
  const canonicalSlugs = new Set(categories.map((c) => c.slug));
  await Category.deleteMany({ slug: { $nin: Array.from(canonicalSlugs) } });
  // First pass create Level 1 items with no parentId
  for (const c of categories) {
    if (!c.parentSlug) {
      const existing = await Category.findOne({ slug: c.slug });
      createdCategories[c.slug] =
        (existing as any) ||
        (await Category.create({
          name: c.name,
          description: c.description,
          slug: c.slug,
        }));
    }
  }
  // Second pass create children with parentId reference to parent slug
  for (const c of categories) {
    if (c.parentSlug) {
      const parent =
        createdCategories[c.parentSlug] ||
        (await Category.findOne({ slug: c.parentSlug }));
      if (!parent) continue;
      const existing = await Category.findOne({ slug: c.slug });
      createdCategories[c.slug] =
        (existing as any) ||
        (await Category.create({
          name: c.name,
          slug: c.slug,
          parentId: (parent as any).slug,
        }));
    }
  }

  // Helper to generate 5 picsum images per product based on title seed
  const img = (title: string): string[] => {
    const seed = encodeURIComponent(
      String(title).toLowerCase().replace(/\s+/g, "-")
    );
    // Different sizes to add variety; picsum supports /seed/<seed>/<w>/<h>
    return [
      `https://picsum.photos/seed/${seed}-1/800/800`,
      `https://picsum.photos/seed/${seed}-2/1000/750`,
      `https://picsum.photos/seed/${seed}-3/900/1200`,
      `https://picsum.photos/seed/${seed}-4/1200/900`,
      `https://picsum.photos/seed/${seed}-5/800/600`,
    ];
  };

  // Products
  const products = [
    // Electronics > Phones & Accessories > Smartphones
    {
      title: "Nova X1 5G Smartphone",
      description:
        'A sleek 6.5" OLED phone with 8GB RAM and 128GB storage powered by a 5,000mAh battery. Delivers smooth 5G connectivity, all‑day power and a vibrant display for gaming, streaming and work. The triple‑camera system captures detailed photos in any light, while stereo speakers make movies and music come alive. Thoughtful touches like NFC, dual SIM and fast charging make it a dependable everyday companion.',
      price: 1050000,
      currency: "NGN",
      category: "Smartphones",
      images: img("Nova X1 5G Smartphone"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["phone", "5g", "oled"],
      quantity: 525,
      minOrderQuantity: 200,
      featured: true,
      brand: "Nova",
      attributes: { brand: "Nova", storage: "128GB", ram: "8GB" },
      discount: 10,
      shippingOptions: [{ method: "standard", cost: 0, estimatedDays: 3 }],
      rating: 4.6,
    },
    {
      title: "Aurora Lite Smartphone",
      description:
        'Compact 6.1" AMOLED device that feels great in one hand. 6GB RAM with 64GB storage keeps things snappy while the 4,000mAh battery gets you through a busy day. A clean, modern UI and reliable cameras make it perfect for students, travelers and anyone who prefers a pocket‑friendly phone. Includes a headphone‑friendly audio profile and a durable, scratch‑resistant screen.',
      price: 600000,
      currency: "NGN",
      category: "Smartphones",
      images: img("Aurora Lite Smartphone"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["phone", "budget"],
      quantity: 35,
      minOrderQuantity: 1,
      featured: true,
      brand: "Aurora",
      attributes: { brand: "Aurora", storage: "64GB", ram: "6GB" },
      shippingOptions: [{ method: "express", cost: 5, estimatedDays: 2 }],
      rating: 4.2,
    },
    // Tablets & iPads
    {
      title: "TechPad Pro 11",
      description:
        "Premium 11-inch tablet with stunning display and powerful processor. Perfect for creative work, entertainment and productivity. Includes stylus support and keyboard compatibility for laptop-replacement capabilities.",
      price: 975000,
      currency: "NGN",
      category: "Tablets & iPads",
      images: img("TechPad Pro 11"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["tablet", "productivity"],
      quantity: 20,
      minOrderQuantity: 1,
      featured: true,
      brand: "TechPad",
      attributes: { storage: "256GB", screenSize: '11"' },
      rating: 4.5,
    },
    // Electronics > Audio > Headphones
    {
      title: "Aero ANC Headphones",
      description:
        "Comfortable wireless over‑ear headphones with hybrid active noise cancellation. Rich, balanced sound and up to 35 hours of playtime for commuting, work and travel. Memory‑foam ear cushions and a lightweight frame reduce fatigue during long sessions. Multipoint Bluetooth lets you switch between your laptop and phone without missing a beat.",
      price: 195000,
      currency: "NGN",
      category: "Headphones",
      images: img("Aero ANC Headphones"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["audio", "wireless"],
      quantity: 18,
      minOrderQuantity: 1,
      featured: true,
      brand: "Aero",
      attributes: { brand: "Aero", type: "Over-ear", anc: "ANC" },
      discount: 20,
      shippingOptions: [{ method: "standard", cost: 0, estimatedDays: 7 }],
      rating: 4.8,
    },
    {
      title: "Sonic Pro Earbuds",
      description:
        "True wireless earbuds with punchy bass and crystal‑clear calls. The pocketable case provides up to 24 hours of total listening time with fast USB‑C charging. IPX4 water resistance shrugs off sweat and light rain, and silicone tips in multiple sizes ensure a secure, comfortable fit. Touch controls make it easy to manage music and calls on the go.",
      price: 90000,
      currency: "NGN",
      category: "Headphones",
      images: img("Sonic Pro Earbuds"),
      condition: "new",
      location: { country: "Nigeria", city: "Kano" },
      status: "active",
      tags: ["audio", "earbuds"],
      quantity: 50,
      minOrderQuantity: 1,
      featured: false,
      brand: "Sonic",
      attributes: { brand: "Sonic", type: "In-ear", anc: "Passive" },
      rating: 4.1,
    },
    // Electronics > Audio > Bluetooth Speakers
    {
      title: "BoomGo Portable Speaker",
      description:
        "Rugged waterproof Bluetooth speaker built for outdoors. Delivers room‑filling sound with deep bass and up to 12 hours of playtime on a single charge. A built‑in microphone enables hands‑free calls and a strap makes it easy to carry to the beach, park or campsite. Pair two for stereo sound and an even bigger party.",
      price: 120000,
      currency: "NGN",
      category: "Bluetooth Speakers",
      images: img("BoomGo Portable Speaker"),
      condition: "new",
      location: { country: "Nigeria", city: "Ibadan" },
      status: "active",
      tags: ["audio", "bluetooth"],
      quantity: 40,
      minOrderQuantity: 1,
      featured: true,
      brand: "BoomGo",
      attributes: { brand: "BoomGo" },
      rating: 4.3,
    },
    // Electronics > Computers > Laptops
    {
      title: "ZenBook 14 Laptop",
      description:
        'Ultralight 1.2kg productivity laptop with a crisp 14" IPS display. 11th‑gen i7, 16GB RAM and 512GB SSD provide effortless multitasking and instant wake. Precision keyboard and large glass trackpad make typing a pleasure, while Wi‑Fi 6 and fast charging keep you productive wherever you work. Ideal for creators, students and frequent travelers.',
      price: 1650000,
      currency: "NGN",
      category: "Laptops",
      images: img("ZenBook 14 Laptop"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["laptop"],
      quantity: 12,
      minOrderQuantity: 1,
      featured: true,
      brand: "Zen",
      attributes: { ram: "16GB", storage: "512GB", size: '14"' },
      shippingOptions: [{ method: "express", cost: 10, estimatedDays: 3 }],
      rating: 4.7,
    },
    {
      title: "WorkMate 15 Laptop",
      description:
        'Durable 15.6" workhorse powered by Ryzen 5 and 16GB RAM. A bright IPS screen and 512GB SSD keep workflows fast at the office or on the go. Full‑size ports reduce dongle clutter.',
      price: 1500000,
      currency: "NGN",
      category: "Laptops",
      images: img("WorkMate 15 Laptop"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["laptop"],
      quantity: 10,
      minOrderQuantity: 1,
      featured: true,
      brand: "WorkMate",
      attributes: { ram: "16GB", storage: "512GB", size: '15"' },
      shippingOptions: [{ method: "express", cost: 10, estimatedDays: 3 }],
      rating: 4.6,
    },
    // Gaming Consoles
    {
      title: "GameStation 5 Pro",
      description:
        "Next-gen gaming console with 4K graphics and ray tracing. Includes wireless controller and 1TB storage. Experience lightning-fast load times and immersive gameplay.",
      price: 750000,
      currency: "NGN",
      category: "Gaming Consoles",
      images: img("GameStation 5 Pro"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["gaming", "console"],
      quantity: 15,
      minOrderQuantity: 1,
      featured: true,
      brand: "GameStation",
      attributes: { storage: "1TB" },
      rating: 4.9,
    },
    // Smart Watches
    {
      title: "FitPro Watch Ultra",
      description:
        "Advanced smartwatch with health tracking, GPS, and 7-day battery life. Water-resistant design perfect for fitness enthusiasts. Track workouts, sleep, heart rate and more.",
      price: 450000,
      currency: "NGN",
      category: "Smart Watches",
      images: img("FitPro Watch Ultra"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["smartwatch", "fitness"],
      quantity: 30,
      minOrderQuantity: 1,
      featured: true,
      brand: "FitPro",
      attributes: { batteryLife: "7 days", waterResistant: "Yes" },
      rating: 4.6,
    },
    {
      title: "StyleWatch S3",
      description:
        "Sleek smartwatch with customizable watch faces and fitness tracking. Features heart rate monitor, sleep tracking, and smartphone notifications. Ideal for everyday wear.",
      price: 300000,
      currency: "NGN",
      category: "Smart Watches",
      images: img("StyleWatch S3"),
      condition: "new",
      location: { country: "Nigeria", city: "Kano" },
      status: "active",
      tags: ["smartwatch"],
      quantity: 25,
      minOrderQuantity: 1,
      featured: false,
      brand: "StyleWatch",
      attributes: { batteryLife: "5 days", waterResistant: "Yes" },
      rating: 4.2,
    },
    // Women's Dresses
    {
      title: "Women's Summer Dress",
      description:
        "Lightweight, flowy dress with a flattering silhouette. Breezy fabric and a playful floral print make it an easy warm‑weather staple. Adjustable straps and a smocked back ensure a comfortable fit for all‑day wear.",
      price: 45000,
      currency: "NGN",
      category: "Dresses",
      images: img("Women's Summer Dress"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["fashion", "women"],
      quantity: 60,
      minOrderQuantity: 1,
      featured: false,
      brand: "Luna",
      attributes: { size: "M", color: "Blue" },
      discount: 20,
      rating: 4.3,
    },
    // Fashion > Men > T-Shirts
    {
      title: "Men's Classic Tee",
      description:
        "Everyday 100% cotton tee with a timeless regular fit. Soft, breathable fabric that washes well and pairs with anything in your wardrobe. Reinforced neckline and double‑stitched hems help it keep its shape after repeated wears. Dress it up with a blazer or down with your favorite jeans.",
      price: 18000,
      currency: "NGN",
      category: "T-Shirts",
      images: img("Men's Classic Tee"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["fashion"],
      quantity: 100,
      minOrderQuantity: 1,
      featured: false,
      brand: "Basic",
      attributes: { size: "M", color: "Black" },
      rating: 4.0,
    },
    {
      title: "Men's Oversize Tee",
      description:
        "Relaxed‑fit tee cut from premium cotton for a draped silhouette. Breathable, soft and perfect for layering in any season. The pigment dye gives a lived‑in look from day one.",
      price: 22500,
      currency: "NGN",
      category: "T-Shirts",
      images: img("Men's Oversize Tee"),
      condition: "new",
      location: { country: "Nigeria", city: "Kano" },
      status: "active",
      tags: ["fashion", "men"],
      quantity: 120,
      minOrderQuantity: 1,
      featured: false,
      brand: "Basic",
      attributes: { size: "L", color: "White" },
      rating: 4.1,
    },
    {
      title: "Men's Oversize Tee",
      description:
        "Relaxed‑fit tee cut from premium cotton for a draped silhouette. Breathable, soft and perfect for layering in any season. The pigment dye gives a lived‑in look from day one.",
      price: 15,
      currency: "NGN",
      category: "T-Shirts",
      images: img("Men's Oversize Tee"),
      condition: "new",
      location: { country: "Nigeria", city: "Kano" },
      status: "active",
      tags: ["fashion", "men"],
      quantity: 120,
      minOrderQuantity: 1,
      featured: false,
      brand: "Basic",
      attributes: { size: "L", color: "White" },
      rating: 4.1,
    },

    // Women's Shoes
    {
      title: "Classic Leather Heels",
      description:
        "Elegant pointed-toe heels crafted from genuine leather. Perfect for office wear or special occasions. Comfortable cushioned insole for all-day wear.",
      price: 135000,
      currency: "NGN",
      category: "Women's Shoes",
      images: img("Classic Leather Heels"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["fashion", "shoes", "women"],
      quantity: 40,
      minOrderQuantity: 1,
      featured: true,
      brand: "StyleCraft",
      attributes: { size: "38", color: "Black", heelHeight: "3 inches" },
      rating: 4.4,
    },

    // Men's Shoes
    {
      title: "Business Formal Shoes",
      description:
        "Premium leather dress shoes with classic Oxford design. Perfect for professional settings and formal events. Durable construction with comfortable fit.",
      price: 180000,
      currency: "NGN",
      category: "Men's Shoes",
      images: img("Business Formal Shoes"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["fashion", "shoes", "men"],
      quantity: 35,
      minOrderQuantity: 1,
      featured: false,
      brand: "Gentleman",
      attributes: { size: "42", color: "Brown" },
      rating: 4.5,
    },

    // Handbags
    {
      title: "Designer Crossbody Bag",
      description:
        "Stylish crossbody bag with adjustable strap. Multiple compartments for organization. Made from high-quality vegan leather in trending colors.",
      price: 900,
      currency: "NGN",
      category: "Handbags",
      images: img("Designer Crossbody Bag"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["fashion", "bags", "women"],
      quantity: 500,
      minOrderQuantity: 100,
      featured: true,
      brand: "ChicStyle",
      attributes: { color: "Burgundy", material: "Vegan Leather" },
      rating: 4.3,
    },

    // Kids Clothing
    {
      title: "Kids' Colorful T-Shirt Set",
      description:
        "Set of 3 vibrant cotton t-shirts for kids. Soft, breathable fabric perfect for active play. Fun prints that kids love.",
      price: 37500,
      currency: "NGN",
      category: "Kids Clothing",
      images: img("Kids Colorful T-Shirt Set"),
      condition: "new",
      location: { country: "Nigeria", city: "Kano" },
      status: "active",
      tags: ["kids", "fashion"],
      quantity: 80,
      minOrderQuantity: 1,
      featured: false,
      brand: "KidJoy",
      attributes: { age: "5-7 years", color: "Multicolor" },
      rating: 4.2,
    },

    // Baby Clothing
    {
      title: "Baby Onesie 5-Pack",
      description:
        "Adorable cotton onesies for babies. Soft, gentle on skin with easy snap closures. Machine washable and durable.",
      price: 52500,
      currency: "NGN",
      category: "Baby Clothing",
      images: img("Baby Onesie 5-Pack"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["baby", "clothing"],
      quantity: 60,
      minOrderQuantity: 1,
      featured: false,
      brand: "BabyComfort",
      attributes: { size: "6-12 months" },
      rating: 4.6,
    },
    // Home & Kitchen > Appliances > Blenders
    {
      title: "PowerBlend 900 Blender",
      description:
        "Powerful 900W kitchen blender with a durable 1.5L glass jar. Three speed settings and pulse mode tackle smoothies, soups and crushed ice with ease. The stainless‑steel blades stay sharp longer and the spill‑resistant lid makes cleanup simple. A sturdy base with non‑slip feet keeps everything stable while blending.",
      price: 97500,
      currency: "NGN",
      category: "Blenders",
      images: img("PowerBlend 900 Blender"),
      condition: "new",
      location: { country: "Nigeria", city: "Port Harcourt" },
      status: "active",
      tags: ["kitchen"],
      quantity: 30,
      minOrderQuantity: 1,
      featured: false,
      brand: "PowerBlend",
      attributes: { capacity: "1.5L" },
      rating: 4.4,
    },
    {
      title: "PowerBlend Mini",
      description:
        "Portable 500W blender with a 0.6L take‑away bottle. Blend smoothies directly into the travel cup for quick breakfasts and gym sessions. One‑touch operation and dishwasher‑safe parts.",
      price: 35,
      currency: "NGN",
      category: "Blenders",
      images: img("PowerBlend Mini"),
      condition: "new",
      location: { country: "Nigeria", city: "Port Harcourt" },
      status: "active",
      tags: ["kitchen", "portable"],
      quantity: 70,
      minOrderQuantity: 1,
      featured: false,
      brand: "PowerBlend",
      attributes: { capacity: "0.6L" },
      shippingOptions: [{ method: "standard", cost: 0, estimatedDays: 7 }],
      rating: 4.2,
    },
    // Air Conditioners
    {
      title: "CoolBreeze 1.5HP Split AC",
      description:
        "Energy-efficient split air conditioner with remote control. Quiet operation and fast cooling. Perfect for bedrooms and living rooms up to 18m².",
      price: 690000,
      currency: "NGN",
      category: "Air Conditioners",
      images: img("CoolBreeze 1.5HP Split AC"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["appliances", "cooling"],
      quantity: 12,
      minOrderQuantity: 1,
      featured: true,
      brand: "CoolBreeze",
      attributes: { power: "1.5HP", type: "Split" },
      rating: 4.5,
    },

    // Sofas
    {
      title: "Modern 3-Seater Sofa",
      description:
        "Contemporary fabric sofa with clean lines and comfortable cushioning. Perfect for living rooms. Durable construction with removable covers for easy cleaning.",
      price: 825000,
      currency: "NGN",
      category: "Sofas & Couches",
      images: img("Modern 3-Seater Sofa"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["furniture", "living room"],
      quantity: 8,
      minOrderQuantity: 1,
      featured: true,
      brand: "ComfortHome",
      attributes: { seats: "3", color: "Gray" },
      rating: 4.7,
    },

    // Mattresses
    {
      title: "Premium Memory Foam Mattress",
      description:
        "Queen-size memory foam mattress with excellent support. Pressure-relieving comfort layers for better sleep. Includes breathable cover.",
      price: 600000,
      currency: "NGN",
      category: "Mattresses",
      images: img("Premium Memory Foam Mattress"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["furniture", "bedroom"],
      quantity: 15,
      minOrderQuantity: 1,
      featured: true,
      brand: "SleepWell",
      attributes: { size: "Queen", type: "Memory Foam" },
      rating: 4.8,
    },

    // Lighting
    {
      title: "Ambient LED Strip 5m",
      description:
        "Flexible 5m RGB LED strip adds instant ambience to desks, TVs and shelves. USB powered with remote control for colors, brightness and effects. Strong adhesive backing makes installation quick.",
      price: 27000,
      currency: "NGN",
      category: "Lighting",
      images: img("Ambient LED Strip 5m"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["decor", "lighting"],
      quantity: 60,
      minOrderQuantity: 1,
      featured: false,
      brand: "Ambi",
      attributes: { length: "5m", color: "RGB" },
      rating: 3.9,
    },
    // Home & Kitchen > Decor > Lighting
    {
      title: "Ambient LED Strip 5m",
      description:
        "Flexible 5m RGB LED strip adds instant ambience to desks, TVs and shelves. USB powered with remote control for colors, brightness and effects. Strong adhesive backing makes installation quick, and the strip can be trimmed to fit. Create scenes for gaming, movies or late‑night work sessions in seconds.",
      price: 27000,
      currency: "NGN",
      category: "Lighting",
      images: img("Ambient LED Strip 5m"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["decor"],
      quantity: 60,
      minOrderQuantity: 1,
      featured: false,
      brand: "Ambi",
      attributes: { color: "RGB" },
      rating: 3.9,
    },
    {
      title: "LumaDesk LED Lamp",
      description:
        "Adjustable LED desk lamp with touch controls and multiple brightness levels. Sleek design with a flexible neck for optimal lighting angles. Built‑in USB port for convenient device charging.",
      price: 67500,
      currency: "NGN",
      category: "Lighting",
      images: img("LumaDesk LED Lamp"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["decor", "desk"],
      quantity: 30,
      minOrderQuantity: 1,
      featured: true,
      brand: "LumaDesk",
      attributes: { color: "White" },
      rating: 4.2,
    },

    // Cookware
    {
      title: "Non-Stick Cookware Set",
      description:
        "12-piece non-stick cookware set including pots, pans and lids. Durable construction with heat-resistant handles. Dishwasher safe.",
      price: 89,
      currency: "NGN",
      category: "Cookware",
      images: img("Non-Stick Cookware Set"),
      condition: "new",
      location: { country: "Nigeria", city: "Ibadan" },
      status: "active",
      tags: ["kitchen", "cookware"],
      quantity: 250,
      minOrderQuantity: 100,
      featured: true,
      brand: "ChefPro",
      attributes: { pieces: "12", material: "Aluminum" },
      rating: 4.4,
    },
    {
      title: "Stainless Steel Cookware Set",
      description:
        "10-piece stainless steel cookware set with glass lids. Even heat distribution and durable construction. Suitable for all cooktops including induction.",
      price: 119,
      currency: "NGN",
      category: "Cookware",
      images: img("Stainless Steel Cookware Set"),
      condition: "new",
      location: { country: "Nigeria", city: "Ibadan" },
      status: "active",
      tags: ["kitchen", "cookware"],
      quantity: 200,
      minOrderQuantity: 50,
      featured: false,
      brand: "ChefPro",
      attributes: { pieces: "10", material: "Stainless Steel" },
      rating: 4.5,
    },
    // ============================================
    // BEAUTY & PERSONAL CARE
    // ============================================

    // Wigs & Extensions
    {
      title: "Premium Human Hair Wig",
      description:
        "100% human hair wig with natural texture. Pre-styled and ready to wear. Heat-resistant and can be styled with hot tools.",
      price: 300000,
      currency: "NGN",
      category: "Wigs & Extensions",
      images: img("Premium Human Hair Wig"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["beauty", "hair"],
      quantity: 20,
      minOrderQuantity: 1,
      featured: true,
      brand: "GlamHair",
      attributes: { length: "16 inches", type: "Human Hair" },
      rating: 4.7,
    },

    // Skincare
    {
      title: "Vitamin C Face Serum",
      description:
        "Brightening vitamin C serum for radiant skin. Reduces dark spots and evens skin tone. Suitable for all skin types.",
      price: 60000,
      currency: "NGN",
      category: "Face Care",
      images: img("Vitamin C Face Serum"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["beauty", "skincare"],
      quantity: 50,
      minOrderQuantity: 1,
      featured: true,
      brand: "GlowSkin",
      attributes: { volume: "30ml", type: "Serum" },
      rating: 4.6,
    },

    // Perfumes
    {
      title: "Luxury Women's Perfume",
      description:
        "Elegant floral fragrance with notes of jasmine and vanilla. Long-lasting scent perfect for day or evening wear. 100ml bottle.",
      price: 120000,
      currency: "NGN",
      category: "Perfumes",
      images: img("Luxury Women's Perfume"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["beauty", "fragrance"],
      quantity: 30,
      minOrderQuantity: 1,
      featured: true,
      brand: "Essence",
      attributes: { volume: "100ml", scent: "Floral" },
      rating: 4.5,
    },

    // Fitness Supplements
    {
      title: "Whey Protein Powder",
      description:
        "Premium whey protein isolate for muscle building and recovery. Delicious chocolate flavor. 2kg container.",
      price: 89,
      currency: "NGN",
      category: "Fitness Supplements",
      images: img("Whey Protein Powder"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["health", "fitness", "supplements"],
      quantity: 40,
      minOrderQuantity: 1,
      featured: true,
      brand: "MaxMuscle",
      attributes: { weight: "2kg", flavor: "Chocolate" },
      rating: 4.6,
    },
    {
      title: "Multivitamin Capsules",
      description:
        "Daily multivitamin supplement for overall health and wellness. Contains essential vitamins and minerals. 60 capsules per bottle.",
      price: 45000,
      currency: "NGN",
      category: "Health Supplements",
      images: img("Multivitamin Capsules"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["health", "supplements"],
      quantity: 70,
      minOrderQuantity: 1,
      featured: false,
      brand: "HealthPlus",
      attributes: { count: "60 capsules" },
      rating: 4.4,
    },
    // ============================================
    // SPORTS & OUTDOORS
    // ============================================

    // Exercise Equipment
    {
      title: "Adjustable Dumbbell Set",
      description:
        "Space-saving adjustable dumbbells from 2.5kg to 25kg per hand. Perfect for home workouts. Includes storage tray.",
      price: 199,
      currency: "NGN",
      category: "Weights & Dumbbells",
      images: img("Adjustable Dumbbell Set"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["fitness", "exercise"],
      quantity: 15,
      minOrderQuantity: 1,
      featured: true,
      brand: "FitGear",
      attributes: { maxWeight: "25kg" },
      rating: 4.7,
    },

    // Yoga & Pilates
    {
      title: "Premium Yoga Mat",
      description:
        "Extra-thick non-slip yoga mat with carrying strap. Eco-friendly material, perfect for yoga, pilates and stretching. 6mm thickness.",
      price: 35,
      currency: "NGN",
      category: "Yoga & Pilates",
      images: img("Premium Yoga Mat"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["fitness", "yoga"],
      quantity: 50,
      minOrderQuantity: 1,
      featured: false,
      brand: "ZenFit",
      attributes: { thickness: "6mm", color: "Purple" },
      rating: 4.4,
    },

    // Cycling
    {
      title: "Mountain Bike 26-inch",
      description:
        "Durable mountain bike with 21-speed gear system. Front suspension for smooth rides on rough terrain. Suitable for adults.",
      price: 525000,
      currency: "NGN",
      category: "Cycling",
      images: img("Mountain Bike 26-inch"),
      condition: "new",
      location: { country: "Nigeria", city: "Ibadan" },
      status: "active",
      tags: ["sports", "cycling"],
      quantity: 10,
      minOrderQuantity: 1,
      featured: true,
      brand: "TrailRider",
      attributes: { wheelSize: "26 inches", gears: "21" },
      rating: 4.5,
    },
    {
      title: "Road Bike 28-inch",
      description:
        "Lightweight road bike with carbon frame and 18-speed gear system. Designed for speed and efficiency on paved roads. Suitable for adults.",
      price: 750000,
      currency: "NGN",
      category: "Cycling",
      images: img("Road Bike 28-inch"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["sports", "cycling"],
      quantity: 8,
      minOrderQuantity: 1,
      featured: false,
      brand: "Speedster",
      attributes: { wheelSize: "28 inches", gears: "18" },
      rating: 4.6,
    },
    {
      title: "TechPad Air 10",
      description:
        "Lightweight 10-inch tablet designed for everyday use. Features a vibrant display, long battery life and smooth performance for browsing, streaming and light productivity tasks.",
      price: 600000,
      currency: "NGN",
      category: "Tablets & iPads",
      images: img("TechPad Air 10"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["tablet", "everyday"],
      quantity: 30,
      minOrderQuantity: 1,
      featured: true,
      brand: "TechPad",
      attributes: { storage: "128GB", screenSize: '10"' },
      rating: 4.3,
    },
    // ============================================
    // AUTOMOBILES & PARTS
    // ============================================

    // Used Cars
    {
      title: "2020 Toyota Corolla",
      description:
        "Well-maintained 2020 Toyota Corolla with low mileage. Automatic transmission, AC, power windows. Full service history available. One owner.",
      price: 18750000,
      currency: "NGN",
      category: "Used Cars",
      images: img("2020 Toyota Corolla"),
      condition: "used",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["car", "sedan", "toyota"],
      quantity: 1,
      minOrderQuantity: 1,
      featured: true,
      brand: "Toyota",
      attributes: {
        year: "2020",
        mileage: "45000km",
        transmission: "Automatic",
      },
      rating: 4.8,
    },

    // Car Accessories
    {
      title: "Leather Seat Covers Set",
      description:
        "Premium leather seat covers for 5-seater cars. Easy installation, waterproof and durable. Fits most car models.",
      price: 89,
      currency: "NGN",
      category: "Interior Accessories",
      images: img("Leather Seat Covers Set"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["car", "accessories"],
      quantity: 30,
      minOrderQuantity: 1,
      featured: false,
      brand: "AutoLux",
      attributes: { material: "Leather", color: "Black" },
      rating: 4.3,
    },

    // Car Electronics
    {
      title: "Dash Camera Full HD",
      description:
        "1080P dash camera with night vision and loop recording. Wide-angle lens captures entire road. Includes SD card.",
      price: 105000,
      currency: "NGN",
      category: "Car Electronics",
      images: img("Dash Camera Full HD"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["car", "electronics", "safety"],
      quantity: 40,
      minOrderQuantity: 1,
      featured: true,
      brand: "RoadGuard",
      attributes: { resolution: "1080P", storage: "32GB" },
      rating: 4.5,
    },

    // ============================================
    // BAGS & LUGGAGE
    // ============================================

    // Backpacks
    {
      title: "Travel Backpack 40L",
      description:
        "Spacious travel backpack with multiple compartments. Laptop sleeve, USB charging port and water-resistant material. Perfect for travel and hiking.",
      price: 59,
      currency: "NGN",
      category: "Travel Backpacks",
      images: img("Travel Backpack 40L"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["bags", "travel"],
      quantity: 45,
      minOrderQuantity: 1,
      featured: true,
      brand: "TrekPro",
      attributes: { capacity: "40L", laptop: "Up to 17 inches" },
      rating: 4.6,
    },
    // Travel Luggage
    {
      title: "Hard Shell Suitcase 28-inch",
      description:
        "Durable hard shell suitcase with 360° spinner wheels. TSA-approved lock and expandable design. Lightweight yet strong.",
      price: 195000,
      currency: "NGN",
      category: "Checked Luggage",
      images: img("Hard Shell Suitcase 28-inch"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["luggage", "travel"],
      quantity: 20,
      minOrderQuantity: 1,
      featured: true,
      brand: "TravelMate",
      attributes: { size: "28 inches", material: "Polycarbonate" },
      rating: 4.5,
    },
    {
      title: "Hard Shell Suitcase 20-inch",
      description:
        "Durable hard shell suitcase with 360° spinner wheels. TSA-approved lock and expandable design. Lightweight yet strong.",
      price: 150000,
      currency: "NGN",
      category: "Checked Luggage",
      images: img("Hard Shell Suitcase 20-inch"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["luggage", "travel"],
      quantity: 30,
      minOrderQuantity: 1,
      featured: false,
      brand: "TravelMate",
      attributes: { size: "20 inches", material: "Polycarbonate" },
      rating: 4.4,
    },
    // Additional mock products
    {
      title: "TechPad Mini 8",
      description:
        "Compact 8-inch tablet perfect for on-the-go use. Lightweight design with a vibrant display and long-lasting battery. Ideal for reading, browsing and light productivity tasks.",
      price: 299,
      currency: "NGN",
      category: "Tablets & iPads",
      images: img("TechPad Mini 8"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["tablet", "portable"],
      quantity: 25,
      minOrderQuantity: 1,
      featured: false,
      brand: "TechPad",
      attributes: { storage: "128GB", screenSize: '8"' },
      rating: 4.1,
    },
    {
      title: "Nova X1 Pro",
      description:
        'Flagship‑grade 6.7" OLED phone with 12GB RAM and 256GB storage. Advanced cameras, ultra‑fast 5G and refined design for creators and power users. The Pro‑level image pipeline delivers lifelike detail and color, even at night. Premium materials and IP68 water resistance complete the experience.',
      price: 849,
      currency: "NGN",
      category: "Smartphones",
      images: img("Nova X1 Pro"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["phone", "5g"],
      quantity: 15,
      minOrderQuantity: 1,
      featured: true,
      brand: "Nova",
      attributes: { brand: "Nova", storage: "256GB", ram: "12GB" },
      discount: 5,
      shippingOptions: [{ method: "express", cost: 5, estimatedDays: 2 }],
      rating: 4.7,
    },
    {
      title: "Aurora Max",
      description:
        'Immersive 6.8" AMOLED display backed by a 5,500mAh battery. 8GB RAM and 256GB storage keep your apps and media running smoothly all day. Fast charging gets you hours of use in minutes, and the large vapor‑chamber cooling keeps performance steady in games. A matte finish resists fingerprints for a clean look.',
      price: 789,
      currency: "NGN",
      category: "Smartphones",
      images: img("Aurora Max"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["phone"],
      quantity: 20,
      minOrderQuantity: 1,
      featured: false,
      brand: "Aurora",
      attributes: { brand: "Aurora", storage: "256GB", ram: "8GB" },
      discount: 12,
      shippingOptions: [{ method: "standard", cost: 0, estimatedDays: 5 }],
      rating: 4.4,
    },
    {
      title: "Aero Studio Headphones",
      description:
        "Reliable wired studio monitors tuned for a neutral, honest response. Comfortable long‑session fit ideal for editing, mixing and focused listening. The detachable cable and swiveling earcups make them easy to pack for mobile studios. Built to last with a reinforced headband and replaceable pads.",
      price: 99,
      currency: "NGN",
      category: "Headphones",
      images: img("Aero Studio Headphones"),
      condition: "new",
      location: { country: "Nigeria", city: "Ibadan" },
      status: "active",
      tags: ["audio"],
      quantity: 25,
      minOrderQuantity: 1,
      featured: false,
      brand: "Aero",
      attributes: { brand: "Aero", type: "Over-ear" },
      shippingOptions: [{ method: "standard", cost: 0, estimatedDays: 7 }],
      rating: 4.3,
    },
    {
      title: "Sonic Air Earbuds",
      description:
        "Compact ANC earbuds with a wireless‑charging case. Clear voice pickup and customizable touch controls for effortless everyday use. A low‑latency mode improves video and gaming sync, while transparency mode keeps you aware of your surroundings when needed.",
      price: 69,
      currency: "NGN",
      category: "Headphones",
      images: img("Sonic Air Earbuds"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["audio", "earbuds"],
      quantity: 80,
      minOrderQuantity: 1,
      featured: true,
      brand: "Sonic",
      attributes: { brand: "Sonic", anc: "ANC", type: "In-ear" },
      discount: 15,
      shippingOptions: [{ method: "standard", cost: 0, estimatedDays: 3 }],
      rating: 4.5,
    },
    {
      title: "BoomGo Max Speaker",
      description:
        "Powerful 40W portable speaker with IPX7 waterproof rating. Stereo drivers and passive radiators deliver loud, distortion‑free sound. The long‑lasting battery doubles as a power bank to top up your phone. Pair multiple units for whole‑yard coverage at your next gathering.",
      price: 129,
      currency: "NGN",
      category: "Bluetooth Speakers",
      images: img("BoomGo Max Speaker"),
      condition: "new",
      location: { country: "Nigeria", city: "Kano" },
      status: "active",
      tags: ["audio", "bluetooth"],
      quantity: 22,
      minOrderQuantity: 1,
      featured: false,
      brand: "BoomGo",
      attributes: { brand: "BoomGo" },
      discount: 10,
      shippingOptions: [{ method: "express", cost: 7, estimatedDays: 2 }],
      rating: 4.2,
    },
    {
      title: "ZenBook 13 Laptop",
      description:
        'Featherweight 13" ultrabook at just 1.1kg. Efficient i5 processor with 8GB RAM and a fast 256GB SSD makes it a perfect travel companion. Narrow bezels maximize screen space without increasing size, and the backlit keyboard helps in low‑light classrooms and flights.',
      price: 899,
      currency: "NGN",
      category: "Laptops",
      images: img("ZenBook 13 Laptop"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["laptop"],
      quantity: 18,
      minOrderQuantity: 1,
      featured: false,
      brand: "Zen",
      attributes: { ram: "8GB", storage: "256GB", size: '13"' },
      shippingOptions: [{ method: "standard", cost: 0, estimatedDays: 5 }],
      rating: 4.4,
    },
    {
      title: "WorkMate 15 Laptop",
      description:
        'Durable 15.6" workhorse powered by Ryzen 5 and 16GB RAM. A bright IPS screen and 512GB SSD keep workflows fast at the office or on the go. Full‑size ports reduce dongle clutter, and the large battery with fast charge means less time tethered to an outlet.',
      price: 999,
      currency: "NGN",
      category: "Laptops",
      images: img("WorkMate 15 Laptop"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["laptop"],
      quantity: 10,
      minOrderQuantity: 1,
      featured: true,
      brand: "WorkMate",
      attributes: { ram: "16GB", storage: "512GB", size: '15"' },
      shippingOptions: [{ method: "express", cost: 10, estimatedDays: 3 }],
      rating: 4.6,
    },
    {
      title: "Men's Oversize Tee",
      description:
        "Relaxed‑fit tee cut from premium cotton for a draped silhouette. Breathable, soft and perfect for layering in any season. The pigment dye gives a lived‑in look from day one, and it gets even softer with every wash.",
      price: 15,
      currency: "NGN",
      category: "T-Shirts",
      images: img("Men's Oversize Tee"),
      condition: "new",
      location: { country: "Nigeria", city: "Kano" },
      status: "active",
      tags: ["fashion"],
      quantity: 120,
      minOrderQuantity: 1,
      featured: false,
      brand: "Basic",
      attributes: { size: "L", color: "White" },
      rating: 4.1,
    },
    {
      title: "Women's Summer Dress",
      description:
        "Lightweight, flowy dress with a flattering silhouette. Breezy fabric and a playful floral print make it an easy warm‑weather staple. Adjustable straps and a smocked back ensure a comfortable fit for all‑day wear, from brunch to evening strolls.",
      price: 29,
      currency: "NGN",
      category: "Dresses",
      images: img("Women's Summer Dress"),
      condition: "new",
      location: { country: "Nigeria", city: "Abuja" },
      status: "active",
      tags: ["fashion"],
      quantity: 60,
      minOrderQuantity: 1,
      featured: false,
      brand: "Luna",
      attributes: { size: "M", color: "Blue" },
      discount: 20,
      rating: 4.3,
    },
    {
      title: "PowerBlend Mini",
      description:
        "Portable 500W blender with a 0.6L take‑away bottle. Blend smoothies directly into the travel cup for quick breakfasts and gym sessions. One‑touch operation and dishwasher‑safe parts make healthy habits simpler to maintain.",
      price: 35,
      currency: "NGN",
      category: "Blenders",
      images: img("PowerBlend Mini"),
      condition: "new",
      location: { country: "Nigeria", city: "Port Harcourt" },
      status: "active",
      tags: ["kitchen"],
      quantity: 70,
      minOrderQuantity: 1,
      featured: false,
      brand: "PowerBlend",
      attributes: { capacity: "0.6L" },
      shippingOptions: [{ method: "standard", cost: 0, estimatedDays: 7 }],
      rating: 4.2,
    },
    {
      title: "Ambient LED Bulb",
      description:
        "Energy‑saving 9W LED bulb that casts a cozy warm white glow. Standard E27 base fits most fixtures and lasts up to 15,000 hours. Instant‑on brightness with no flicker makes it ideal for bedrooms, living rooms and reading nooks.",
      price: 5,
      currency: "NGN",
      category: "Lighting",
      images: img("Ambient LED Bulb"),
      condition: "new",
      location: { country: "Nigeria", city: "Lagos" },
      status: "active",
      tags: ["decor"],
      quantity: 300,
      minOrderQuantity: 1,
      featured: false,
      brand: "Ambi",
      attributes: { color: "Warm White" },
      rating: 4.0,
    },
  ];

  // Remove old products for this seller that are no longer in our canonical seed list
  const seedTitles = products.map((p) => p.title);
  await Product.deleteMany({ seller: seller._id, title: { $nin: seedTitles } });

  for (const p of products) {
    const existing = await Product.findOne({
      title: p.title,
      seller: seller._id,
    });
    if (!existing) {
      await Product.create({ ...p, seller: seller._id });
    } else {
      // Update key fields in case seed changed
      existing.set({
        description: p.description,
        price: p.price,
        currency: p.currency,
        category: p.category,
        images: p.images,
        condition: p.condition,
        location: p.location,
        status: p.status,
        tags: p.tags,
        quantity: p.quantity,
        featured: p.featured,
        brand: (p as any).brand,
        attributes: (p as any).attributes,
        shippingOptions: (p as any).shippingOptions,
        discount: (p as any).discount ?? 0,
        minOrderQuantity: (p as any).minOrderQuantity ?? 1,
      });
      await existing.save();
    }
  }

  console.log("✅ Seed complete.");
  await mongoose.connection.close();
}

run()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
