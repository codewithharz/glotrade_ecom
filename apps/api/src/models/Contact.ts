import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  contactUserId: mongoose.Types.ObjectId;
  contactWalletId: string;
  contactDisplayName: string;
  contactUsername: string;
  contactEmail: string;
  contactProfileImage?: string;
  isVerified: boolean;
  isFavorite: boolean;
  lastTransferred?: Date;
  totalTransferred: number;
  transferCount: number;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contactUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contactWalletId: {
    type: String,
    required: true,
    index: true
  },
  contactDisplayName: {
    type: String,
    required: true,
    trim: true
  },
  contactUsername: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  contactProfileImage: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  lastTransferred: {
    type: Date,
    default: null
  },
  totalTransferred: {
    type: Number,
    default: 0,
    min: 0
  },
  transferCount: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
contactSchema.index({ userId: 1, contactUserId: 1 }, { unique: true });
contactSchema.index({ userId: 1, isFavorite: 1 });
contactSchema.index({ userId: 1, lastTransferred: -1 });
contactSchema.index({ userId: 1, totalTransferred: -1 });

// Pre-save middleware to update timestamps
contactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to add or update contact
contactSchema.statics.addOrUpdateContact = async function(
  userId: string,
  contactData: {
    contactUserId: string;
    contactWalletId: string;
    contactDisplayName: string;
    contactUsername: string;
    contactEmail: string;
    contactProfileImage?: string;
    isVerified?: boolean;
  }
) {
  const existingContact = await this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    contactUserId: new mongoose.Types.ObjectId(contactData.contactUserId)
  });

  if (existingContact) {
    // Update existing contact
    existingContact.contactDisplayName = contactData.contactDisplayName;
    existingContact.contactUsername = contactData.contactUsername;
    existingContact.contactEmail = contactData.contactEmail;
    existingContact.contactProfileImage = contactData.contactProfileImage;
    existingContact.isVerified = contactData.isVerified || false;
    existingContact.updatedAt = new Date();
    return await existingContact.save();
  } else {
    // Create new contact
    return await this.create({
      userId: new mongoose.Types.ObjectId(userId),
      contactUserId: new mongoose.Types.ObjectId(contactData.contactUserId),
      contactWalletId: contactData.contactWalletId,
      contactDisplayName: contactData.contactDisplayName,
      contactUsername: contactData.contactUsername,
      contactEmail: contactData.contactEmail,
      contactProfileImage: contactData.contactProfileImage,
      isVerified: contactData.isVerified || false
    });
  }
};

// Static method to record transfer
contactSchema.statics.recordTransfer = async function(
  userId: string,
  contactUserId: string,
  amount: number
) {
  const contact = await this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    contactUserId: new mongoose.Types.ObjectId(contactUserId)
  });

  if (contact) {
    contact.totalTransferred += amount;
    contact.transferCount += 1;
    contact.lastTransferred = new Date();
    contact.updatedAt = new Date();
    return await contact.save();
  }
};

export default mongoose.model<IContact>('Contact', contactSchema);
