import mongoose from 'mongoose';
import Product from '../models/Product';
import ProductReview from '../models/ProductReview';

// Get MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/afritrade";

async function testRatingSystem() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a product with reviews
    const product = await Product.findOne({});
    if (!product) {
      console.log('No products found in database');
      return;
    }

    console.log(`\nTesting product: ${product.title}`);
    console.log(`Current rating: ${product.rating || 0}`);

    // Get reviews for this product
    const reviews = await ProductReview.find({ product: product._id });
    console.log(`Number of reviews: ${reviews.length}`);

    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      console.log(`Calculated average rating: ${averageRating.toFixed(2)}`);
      
      if (Math.abs((product.rating || 0) - averageRating) < 0.01) {
        console.log('✅ Rating is correct!');
      } else {
        console.log('❌ Rating is incorrect!');
        console.log(`Expected: ${averageRating.toFixed(2)}, Got: ${product.rating || 0}`);
      }
    } else {
      console.log('No reviews found for this product');
    }

    // Test the calculateRating method
    const calculatedRating = await product.calculateRating();
    console.log(`\nMethod calculateRating() result: ${calculatedRating.toFixed(2)}`);

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test
testRatingSystem(); 