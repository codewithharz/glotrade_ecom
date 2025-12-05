import mongoose from 'mongoose';
import Product from '../models/Product';
import ProductReview from '../models/ProductReview';

// Get MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/afritrade";

async function updateAllProductRatings() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        const reviews = await ProductReview.find({ product: product._id });
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;
        
        await Product.findByIdAndUpdate(product._id, { rating: averageRating });
        updatedCount++;
        
        if (updatedCount % 10 === 0) {
          console.log(`Updated ${updatedCount} products...`);
        }
      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error);
        errorCount++;
      }
    }

    console.log(`\nUpdate complete!`);
    console.log(`Successfully updated: ${updatedCount} products`);
    console.log(`Errors: ${errorCount} products`);
    
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateAllProductRatings(); 