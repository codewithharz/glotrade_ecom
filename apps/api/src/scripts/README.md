# Wallet System Setup Script

This script sets up the wallet system for all users in your database. It works with both **Local MongoDB (Compass)** and **MongoDB Atlas**.

## Usage

```bash
cd apps/api
npx ts-node src/scripts/setupWalletSystem.ts
```

## Environment Setup

### For Local MongoDB (Compass)
1. Make sure MongoDB is running locally
2. Set `MONGODB_URI` in your `.env` file or use the default:
   ```
   MONGODB_URI=mongodb://localhost:27017/afritrade
   ```

### For MongoDB Atlas
1. Get your Atlas connection string from the Atlas dashboard
2. Set `MONGODB_URI` in your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/afritrade?retryWrites=true&w=majority
   ```
3. Make sure your IP address is whitelisted in Atlas
4. Comment out or remove the local MongoDB URI

## What the Script Does

1. **Creates `walletId`** for users who don't have one
2. **Sets `isWalletPublic: true`** for all users
3. **Sets `walletVisibility: "public"`** for all users
4. **Creates `displayName`** if missing
5. **Verifies complete setup** for all users
6. **Provides detailed reporting**

## Example Output

```
🔌 Connecting to MongoDB Atlas...
📍 URI: mongodb+srv://***:***@cluster.mongodb.net/afritrade
✅ Connected to MongoDB Atlas
🚀 Starting comprehensive wallet system setup...

📋 STEP 1: Found 0 users without walletId
📋 STEP 2: Ensuring wallet fields for all users with walletId...
✅ Explicitly set wallet fields for 10 users
📋 STEP 3: Verification...

🔍 Sample user verification (test4@gmail.com):
  walletId: WAL-3350-NQ79
  isWalletPublic: true
  walletVisibility: public
  displayName: test4

📊 WALLET SYSTEM SETUP SUMMARY:
✅ Users with walletId created: 0
❌ WalletId creation errors: 0
✅ Users with complete wallet setup: 10
⚠️  Users with incomplete setup: 0
📝 Total users processed: 10

🎉 SUCCESS: All users have complete wallet setup!
💡 Users should log out and log back in to get fresh JWT tokens.
```

## Troubleshooting

### Connection Errors
- **For Local MongoDB**: Make sure MongoDB is running
- **For Atlas**: Check your connection string and IP whitelist
- **Verify MONGODB_URI** in your `.env` file

### Switching Between Environments
1. **To use Atlas**: Update `MONGODB_URI` in `.env` to your Atlas string
2. **To use Local**: Update `MONGODB_URI` in `.env` to local string
3. **Run the script**: It will automatically detect which environment you're using
