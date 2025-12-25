import mongoose, { Document, Schema } from "mongoose";

/**
 * Commodity - Tracks physical commodity backing for TPIAs
 * Represents actual goods stored in warehouses
 */
export interface ICommodity extends Document {
    // Identification
    commodityId: string; // Unique commodity batch ID

    // Type & Classification
    type: string; // e.g., "Rice", "Sugar", "Wheat", "Corn"
    commodityType?: string; // Alias for type
    grade?: string; // Quality grade
    variety?: string; // Specific variety
    origin?: string; // Country/region of origin

    // Quantity
    quantity: number;
    unit: string; // "bags", "tons", "kg", etc.
    unitWeight?: number; // Weight per unit
    totalWeight?: number; // Total weight

    // Pricing
    purchasePrice: number; // Price per unit at purchase
    totalPurchaseValue: number; // Total value
    currentMarketPrice: number; // Current market price per unit
    pricePerUnit?: number; // Alias for currentMarketPrice
    currentMarketValue: number; // Current total value
    lastPriceUpdate?: Date;
    updatedBy?: Schema.Types.ObjectId;

    // NAV Contribution
    navPerUnit: number; // Net Asset Value per unit
    lastNavUpdate: Date;

    // Warehouse Storage
    warehouseId?: Schema.Types.ObjectId;
    warehouseLocation: string;
    warehouseCertificateNumber?: string;
    storageSection?: string; // Specific location in warehouse

    // Allocation to TPIAs
    allocatedToTPIAs: {
        tpiaId: Schema.Types.ObjectId;
        tpiaNumber: number;
        quantityAllocated: number;
        allocationDate: Date;
    }[];
    totalAllocated: number;
    availableQuantity: number;

    // Quality & Condition
    condition: "excellent" | "good" | "fair" | "poor" | "damaged";
    lastInspectionDate?: Date;
    nextInspectionDate?: Date;
    qualityReports?: {
        reportDate: Date;
        inspector: string;
        rating: string;
        notes: string;
    }[];

    // Lifecycle
    status: "in_stock" | "allocated" | "in_trade" | "sold" | "damaged" | "expired";
    receivedDate: Date;
    expiryDate?: Date;
    soldDate?: Date;

    // Trade Cycle Association
    currentCycleId?: Schema.Types.ObjectId;
    tradeCycles: Schema.Types.ObjectId[]; // History of cycles this commodity was used in

    // Insurance
    insured: boolean;
    insuranceId?: Schema.Types.ObjectId;
    insuranceValue?: number;

    // Documents
    documents: {
        purchaseInvoice?: string;
        qualityCertificate?: string;
        warehouseReceipt?: string;
        inspectionReports?: string[];
    };

    // Supplier Information
    supplier?: {
        name: string;
        contact: string;
        invoiceNumber: string;
    };

    // Admin
    addedBy?: Schema.Types.ObjectId;
    verifiedBy?: Schema.Types.ObjectId;
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

const commoditySchema = new Schema<ICommodity>(
    {
        commodityId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        type: {
            type: String,
            required: true,
            index: true
        },
        commodityType: String,
        grade: String,
        variety: String,
        origin: String,
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        unit: {
            type: String,
            required: true
        },
        unitWeight: Number,
        totalWeight: Number,
        purchasePrice: {
            type: Number,
            required: true,
            min: 0
        },
        totalPurchaseValue: {
            type: Number,
            required: true,
            min: 0
        },
        currentMarketPrice: {
            type: Number,
            required: true,
            min: 0
        },
        currentMarketValue: {
            type: Number,
            required: true,
            min: 0
        },
        pricePerUnit: Number,
        lastPriceUpdate: Date,
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        navPerUnit: {
            type: Number,
            required: true,
            min: 0
        },
        lastNavUpdate: {
            type: Date,
            required: true,
            default: Date.now
        },
        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: "Warehouse"
        },
        warehouseLocation: {
            type: String,
            required: true
        },
        warehouseCertificateNumber: String,
        storageSection: String,
        allocatedToTPIAs: [{
            tpiaId: {
                type: Schema.Types.ObjectId,
                ref: "TPIA",
                required: true
            },
            tpiaNumber: {
                type: Number,
                required: true
            },
            quantityAllocated: {
                type: Number,
                required: true,
                min: 0
            },
            allocationDate: {
                type: Date,
                required: true,
                default: Date.now
            }
        }],
        totalAllocated: {
            type: Number,
            default: 0,
            min: 0
        },
        availableQuantity: {
            type: Number,
            required: true,
            min: 0
        },
        condition: {
            type: String,
            enum: ["excellent", "good", "fair", "poor", "damaged"],
            default: "good"
        },
        lastInspectionDate: Date,
        nextInspectionDate: Date,
        qualityReports: [{
            reportDate: {
                type: Date,
                required: true
            },
            inspector: {
                type: String,
                required: true
            },
            rating: {
                type: String,
                required: true
            },
            notes: String
        }],
        status: {
            type: String,
            enum: ["in_stock", "allocated", "in_trade", "sold", "damaged", "expired"],
            default: "in_stock",
            index: true
        },
        receivedDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        expiryDate: Date,
        soldDate: Date,
        currentCycleId: {
            type: Schema.Types.ObjectId,
            ref: "TradeCycle"
        },
        tradeCycles: [{
            type: Schema.Types.ObjectId,
            ref: "TradeCycle"
        }],
        insured: {
            type: Boolean,
            default: false
        },
        insuranceId: {
            type: Schema.Types.ObjectId,
            ref: "Insurance"
        },
        insuranceValue: Number,
        documents: {
            purchaseInvoice: String,
            qualityCertificate: String,
            warehouseReceipt: String,
            inspectionReports: [String]
        },
        supplier: {
            name: String,
            contact: String,
            invoiceNumber: String
        },
        addedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        notes: String
    },
    { timestamps: true }
);

// Pre-save middleware to calculate available quantity
commoditySchema.pre("save", function (next) {
    this.availableQuantity = this.quantity - this.totalAllocated;

    // Calculate total market value
    this.currentMarketValue = this.currentMarketPrice * this.quantity;

    next();
});

// Indexes
commoditySchema.index({ type: 1, status: 1 });
commoditySchema.index({ warehouseLocation: 1 });
commoditySchema.index({ status: 1, availableQuantity: 1 });
commoditySchema.index({ expiryDate: 1 });
commoditySchema.index({ createdAt: -1 });

export default mongoose.model<ICommodity>("Commodity", commoditySchema);
