#!/usr/bin/env node
/**
 * Safe ATH Wallet Cleanup Script
 * 
 * This script safely removes ATH wallets and transactions from the database.
 * It performs the following steps:
 * 1. Checks for ATH wallets and transactions
 * 2. Creates a backup of the data
 * 3. Deletes ATH wallets (only if balance is 0)
 * 4. Deletes ATH transactions
 * 
 * Usage:
 *   node scripts/cleanup-ath-wallets.js [--dry-run] [--force]
 * 
 * Options:
 *   --dry-run  Show what would be deleted without actually deleting
 *   --force    Delete ATH wallets even if they have a balance (USE WITH CAUTION!)
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/afritrade';

async function cleanupATHWallets() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Wallet = mongoose.model('Wallet', new mongoose.Schema({}, { strict: false, collection: 'wallets' }));
    const WalletTransaction = mongoose.model('WalletTransaction', new mongoose.Schema({}, { strict: false, collection: 'wallettransactions' }));

    // Step 1: Check for ATH wallets
    console.log('📊 Checking for ATH wallets...');
    const athWallets = await Wallet.find({ currency: 'ATH' }).lean();
    const athWalletCount = athWallets.length;
    
    console.log(`Found ${athWalletCount} ATH wallet(s)\n`);

    if (athWalletCount === 0) {
      console.log('✅ No ATH wallets found. Nothing to clean up!');
      await mongoose.disconnect();
      return;
    }

    // Display wallet details
    console.log('ATH Wallets Details:');
    console.log('─'.repeat(80));
    let totalBalance = 0;
    let walletsWithBalance = 0;

    athWallets.forEach((w, i) => {
      const balance = w.balance || 0;
      totalBalance += balance;
      if (balance > 0) walletsWithBalance++;

      console.log(`${i + 1}. Wallet ID: ${w._id}`);
      console.log(`   User ID: ${w.userId}`);
      console.log(`   Balance: ${balance} (in kobo)`);
      console.log(`   Status: ${w.status}`);
      console.log(`   Created: ${w.createdAt}`);
      console.log('');
    });

    console.log('─'.repeat(80));
    console.log(`Total ATH Balance: ${totalBalance} (in kobo)`);
    console.log(`Wallets with balance > 0: ${walletsWithBalance}\n`);

    // Check for ATH transactions
    console.log('📊 Checking for ATH transactions...');
    const athTxCount = await WalletTransaction.countDocuments({ currency: 'ATH' });
    console.log(`Found ${athTxCount} ATH transaction(s)\n`);

    // Safety check
    if (walletsWithBalance > 0 && !isForce) {
      console.log('⚠️  WARNING: Some ATH wallets have a non-zero balance!');
      console.log('   To delete these wallets, use the --force flag.');
      console.log('   This will permanently delete wallet data with balances.');
      console.log('\n   Recommended: Manually review and migrate balances first.\n');
      await mongoose.disconnect();
      return;
    }

    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
      console.log('Would delete:');
      console.log(`  - ${athWalletCount} ATH wallet(s)`);
      console.log(`  - ${athTxCount} ATH transaction(s)\n`);
      await mongoose.disconnect();
      return;
    }

    // Step 2: Create backup
    console.log('💾 Creating backup...');
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `ath-wallets-backup-${timestamp}.json`);

    const athTransactions = await WalletTransaction.find({ currency: 'ATH' }).lean();
    
    const backup = {
      timestamp: new Date().toISOString(),
      wallets: athWallets,
      transactions: athTransactions,
      stats: {
        walletCount: athWalletCount,
        transactionCount: athTxCount,
        totalBalance
      }
    };

    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup created: ${backupFile}\n`);

    // Step 3: Delete ATH transactions
    console.log('🗑️  Deleting ATH transactions...');
    const txDeleteResult = await WalletTransaction.deleteMany({ currency: 'ATH' });
    console.log(`✅ Deleted ${txDeleteResult.deletedCount} ATH transaction(s)\n`);

    // Step 4: Delete ATH wallets
    console.log('🗑️  Deleting ATH wallets...');
    const walletDeleteResult = await Wallet.deleteMany({ currency: 'ATH' });
    console.log(`✅ Deleted ${walletDeleteResult.deletedCount} ATH wallet(s)\n`);

    console.log('─'.repeat(80));
    console.log('✅ Cleanup completed successfully!');
    console.log(`   Backup saved to: ${backupFile}`);
    console.log('─'.repeat(80));

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the cleanup
console.log('🧹 ATH Wallet Cleanup Script');
console.log('─'.repeat(80));
if (isDryRun) {
  console.log('Mode: DRY RUN (no changes will be made)');
} else if (isForce) {
  console.log('Mode: FORCE (will delete wallets with balances)');
} else {
  console.log('Mode: SAFE (will only delete wallets with 0 balance)');
}
console.log('─'.repeat(80));
console.log('');

cleanupATHWallets();
