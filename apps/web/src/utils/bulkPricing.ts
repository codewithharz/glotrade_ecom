// Utility function to calculate effective price based on bulk pricing tiers
export interface BulkPricingTier {
    minQuantity: number;
    maxQuantity?: number;
    pricePerUnit?: number;
    discountPercent?: number;
}

export interface PriceCalculation {
    effectivePrice: number;
    originalPrice: number;
    savings: number;
    savingsPercent: number;
    appliedTier: BulkPricingTier | null;
}

/**
 * Calculate the effective price for a product based on quantity and bulk pricing tiers
 * @param basePrice - The base price of the product
 * @param quantity - The quantity being purchased
 * @param bulkPricing - Array of bulk pricing tiers
 * @returns Price calculation details
 */
export function calculateBulkPrice(
    basePrice: number,
    quantity: number,
    bulkPricing?: BulkPricingTier[]
): PriceCalculation {
    const result: PriceCalculation = {
        effectivePrice: basePrice,
        originalPrice: basePrice,
        savings: 0,
        savingsPercent: 0,
        appliedTier: null,
    };

    // If no bulk pricing or quantity is 0, return base price
    if (!bulkPricing || bulkPricing.length === 0 || quantity <= 0) {
        return result;
    }

    // Find the applicable tier
    const applicableTier = bulkPricing.find((tier) => {
        const meetsMin = quantity >= tier.minQuantity;
        const meetsMax = !tier.maxQuantity || quantity <= tier.maxQuantity;
        return meetsMin && meetsMax;
    });

    if (!applicableTier) {
        return result;
    }

    // Calculate effective price
    let effectivePrice = basePrice;

    if (applicableTier.pricePerUnit !== undefined && applicableTier.pricePerUnit >= 0) {
        // Use fixed price per unit
        effectivePrice = applicableTier.pricePerUnit;
    } else if (applicableTier.discountPercent !== undefined && applicableTier.discountPercent > 0) {
        // Apply percentage discount
        effectivePrice = basePrice * (1 - applicableTier.discountPercent / 100);
    }

    // Calculate savings
    const savings = basePrice - effectivePrice;
    const savingsPercent = (savings / basePrice) * 100;

    return {
        effectivePrice: Math.max(0, effectivePrice),
        originalPrice: basePrice,
        savings: Math.max(0, savings),
        savingsPercent: Math.max(0, savingsPercent),
        appliedTier: applicableTier,
    };
}

/**
 * Get all bulk pricing tiers sorted by minimum quantity
 * @param bulkPricing - Array of bulk pricing tiers
 * @returns Sorted array of tiers
 */
export function getSortedBulkPricingTiers(
    bulkPricing?: BulkPricingTier[]
): BulkPricingTier[] {
    if (!bulkPricing || bulkPricing.length === 0) {
        return [];
    }

    return [...bulkPricing].sort((a, b) => a.minQuantity - b.minQuantity);
}

/**
 * Format bulk pricing tier for display
 * @param tier - Bulk pricing tier
 * @param basePrice - Base price of the product
 * @param currency - Currency symbol
 * @returns Formatted string
 */
export function formatBulkPricingTier(
    tier: BulkPricingTier,
    basePrice: number,
    currency: string = "₦"
): string {
    const quantityRange = tier.maxQuantity
        ? `${tier.minQuantity}-${tier.maxQuantity}`
        : `${tier.minQuantity}+`;

    if (tier.pricePerUnit !== undefined && tier.pricePerUnit >= 0) {
        const savings = basePrice - tier.pricePerUnit;
        const savingsPercent = ((savings / basePrice) * 100).toFixed(0);
        return `${quantityRange} units: ${currency}${tier.pricePerUnit.toFixed(2)} each (Save ${savingsPercent}%)`;
    } else if (tier.discountPercent !== undefined && tier.discountPercent > 0) {
        const effectivePrice = basePrice * (1 - tier.discountPercent / 100);
        return `${quantityRange} units: ${tier.discountPercent}% off (${currency}${effectivePrice.toFixed(2)} each)`;
    }

    return `${quantityRange} units`;
}
