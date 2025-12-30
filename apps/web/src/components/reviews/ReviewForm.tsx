"use client";
import { useState } from "react";
import { Star, X, Send, CheckCircle } from "lucide-react";
import { ReviewFormData } from "@/types/review";
import { createProductReview, updateProductReview } from "@/utils/reviewApi";
import { translate, Locale } from "@/utils/i18n";

interface ReviewFormProps {
  productId: string;
  productTitle: string;
  onReviewSubmitted: () => void;
  onClose: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string;
  };
  orderInfo?: {
    orderId: string;
    isVerifiedPurchase: boolean;
  };
  locale: Locale;
}

export default function ReviewForm({
  productId,
  productTitle,
  onReviewSubmitted,
  onClose,
  existingReview,
  orderInfo,
  locale
}: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: existingReview?.rating || 0,
    comment: existingReview?.comment || ""
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating === 0) {
      setError(translate(locale, "reviews.form.ratingError"));
      return;
    }

    if (!formData.comment.trim()) {
      setError(translate(locale, "reviews.form.commentError"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (existingReview?.id) {
        // Update existing review
        await updateProductReview(productId, existingReview.id, {
          rating: formData.rating,
          comment: formData.comment.trim()
        });
      } else {
        // Create new review
        await createProductReview(productId, {
          rating: formData.rating,
          comment: formData.comment.trim()
        });
      }

      onReviewSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message || translate(locale, "reviews.form.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!existingReview;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-2 sm:p-4 bg-black/50">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 mt-44 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {isEditing ? translate(locale, "reviews.form.titleEdit") : translate(locale, "reviews.form.titleWrite")}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={18} className="text-neutral-500 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Product Info */}
          <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            {translate(locale, "reviews.form.reviewing")} <span className="font-medium text-neutral-800 dark:text-neutral-200">{productTitle}</span>
            {orderInfo && (
              <div className="mt-2 ml-3 sm:ml-0 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-emerald-100 text-emerald-800 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-medium">
                <CheckCircle size={10} className="sm:w-3 sm:h-3" /> {translate(locale, "reviews.form.verifiedPurchase")} • {translate(locale, "reviews.form.order")} {orderInfo.orderId.slice(-6)}
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {translate(locale, "reviews.form.ratingLabel")} *
            </label>
            <div className="flex items-center gap-1 sm:gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1.5 sm:p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    size={20}
                    className={`sm:w-6 sm:h-6 ${star <= (hoveredRating || formData.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-neutral-300 dark:text-neutral-600"
                      }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-500 mt-1">
              {formData.rating > 0 && (
                <span className="text-yellow-600">
                  {formData.rating === 1 && translate(locale, "reviews.rating.poor")}
                  {formData.rating === 2 && translate(locale, "reviews.rating.fair")}
                  {formData.rating === 3 && translate(locale, "reviews.rating.good")}
                  {formData.rating === 4 && translate(locale, "reviews.rating.veryGood")}
                  {formData.rating === 5 && translate(locale, "reviews.rating.excellent")}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {translate(locale, "reviews.form.commentLabel")} *
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder={translate(locale, "reviews.form.placeholder")}
              rows={4}
              className="w-full px-2.5 sm:px-3 py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-xs sm:text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2.5 sm:p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {translate(locale, "reviews.form.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {translate(locale, "reviews.form.submitting")}
                </>
              ) : (
                <>
                  <Send size={14} className="sm:w-4 sm:h-4" />
                  {isEditing ? translate(locale, "reviews.form.update") : translate(locale, "reviews.form.submit")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 