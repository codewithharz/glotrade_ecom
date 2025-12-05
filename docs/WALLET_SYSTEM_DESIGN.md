# 🏦 Wallet System Design

## Overview
A comprehensive dual-wallet system for AfriTrade Hub supporting both user/buyer wallets and vendor/seller wallets with multiple currencies (ATH tokens and NGN fiat).

## 🎯 System Architecture

### **Dual Wallet System**

#### **1. User/Buyer Wallets**
- **ATH Wallet**: For platform tokens, rewards, and internal transactions
- **NGN Wallet**: For real money transactions, top-ups, and payments
- **Features**: Top-up, payments, refunds, transfers, rewards

#### **2. Vendor/Seller Wallets**
- **ATH Wallet**: For platform rewards, bonuses, and internal transactions
- **NGN Wallet**: For earnings from sales, withdrawals to bank accounts
- **Features**: Earnings tracking, withdrawals, platform fees, bonuses

## 🏗️ Database Schema

### **Wallet Model**
```typescript
interface IWallet {
  userId: ObjectId;
  type: "user" | "vendor";
  currency: "ATH" | "NGN";
  balance: number; // in kobo for NGN, smallest unit for ATH
  frozenBalance: number; // for escrow, disputes
  totalDeposited: number;
  totalWithdrawn: number;
  totalSpent: number;
  totalEarned: number; // for vendors
  status: "active" | "suspended" | "frozen";
  metadata?: {
    bankAccount?: BankAccountDetails;
    paymentProvider?: PaymentProviderDetails;
  };
}
```

### **WalletTransaction Model**
```typescript
interface IWalletTransaction {
  walletId: ObjectId;
  userId: ObjectId;
  type: "deposit" | "withdrawal" | "payment" | "refund" | "transfer" | "earning" | "fee" | "bonus" | "adjustment";
  category: "order_payment" | "order_refund" | "top_up" | "withdrawal" | "transfer_in" | "transfer_out" | "sale_earning" | "platform_fee" | "bonus" | "adjustment";
  amount: number;
  currency: "ATH" | "NGN";
  balanceBefore: number;
  balanceAfter: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  reference: string;
  externalReference?: string; // Paystack/Flutterwave reference
  description: string;
  metadata?: TransactionMetadata;
}
```

## 🔧 API Endpoints

### **User Wallet Operations**
- `GET /api/v1/wallets/summary` - Get wallet summary (ATH + NGN)
- `GET /api/v1/wallets/balance?currency=NGN&type=user` - Get specific wallet balance
- `GET /api/v1/wallets/transactions` - Get transaction history
- `POST /api/v1/wallets/topup` - Top up wallet via Paystack/Flutterwave
- `GET /api/v1/wallets/verify-topup` - Verify top-up payment
- `POST /api/v1/wallets/transfer` - Transfer funds to another user
- `POST /api/v1/wallets/create-user-wallets` - Create wallets for new user

### **Vendor Wallet Operations**
- `GET /api/v1/wallets/summary?type=vendor` - Get vendor wallet summary
- `POST /api/v1/wallets/create-vendor-wallets` - Create vendor wallets

### **Admin Operations**
- `POST /api/v1/wallets/freeze` - Freeze user funds (admin only)
- `POST /api/v1/wallets/unfreeze` - Unfreeze user funds (admin only)

## 💰 Payment Integration

### **Top-up Flow**
1. User initiates top-up via API
2. Payment provider (Paystack/Flutterwave) processes payment
3. Webhook/verification confirms payment
4. Wallet balance updated
5. Transaction record created

### **Order Payment Flow**
1. User selects wallet payment at checkout
2. System checks wallet balance
3. Funds deducted from wallet
4. Order marked as paid
5. Transaction record created

### **Vendor Earnings Flow**
1. Order completed successfully
2. Platform fee calculated (2%)
3. Net amount added to vendor NGN wallet
4. Transaction record created
5. Vendor can withdraw to bank account

## 🔒 Security Features

### **Fund Protection**
- **Frozen Balance**: For escrow, disputes, chargebacks
- **Transaction Limits**: Daily/monthly limits per user
- **Audit Trail**: Complete transaction history
- **Admin Controls**: Freeze/unfreeze capabilities

### **Fraud Prevention**
- **Transaction Validation**: All transactions validated
- **Balance Checks**: Insufficient funds protection
- **Reference Tracking**: Unique transaction references
- **Status Monitoring**: Real-time status tracking

## 📱 Frontend Integration

### **Wallet Dashboard**
- Balance display (ATH + NGN)
- Transaction history
- Top-up interface
- Transfer functionality
- Withdrawal requests (vendors)

### **Payment Integration**
- Wallet payment option at checkout
- Balance display during payment
- Transaction confirmation
- Receipt generation

## 🚀 Implementation Status

### **Backend (Completed)**
- ✅ Wallet models and schema
- ✅ Wallet service with full functionality
- ✅ API controllers and routes
- ✅ Payment provider integration
- ✅ Transaction tracking
- ✅ Security features

### **Frontend (Pending)**
- 🔄 Wallet dashboard UI
- 🔄 Top-up interface
- 🔄 Transaction history
- 🔄 Transfer functionality
- 🔄 Integration with checkout

## 🔄 Integration Points

### **Existing Systems**
- **User Management**: Automatic wallet creation
- **Payment System**: Seamless integration with Paystack/Flutterwave
- **Order System**: Wallet payment option
- **Vendor System**: Earnings tracking
- **Admin System**: Fund management tools

### **Future Enhancements**
- **Cryptocurrency Support**: Bitcoin, Ethereum wallets
- **International Transfers**: Cross-border payments
- **Loyalty Programs**: ATH token rewards
- **Staking**: Token staking functionality
- **DeFi Integration**: Yield farming, liquidity pools

## 📊 Business Logic

### **Platform Fees**
- **Order Processing**: 2% platform fee
- **Top-up Fees**: Varies by provider
- **Withdrawal Fees**: Minimal processing fees
- **Transfer Fees**: Free internal transfers

### **Currency Conversion**
- **ATH to NGN**: 1:1 ratio (configurable)
- **Real-time Rates**: Future enhancement
- **Conversion Fees**: None for internal transfers

## 🛡️ Compliance & Regulations

### **Financial Compliance**
- **Transaction Limits**: KYC-based limits
- **Reporting**: Transaction reporting for authorities
- **Audit Trail**: Complete audit logs
- **Data Protection**: GDPR compliance

### **Security Standards**
- **Encryption**: All sensitive data encrypted
- **Access Control**: Role-based permissions
- **Monitoring**: Real-time fraud detection
- **Backup**: Regular data backups

## 📈 Analytics & Reporting

### **User Analytics**
- Spending patterns
- Top-up frequency
- Transfer activity
- Balance trends

### **Platform Analytics**
- Total wallet value
- Transaction volumes
- Revenue metrics
- User engagement

This wallet system provides a robust foundation for financial transactions within the AfriTrade Hub platform, supporting both traditional fiat and token-based economies.
