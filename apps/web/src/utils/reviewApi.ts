import { API_BASE_URL } from './api';
import { ProductReview, ReviewResponse, CreateReviewRequest } from '@/types/review';

// Get auth header for API calls
function getAuthHeader(): Record<string, string> {
  try {
    const token = localStorage.getItem('afritrade:auth');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// Fetch reviews for a product
export async function fetchProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewResponse> {
  const url = new URL(`/api/v1/market/products/${productId}/reviews`, API_BASE_URL);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString(), {
    headers: { ...getAuthHeader() },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.status}`);
  }

  return response.json();
}

// Create a new review
export async function createProductReview(
  productId: string,
  reviewData: CreateReviewRequest
): Promise<ProductReview> {
  const response = await fetch(
    new URL(`/api/v1/market/products/${productId}/reviews`, API_BASE_URL).toString(),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(reviewData)
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to create review: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// Update an existing review
export async function updateProductReview(
  productId: string,
  reviewId: string,
  reviewData: CreateReviewRequest
): Promise<ProductReview> {
  const response = await fetch(
    new URL(`/api/v1/market/products/${productId}/reviews/${reviewId}`, API_BASE_URL).toString(),
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(reviewData)
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update review: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// Delete a review
export async function deleteProductReview(
  productId: string,
  reviewId: string
): Promise<void> {
  const response = await fetch(
    new URL(`/api/v1/market/products/${productId}/reviews/${reviewId}`, API_BASE_URL).toString(),
    {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete review: ${response.status}`);
  }
}

// Check if user has already reviewed this product
export async function checkUserReview(
  productId: string
): Promise<ProductReview | null> {
  try {
    const reviews = await fetchProductReviews(productId, 1, 100);
    const user = JSON.parse(localStorage.getItem('afritrade:user') || '{}');
    const userId = user?.id || user?._id;
    
    if (!userId) return null;
    
    // Handle nested data structure
    let reviewsArray: ProductReview[] = [];
    if (reviews?.data) {
      if (Array.isArray(reviews.data)) {
        reviewsArray = reviews.data;
      } else if ((reviews.data as any).reviews && Array.isArray((reviews.data as any).reviews)) {
        reviewsArray = (reviews.data as any).reviews;
      }
    }
    
    const userReview = reviewsArray.find(review => review.user._id === userId);
    return userReview || null;
  } catch {
    return null;
  }
} 