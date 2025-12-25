import mongoose, { Document, Schema } from "mongoose";

/**
 * CommodityType - Defined by Admin to populate frontend selection options
 */
export interface ICommodityType extends Document {
    name: string;        // "Rice"
    label: string;       // "Rice"
    icon: string;        // "🌾"
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const commodityTypeSchema = new Schema<ICommodityType>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        label: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    { timestamps: true }
);

export default mongoose.model<ICommodityType>("CommodityType", commodityTypeSchema);
