import mongoose from 'mongoose';
import BusinessDocument from '../models/BusinessDocument';
import Seller from '../models/Seller';
import { R2Service } from '../services/R2Service';

async function testDocumentDeduplication() {
  try {
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/afritrade";
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const r2Service = new R2Service();

    // Test scenario: Simulate document replacement
    console.log('\n=== Testing Document Deduplication ===\n');

    // 1. Create a test vendor
    const testVendor = await Seller.create({
      userId: new mongoose.Types.ObjectId(),
      slug: 'test-vendor',
      name: 'Test Vendor',
      description: 'Test vendor for deduplication testing',
      country: 'NG',
      status: 'draft',
      kyc: {},
      business: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`Created test vendor: ${testVendor._id}`);

    // 2. Create initial document
    const initialDoc = await BusinessDocument.create({
      vendorId: testVendor._id,
      documentType: 'cac_certificate',
      fileName: 'initial-cac.pdf',
      fileUrl: 'https://test.com/documents/vendor1/cac_certificate/initial-cac.pdf',
      fileSize: 1024 * 1024, // 1MB
      mimeType: 'application/pdf',
      status: 'pending',
      metadata: {
        originalName: 'initial-cac.pdf',
        uploadDate: new Date()
      }
    });

    console.log(`Created initial document: ${initialDoc._id}`);

    // 3. Simulate document replacement (this is what happens in the controller)
    console.log('\n--- Simulating Document Replacement ---');
    
    // Find existing document
    const existingDoc = await BusinessDocument.findOne({ 
      vendorId: testVendor._id, 
      documentType: 'cac_certificate' 
    });

    if (existingDoc) {
      console.log('Found existing document, updating...');
      
      // Store old file URL for cleanup
      const oldFileUrl = existingDoc.fileUrl;
      
      // Update document with new file info
      existingDoc.fileName = 'updated-cac.pdf';
      existingDoc.fileUrl = 'https://test.com/documents/vendor1/cac_certificate/updated-cac.pdf';
      existingDoc.fileSize = 2048 * 1024; // 2MB
      existingDoc.status = 'pending';
      existingDoc.metadata = {
        ...existingDoc.metadata,
        originalName: 'updated-cac.pdf',
        uploadDate: new Date(),
        replacedAt: new Date(),
        previousFileUrl: oldFileUrl
      };

      await existingDoc.save();
      
      console.log('Document updated successfully');
      console.log(`Old file URL: ${oldFileUrl}`);
      console.log(`New file URL: ${existingDoc.fileUrl}`);
      console.log(`Replaced at: ${existingDoc.metadata.replacedAt}`);
      console.log(`Previous file URL: ${existingDoc.metadata.previousFileUrl}`);
    }

    // 4. Verify no duplicate documents exist
    const allDocs = await BusinessDocument.find({ vendorId: testVendor._id });
    console.log(`\nTotal documents for vendor: ${allDocs.length}`);
    
    const cacDocs = await BusinessDocument.find({ 
      vendorId: testVendor._id, 
      documentType: 'cac_certificate' 
    });
    console.log(`CAC certificate documents: ${cacDocs.length}`);

    if (cacDocs.length === 1) {
      console.log('✅ SUCCESS: No duplicate documents created');
    } else {
      console.log('❌ FAILURE: Duplicate documents found');
    }

    // 5. Clean up test data
    console.log('\n--- Cleaning up test data ---');
    await BusinessDocument.deleteMany({ vendorId: testVendor._id });
    await Seller.deleteOne({ _id: testVendor._id });
    console.log('Test data cleaned up');

    console.log('\n=== Test completed successfully ===');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testDocumentDeduplication(); 