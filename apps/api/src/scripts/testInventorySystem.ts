// Test script for inventory management system
import mongoose from 'mongoose';
import { InventoryService } from '../services/InventoryService';
import { Product, Order } from '../models';

async function testInventorySystem() {
  try {
    // Connect to database (you'll need to set your connection string)
    await mongoose.connect('mongodb://localhost:27017/afritrade-hub');
    console.log('Connected to database');

    const inventoryService = new InventoryService();

    // Test 1: Create a test product
    console.log('\n=== Test 1: Creating test product ===');
    const testProduct = await Product.create({
      title: 'Test Product for Inventory',
      description: 'A test product to verify inventory management',
      price: 1000,
      currency: 'NGN',
      category: 'Electronics',
      seller: new mongoose.Types.ObjectId(), // You'll need a valid user ID
      quantity: 50,
      status: 'active'
    });
    console.log('Test product created:', (testProduct as any)._id);

    // Test 2: Reserve stock
    console.log('\n=== Test 2: Reserving stock ===');
    await inventoryService.reserveStock(
      (testProduct as any)._id.toString(),
      10,
      'test-order-123'
    );
    console.log('Stock reserved: 10 units');

    // Test 3: Check updated quantity
    console.log('\n=== Test 3: Checking updated quantity ===');
    const updatedProduct = await Product.findById((testProduct as any)._id);
    console.log('Updated quantity:', updatedProduct?.quantity); // Should be 40

    // Test 4: Release stock
    console.log('\n=== Test 4: Releasing stock ===');
    await inventoryService.releaseStock(
      (testProduct as any)._id.toString(),
      5,
      'test-order-123',
      'Partial release for testing'
    );
    console.log('Stock released: 5 units');

    // Test 5: Check final quantity
    console.log('\n=== Test 5: Checking final quantity ===');
    const finalProduct = await Product.findById((testProduct as any)._id);
    console.log('Final quantity:', finalProduct?.quantity); // Should be 45

    // Test 6: Get low stock items
    console.log('\n=== Test 6: Getting low stock items ===');
    const lowStockItems = await inventoryService.getLowStockItems(10);
    console.log('Low stock items:', lowStockItems.length);

    // Test 7: Adjust stock
    console.log('\n=== Test 7: Adjusting stock ===');
    const adjustmentResult = await inventoryService.adjustStock(
      (testProduct as any)._id.toString(),
      20,
      'Adding stock for testing'
    );
    console.log('Stock adjustment result:', adjustmentResult);

    // Cleanup
    console.log('\n=== Cleanup ===');
    await Product.findByIdAndDelete((testProduct as any)._id);
    console.log('Test product deleted');

    console.log('\n✅ All inventory tests passed!');
  } catch (error) {
    console.error('❌ Inventory test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testInventorySystem();
}

export { testInventorySystem }; 