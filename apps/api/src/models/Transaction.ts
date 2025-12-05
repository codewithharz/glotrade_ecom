// src/models/Transaction.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  transactionHash: string;
  from: string;
  to: string;
  amount: number;
  tokenAmount?: number;
  gasUsed?: number;
  status: "pending" | "completed" | "failed";
  type: "purchase" | "token_transfer" | "staking" | "governance";
  orderId?: Schema.Types.ObjectId;
  blockNumber?: number;
  blockTimestamp?: number;
  networkId: number;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    from: {
      type: String,
      required: true,
      index: true,
    },
    to: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tokenAmount: {
      type: Number,
    },
    gasUsed: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["purchase", "token_transfer", "staking", "governance"],
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    blockNumber: {
      type: Number,
    },
    blockTimestamp: {
      type: Number,
    },
    networkId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
transactionSchema.index({ blockNumber: 1 });
transactionSchema.index({ createdAt: 1 });
transactionSchema.index({ from: 1, to: 1 });

transactionSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Validate transaction hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(this.transactionHash)) {
      throw new Error("Invalid transaction hash format");
    }

    // Validate addresses
    if (
      !/^0x[a-fA-F0-9]{40}$/.test(this.from) ||
      !/^0x[a-fA-F0-9]{40}$/.test(this.to)
    ) {
      throw new Error("Invalid ethereum address format");
    }
  }
  next();
});

transactionSchema.methods = {
  async confirmTransaction(
    blockNumber: number,
    gasUsed: number
  ): Promise<void> {
    this.status = "completed";
    this.blockNumber = blockNumber;
    this.gasUsed = gasUsed;
    this.blockTimestamp = Math.floor(Date.now() / 1000);
    await this.save();
  },
};

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
