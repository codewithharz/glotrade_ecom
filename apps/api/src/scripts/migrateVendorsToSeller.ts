import mongoose from 'mongoose';
import User from '../models/User';
import Seller from '../models/Seller';
import dotenv from 'dotenv';

dotenv.config();

// Migration script to create Seller collection documents for existing vendors
// This ensures backward compatibility while enabling admin approval workflow

async function migrateVendorsToSeller() {
  try {
    console.log('🔄 Starting vendor migration to Seller collection...');

    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/glotrade_ecom";
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database');

    // Find all users with role 'seller' who have store data
    const existingVendors = await User.find({
      role: 'seller',
      store: { $exists: true, $ne: null }
    }).select('_id username email store country profileImage');

    console.log(`📊 Found ${existingVendors.length} existing vendors to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const vendor of existingVendors) {
      try {
        // Check if Seller document already exists
        const existingSeller = await Seller.findOne({ userId: vendor._id });

        if (existingSeller) {
          console.log(`⏭️  Skipping ${vendor.username} - Seller document already exists`);
          skippedCount++;
          continue;
        }

        // Create slug from store name
        const slug = String(vendor.store?.name || vendor.username)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        // Create Seller document
        const sellerDoc = await Seller.create({
          userId: vendor._id,
          slug,
          name: vendor.store?.name || vendor.username,
          description: vendor.store?.description || '',
          logoUrl: vendor.store?.logoUrl || vendor.profileImage || '',
          country: vendor.country || 'NG',
          status: 'approved', // Existing vendors are considered approved
          currencies: vendor.country === 'NG' ? ['NGN'] : ['XOF'],
          kyc: {
            businessType: 'individual', // Default for existing vendors
            businessAddress: '',
            businessPhone: '', // User store doesn't have phone field
            businessEmail: vendor.email
          },
          business: {
            industry: '',
            payoutProvider: vendor.store?.payout?.provider || 'manual'
          },
          payoutMethods: vendor.store?.payout ? [{
            provider: vendor.store.payout.provider,
            recipientCode: vendor.store.payout.recipientCode,
            country: vendor.country || 'NG',
            currency: vendor.country === 'NG' ? 'NGN' : 'XOF'
          }] : []
        });

        console.log(`✅ Migrated ${vendor.username} to Seller collection (ID: ${sellerDoc._id})`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Failed to migrate ${vendor.username}:`, error);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`📈 Total vendors found: ${existingVendors.length}`);
    console.log(`✅ Successfully migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped (already existed): ${skippedCount}`);
    console.log(`❌ Failed: ${existingVendors.length - migratedCount - skippedCount}`);

    // Verify migration
    const totalSellers = await Seller.countDocuments();
    const totalVendorUsers = await User.countDocuments({ role: 'seller' });

    console.log('\n🔍 Verification:');
    console.log(`📊 Total Seller documents: ${totalSellers}`);
    console.log(`👥 Total vendor users: ${totalVendorUsers}`);

    if (totalSellers >= totalVendorUsers) {
      console.log('✅ Migration successful - all vendors now have Seller documents');
    } else {
      console.log('⚠️  Some vendors may still be missing Seller documents');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateVendorsToSeller()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migrateVendorsToSeller; 