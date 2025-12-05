export type ProductCardData = {
	_id: string;
	title: string;
	price: number;
	currency: string;
	images?: string[];

	featured?: boolean;
	brand?: string;
	discount?: number;
	rating?: number;
	shippingOptions?: { method: string; cost: number; estimatedDays: number }[];
	seller?: { username?: string; reputation?: number; isVerified?: boolean };
	minOrderQuantity?: number;
	bulkPricing?: Array<{
		minQuantity: number;
		maxQuantity?: number;
		pricePerUnit?: number;
		discountPercent?: number;
	}>;
};

