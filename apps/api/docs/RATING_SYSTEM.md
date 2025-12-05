# Product Rating System

## Overview

The product rating system automatically calculates and maintains product ratings based on user reviews. Each product has a `rating` field that represents the average rating from all reviews.

## How It Works

1. **Product Model**: Each product has a `rating` field (0-5) that defaults to 0
2. **Review System**: Users can create, update, and delete reviews for products
3. **Automatic Updates**: When reviews are added, updated, or deleted, the product rating is automatically recalculated
4. **Real-time Display**: Product cards and listings show the current rating with star displays

## API Endpoints

### Reviews
- `GET /api/v1/market/products/:productId/reviews` - Get product reviews
- `POST /api/v1/market/products/:productId/reviews` - Create a review
- `PUT /api/v1/market/products/:productId/reviews/:reviewId` - Update a review
- `DELETE /api/v1/market/products/:productId/reviews/:reviewId` - Delete a review
- `GET /api/v1/market/reviews` - Get user's reviews

### Rating Updates

The system automatically updates product ratings when:
- A new review is added
- An existing review is updated
- A review is deleted

## Database Schema

### Product
```typescript
{
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}
```

### ProductReview
```typescript
{
  product: Schema.Types.ObjectId,  // Reference to Product
  user: Schema.Types.ObjectId,     // Reference to User
  rating: Number,                  // 1-5 rating
  comment: String,                 // Optional comment
  isVerifiedPurchase: Boolean     // Whether user bought the product
}
```

## Scripts

### Update All Product Ratings
```bash
npm run update:ratings
```
This script recalculates and updates ratings for all existing products based on their current reviews.

### Test Rating System
```bash
npm run test:ratings
```
This script tests the rating system by checking if a product's rating matches the calculated average from its reviews.

## Frontend Integration

### ProductCard Component
The ProductCard component displays ratings using the `StarRating` component:
```tsx
{typeof p.rating === 'number' ? (
  <span className="inline-flex items-center gap-1 text-black">
    <StarRating value={p.rating} />
    <span>{p.rating.toFixed(1)}</span>
  </span>
) : null}
```

### StarRating Component
The StarRating component renders filled and unfilled stars based on the rating value:
```tsx
function StarRating({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const widthPct = (clamped / 5) * 100;
  // ... star rendering logic
}
```

## Troubleshooting

### Ratings Not Updating
1. Check if reviews exist for the product
2. Verify the `updateProductRating` method is being called
3. Check database for any errors in the rating update process

### Rating Calculation Issues
1. Ensure all reviews have valid rating values (1-5)
2. Check if the ProductReview model is properly indexed
3. Verify the product reference in reviews is correct

## Performance Considerations

- Product ratings are stored in the Product document for fast access
- Ratings are updated asynchronously when reviews change
- The system uses database indexes for efficient review queries
- Consider implementing caching for frequently accessed ratings

## Future Enhancements

- Weighted ratings based on verified purchases
- Rating decay over time
- Rating confidence scores
- Bulk rating updates for performance 