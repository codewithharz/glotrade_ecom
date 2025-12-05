import mongoose from 'mongoose';
import ProductReview from '../models/ProductReview';
import Product from '../models/Product';

// Get MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/afritrade";

async function checkReviews() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check total reviews
    const totalReviews = await ProductReview.countDocuments();
    console.log(`\nTotal reviews in database: ${totalReviews}`);

    if (totalReviews > 0) {
      // Get a sample review
      const sampleReview = await ProductReview.findOne({}).populate('product', 'title');
      console.log('\nSample review:');
      console.log('- ID:', sampleReview?._id);
      console.log('- Product:', (sampleReview?.product as any)?.title);
      console.log('- Rating:', sampleReview?.rating);
      console.log('- Comment:', sampleReview?.comment);
      console.log('- User:', sampleReview?.user);
      console.log('- Created:', sampleReview?.createdAt);

      // Get reviews by product
      const reviewsByProduct = await ProductReview.aggregate([
        {
          $group: {
            _id: '$product',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        {
          $unwind: '$productInfo'
        }
      ]);

      console.log('\nReviews by product:');
      reviewsByProduct.forEach(item => {
        console.log(`- ${item.productInfo.title}: ${item.count} reviews, avg rating: ${item.avgRating.toFixed(2)}`);
      });
    } else {
      console.log('\nNo reviews found in database.');
      console.log('This explains why products show "No reviews yet" and ratings are 0.');
    }

    // Check products with ratings
    const productsWithRatings = await Product.find({ rating: { $gt: 0 } });
    console.log(`\nProducts with ratings > 0: ${productsWithRatings.length}`);

    if (productsWithRatings.length > 0) {
      console.log('\nSample products with ratings:');
      productsWithRatings.slice(0, 5).forEach(product => {
        console.log(`- ${product.title}: ${product.rating} stars`);
      });
    }

  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
checkReviews(); 