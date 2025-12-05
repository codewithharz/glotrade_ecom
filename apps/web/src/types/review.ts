export interface ProductReview {
  _id: string;
  product: string;
  user: {
    _id: string;
    username: string;
    reputation?: number;
  };
  rating: number;
  comment?: string;
  images?: string[];
  likes: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  status: string;
  data: ProductReview[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
} 