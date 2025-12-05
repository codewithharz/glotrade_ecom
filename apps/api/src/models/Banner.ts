import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
    title: string;
    image: string;
    link?: string;
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    position: number;
    createdAt: Date;
    updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        position: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying of active banners
bannerSchema.index({ isActive: 1, position: 1 });

const Banner = mongoose.model<IBanner>('Banner', bannerSchema);

export default Banner;
