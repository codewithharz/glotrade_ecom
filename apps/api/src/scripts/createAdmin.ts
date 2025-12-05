/*
  Create an admin user for testing the admin interface
  Run this script to create an admin user for testing the admin interface
  cd apps/api
  npm run create-admin 

  Postman:
  curl -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@afritrade.com","password":"admin123"}'
*/
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import User from "../models/User";

dotenv.config();

async function createAdmin() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists, but checking if password is properly set...");
      
      // Check if passwordHash exists
      if (!existingAdmin.passwordHash) {
        console.log("⚠️  Existing admin user has no passwordHash. Deleting and recreating...");
        await User.deleteOne({ _id: existingAdmin._id });
        console.log("✅ Old admin user deleted");
      } else {
        console.log("✅ Admin user already exists with proper password:", {
          email: existingAdmin.email,
          username: existingAdmin.username,
          role: existingAdmin.role
        });
        return;
      }
    }

    // Hash the password
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    // Create admin user
    const adminUser = await User.create({
      username: "admin",
      email: "admin@afritrade.com",
      passwordHash: passwordHash, // Use passwordHash field
      role: "admin",
      isVerified: true,
      isSuperAdmin: false,
      country: "Nigeria",
      city: "Lagos",
      reputation: 5.0,
      totalTransactions: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Admin user created successfully:", {
      id: adminUser._id,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role,
      isSuperAdmin: adminUser.isSuperAdmin
    });

    console.log("\n🎉 Admin user created successfully!");
    console.log("📧 Email: admin@afritrade.com");
    console.log("🔑 Password: admin123");
    console.log("🔐 Role: admin");
    console.log("\n💡 You can now login at /auth/login and access /admin");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

// Run the script
createAdmin(); 