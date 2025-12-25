import mongoose, { Document, Schema } from "mongoose";

/**
 * GDC = Global Digital Cluster
 * A group of 10 TPIAs that trade together in synchronized cycles
 */
export interface IGDC extends Document {
    // Identification
    gdcNumber: number; // 10, 20, 30, 40, etc.
    gdcId: string; // Formatted: "GDC-{number}" (e.g., "GDC-10")

    // Capacity
    capacity: number; // Always 10 for standard GDC
    currentFill: number; // How many TPIAs assigned (0-10)
    isFull: boolean; // true when currentFill === capacity

    // TPIA Members
    tpiaIds: Schema.Types.ObjectId[]; // Array of TPIA references
    tpiaNumbers: number[]; // Quick reference to TPIA numbers

    // Trade Cycle Status
    status: "forming" | "ready" | "active" | "completed" | "suspended";
    currentCycleId?: Schema.Types.ObjectId; // Active trade cycle
    cyclesCompleted: number; // Number of 37-day cycles completed
    nextCycleStartDate?: Date;
    lastCycleEndDate?: Date;

    // Financial Aggregates
    totalCapital: number; // Sum of all TPIA purchase prices
    totalProfitGenerated: number; // Cumulative profits across all cycles
    averageROI: number; // Average return on investment %

    // Commodity Allocation
    primaryCommodity: string; // Main commodity type
    commodityMix?: {
        type: string;
        percentage: number;
    }[];

    // Formation Timeline
    formedAt?: Date; // When GDC reached full capacity
    firstCycleStartedAt?: Date;

    // Admin Controls
    isActive: boolean;
    suspendedAt?: Date;
    suspensionReason?: string;
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

const gdcSchema = new Schema<IGDC>(
    {
        gdcNumber: {
            type: Number,
            required: true,
            unique: true,
            index: true
        },
        gdcId: {
            type: String,
            unique: true,
            index: true
        },
        capacity: {
            type: Number,
            required: true,
            default: 10,
            min: 10,
            max: 10 // Standard GDC always has 10 slots
        },
        currentFill: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 10
        },
        isFull: {
            type: Boolean,
            default: false,
            index: true
        },
        tpiaIds: [{
            type: Schema.Types.ObjectId,
            ref: "TPIA"
        }],
        tpiaNumbers: [{
            type: Number
        }],
        status: {
            type: String,
            enum: ["forming", "ready", "active", "completed", "suspended"],
            default: "forming",
            index: true
        },
        currentCycleId: {
            type: Schema.Types.ObjectId,
            ref: "TradeCycle"
        },
        cyclesCompleted: {
            type: Number,
            default: 0,
            min: 0
        },
        nextCycleStartDate: Date,
        lastCycleEndDate: Date,
        totalCapital: {
            type: Number,
            default: 0,
            min: 0
        },
        totalProfitGenerated: {
            type: Number,
            default: 0,
            min: 0
        },
        averageROI: {
            type: Number,
            default: 0,
            min: 0
        },
        primaryCommodity: {
            type: String,
            required: true
        },
        commodityMix: [{
            type: {
                type: String,
                required: true
            },
            percentage: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            }
        }],
        formedAt: Date,
        firstCycleStartedAt: Date,
        isActive: {
            type: Boolean,
            default: true
        },
        suspendedAt: Date,
        suspensionReason: String,
        notes: String
    },
    { timestamps: true }
);

// Pre-save middleware to generate GDC ID and update status
gdcSchema.pre("save", async function (next) {
    if (this.isNew) {
        this.gdcId = `GDC-${this.gdcNumber}`;
    }

    // Update isFull status
    this.isFull = this.currentFill >= this.capacity;

    // Auto-update status based on fill
    if (this.isFull && this.status === "forming") {
        this.status = "ready";
        this.formedAt = new Date();
    }

    next();
});

// Indexes for efficient querying
gdcSchema.index({ status: 1, isFull: 1 });
gdcSchema.index({ nextCycleStartDate: 1 });
gdcSchema.index({ createdAt: -1 });

export default mongoose.model<IGDC>("GDC", gdcSchema);
