/*
  Setup wallet system for users
  This script works with both Local MongoDB (Compass) and MongoDB Atlas
  
  USAGE:
  cd /Users/harz/harz/afritrade-hub/apps/api
  npx ts-node src/scripts/setupWalletSystem.ts
  
  ENVIRONMENT SETUP:
  
  REQUIRED: Set MONGODB_URI in your .env file (no default provided)
  
  For Local MongoDB (Compass):
  - Make sure MongoDB is running locally
  - Set MONGODB_URI=mongodb://localhost:27017/afritrade
  
  For MongoDB Atlas:
  - Set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/afritrade
  - Make sure your IP is whitelisted in Atlas
  
  The script will automatically detect which environment you're using.
*/


import mongoose from "mongoose";
import User from "../models/User";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Wallet ID generation function (same as in User model)
function generateWalletId(): string {
  const prefix = "WAL";
  const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const letters = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${numbers}-${letters}`;
}

async function setupWalletSystem() {
  try {
    // Connect to MongoDB - requires explicit MONGODB_URI
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error("❌ MONGODB_URI environment variable is required!");
      console.log("\n💡 Please set MONGODB_URI in your .env file:");
      console.log("   • For Local MongoDB: MONGODB_URI=mongodb://localhost:27017/afritrade");
      console.log("   • For Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/afritrade");
      process.exit(1);
    }
    
    // Detect if using Atlas or local
    const isAtlas = mongoUri.includes('mongodb+srv://') || mongoUri.includes('atlas');
    const dbType = isAtlas ? 'MongoDB Atlas' : 'Local MongoDB (Compass)';
    
    console.log(`🔌 Connecting to ${dbType}...`);
    console.log(`📍 URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
    
    // Connection options for better Atlas compatibility
    const connectionOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };

    await mongoose.connect(mongoUri, connectionOptions);
    console.log(`✅ Connected to ${dbType}`);

    console.log("🚀 Starting comprehensive wallet system setup...\n");

    // STEP 1: Find users without walletId
    const usersWithoutWalletId = await User.find({ 
      walletId: { $exists: false } 
    });

    console.log(`📋 STEP 1: Found ${usersWithoutWalletId.length} users without walletId`);

    let walletIdCount = 0;
    let walletIdErrors = 0;

    // Create walletId for users who don't have one
    for (const user of usersWithoutWalletId) {
      try {
        let walletId;
        let attempts = 0;
        const maxAttempts = 10;
        
        // Ensure unique wallet ID
        do {
          walletId = generateWalletId();
          attempts++;
          const existingUser = await User.findOne({ walletId });
          if (!existingUser) break;
        } while (attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
          console.error(`❌ Failed to generate unique walletId for user ${user.email} after ${maxAttempts} attempts`);
          walletIdErrors++;
          continue;
        }
        
        // Update user with walletId and wallet-related fields
        const updateData: any = { 
          walletId,
          isWalletPublic: true,
          walletVisibility: "public"
        };
        
        // Set displayName if not already set
        if (!user.displayName) {
          updateData.displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        }
        
        await User.updateOne(
          { _id: user._id },
          { $set: updateData }
        );
        
        console.log(`✅ Created walletId ${walletId} for user ${user.email}`);
        walletIdCount++;
        
      } catch (error) {
        console.error(`❌ Error creating walletId for user ${user.email}:`, error);
        walletIdErrors++;
      }
    }

    // STEP 2: Ensure all users with walletId have proper wallet fields
    console.log(`\n📋 STEP 2: Ensuring wallet fields for all users with walletId...`);
    
    const result = await User.updateMany(
      { walletId: { $exists: true } },
      { 
        $set: { 
          isWalletPublic: true,
          walletVisibility: "public"
        }
      }
    );

    console.log(`✅ Explicitly set wallet fields for ${result.modifiedCount} users`);

    // STEP 3: Verify setup
    console.log(`\n📋 STEP 3: Verification...`);
    
    const allUsers = await User.find({ walletId: { $exists: true } });
    let completeUsers = 0;
    let incompleteUsers = 0;

    for (const user of allUsers) {
      const hasWalletId = !!user.walletId;
      const hasIsWalletPublic = user.isWalletPublic === true;
      const hasWalletVisibility = user.walletVisibility === "public";
      const hasDisplayName = !!user.displayName;

      if (hasWalletId && hasIsWalletPublic && hasWalletVisibility && hasDisplayName) {
        completeUsers++;
      } else {
        incompleteUsers++;
        console.log(`⚠️  Incomplete setup for ${user.email}:`, {
          walletId: hasWalletId,
          isWalletPublic: hasIsWalletPublic,
          walletVisibility: hasWalletVisibility,
          displayName: hasDisplayName
        });
      }
    }

    // STEP 4: Show sample user
    const sampleUser = await User.findOne({ email: "test4@gmail.com" });
    if (sampleUser) {
      console.log(`\n🔍 Sample user verification (test4@gmail.com):`);
      console.log(`  walletId: ${sampleUser.walletId}`);
      console.log(`  isWalletPublic: ${sampleUser.isWalletPublic}`);
      console.log(`  walletVisibility: ${sampleUser.walletVisibility}`);
      console.log(`  displayName: ${sampleUser.displayName}`);
    }

    // Final summary
    console.log(`\n📊 WALLET SYSTEM SETUP SUMMARY:`);
    console.log(`✅ Users with walletId created: ${walletIdCount}`);
    console.log(`❌ WalletId creation errors: ${walletIdErrors}`);
    console.log(`✅ Users with complete wallet setup: ${completeUsers}`);
    console.log(`⚠️  Users with incomplete setup: ${incompleteUsers}`);
    console.log(`📝 Total users processed: ${allUsers.length}`);
    
    if (incompleteUsers === 0) {
      console.log(`\n🎉 SUCCESS: All users have complete wallet setup!`);
      console.log(`💡 Users should log out and log back in to get fresh JWT tokens.`);
    } else {
      console.log(`\n⚠️  WARNING: Some users have incomplete setup. Check the details above.`);
    }

  } catch (error) {
    console.error("❌ Wallet system setup failed:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.log("\n💡 Connection Error Tips:");
        console.log("   • For Local MongoDB: Make sure MongoDB is running");
        console.log("   • For Atlas: Check your connection string and IP whitelist");
        console.log("   • Verify MONGODB_URI in your .env file");
      }
    }
  } finally {
    try {
      await mongoose.disconnect();
      console.log("\n🔌 Disconnected from MongoDB");
    } catch (disconnectError) {
      console.log("\n⚠️  Warning: Error during disconnect (this is usually safe to ignore)");
    }
  }
}

// Run the comprehensive setup
if (require.main === module) {
  setupWalletSystem()
    .then(() => {
      console.log("\n✅ Wallet system setup completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Setup failed:", error);
      process.exit(1);
    });
}

export { setupWalletSystem };
