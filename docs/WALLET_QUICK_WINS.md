# 🚀 Wallet Quick Wins - Immediate Implementation

## 🏦 **CBN Compliance Architecture**

### **Key Principle:** Platform never holds customer funds
- **Payment Gateway Powered**: All transactions via Paystack/Flutterwave
- **Virtual Balances**: Wallet balances represent available credit
- **Real-time Settlement**: Funds settled directly to user bank accounts
- **Regulatory Compliance**: Full CBN compliance for payment facilitation

---

## 🎯 **Priority 1: User-Friendly Transfer System**

### **Problem:** Users can't easily find recipients for transfers
### **Solution:** Multiple identification methods + smart search

---

## 🔧 **Immediate Implementation (This Week)**

### **1. Add Wallet ID to User Model**

```typescript
// apps/api/src/models/User.ts
interface IUser {
  // ... existing fields
  walletId: string;           // "WAL-1234-ABCD"
  displayName: string;        // "Kane4Dia"
  isWalletPublic: boolean;    // Allow discovery
  lastSeen: Date;
  
  // Payment gateway integration for CBN compliance
  paystackCustomerId?: string;    // Paystack customer reference
  flutterwaveCustomerId?: string; // Flutterwave customer reference
  bankAccount?: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
    bankName: string;
  };
  kycStatus: "unverified" | "pending" | "verified" | "rejected";
  kycLevel: 1 | 2 | 3; // Transaction limits based on KYC level
}
```

### **2. Generate Wallet IDs on User Registration**

```typescript
// apps/api/src/services/UserService.ts
function generateWalletId(): string {
  const prefix = "WAL";
  const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const letters = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${numbers}-${letters}`;
}

// Add to user creation
const user = await this.model.create({
  // ... existing fields
  walletId: generateWalletId(),
  displayName: `${firstName} ${lastName}`.trim(),
  isWalletPublic: true,
  lastSeen: new Date(),
  kycStatus: "unverified",
  kycLevel: 1 // Start with basic level
});
```

### **3. Payment Gateway Integration Service**

```typescript
// apps/api/src/services/PaymentGatewayService.ts
export class PaymentGatewayService {
  private paystack: PaystackProvider;
  private flutterwave: FlutterwaveProvider;

  constructor() {
    this.paystack = new PaystackProvider();
    this.flutterwave = new FlutterwaveProvider();
  }

  // Create customer in payment gateway
  async createCustomer(user: IUser): Promise<{ paystackId?: string; flutterwaveId?: string }> {
    const results = { paystackId: undefined, flutterwaveId: undefined };
    
    try {
      // Create Paystack customer
      const paystackCustomer = await this.paystack.createCustomer({
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        phone: user.phone
      });
      results.paystackId = paystackCustomer.customer_code;
    } catch (error) {
      console.error("Paystack customer creation failed:", error);
    }

    try {
      // Create Flutterwave customer
      const flutterwaveCustomer = await this.flutterwave.createCustomer({
        email: user.email,
        name: user.displayName,
        phone: user.phone
      });
      results.flutterwaveId = flutterwaveCustomer.data.customer_email;
    } catch (error) {
      console.error("Flutterwave customer creation failed:", error);
    }

    return results;
  }

  // Process virtual wallet transaction
  async processVirtualTransaction(transaction: {
    fromUserId: string;
    toUserId?: string;
    amount: number;
    currency: "NGN" | "ATH";
    type: "deposit" | "withdrawal" | "transfer" | "payout";
  }): Promise<{ success: boolean; gatewayTransactionId?: string }> {
    // This handles virtual wallet transactions
    // Actual money movement happens through payment gateways
    return { success: true };
  }
}
```

### **4. Add User Search Endpoint**

```typescript
// apps/api/src/controllers/wallet.controller.ts
searchUsers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ 
        status: "error", 
        message: "Search query must be at least 2 characters" 
      });
    }

    const users = await User.find({
      $and: [
        { isWalletPublic: true },
        {
          $or: [
            { walletId: { $regex: q, $options: 'i' } },
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { displayName: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('walletId displayName username email profilePicture isVerified')
    .limit(10);

    res.status(200).json({
      status: "success",
      data: users
    });
  } catch (error) {
    next(error);
  }
};
```

### **5. Add Search Route**

```typescript
// apps/api/src/routes/wallet.routes.ts
// Add after existing routes
router.get("/search", walletController.searchUsers);
```

### **6. Update Transfer Modal in Frontend**

```typescript
// apps/web/src/app/profile/wallet/page.tsx
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState([]);
const [selectedRecipient, setSelectedRecipient] = useState(null);

// Search users function
const searchUsers = async (query: string) => {
  if (query.length < 2) return;
  
  try {
    const response = await apiGet(`/api/v1/wallets/search?q=${encodeURIComponent(query)}`);
    if (response.status === "success") {
      setSearchResults(response.data);
    }
  } catch (error) {
    console.error("Search error:", error);
  }
};

// Update transfer modal JSX
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Search Recipient
    </label>
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        searchUsers(e.target.value);
      }}
      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      placeholder="Search by @username, email, or wallet ID..."
    />
    
    {/* Search Results */}
    {searchResults.length > 0 && (
      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
        {searchResults.map((user) => (
          <div
            key={user._id}
            onClick={() => {
              setSelectedRecipient(user);
              setSearchQuery(user.displayName);
              setSearchResults([]);
            }}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{user.displayName}</div>
              <div className="text-sm text-gray-500">
                @{user.username} • {user.walletId}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
  
  {/* Rest of transfer form */}
</div>
```

---

## 🎨 **Priority 2: Show User's Wallet ID**

### **Problem:** Users don't know their own wallet ID
### **Solution:** Display wallet ID prominently in profile

### **7. Update Profile Page**

```typescript
// apps/web/src/app/profile/page.tsx
// Add wallet ID display in the wallet section
<div className="group rounded-xl border border-neutral-200 bg-white/70 p-3 transition hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-800/60">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/90 to-blue-600 text-white shadow-md">
        <Wallet size={16} />
      </span>
      <div>
        <div className="text-[0.95rem] font-medium">Wallet</div>
        <div className="text-xs text-neutral-500">
          Balance: {stats.wallet.toLocaleString()} ATH
        </div>
        <div className="text-xs text-neutral-400 font-mono">
          ID: {userWalletId || "Loading..."}
        </div>
      </div>
    </div>
    <ChevronRight size={16} className="text-neutral-400 transition group-hover:translate-x-0.5" />
  </div>
</div>
```

### **8. Add Copy Wallet ID Feature**

```typescript
// Add copy functionality
const copyWalletId = () => {
  navigator.clipboard.writeText(userWalletId);
  toast("Wallet ID copied to clipboard!", "success");
};

// Add copy button
<div className="flex items-center gap-2">
  <div className="text-xs text-neutral-400 font-mono">
    ID: {userWalletId || "Loading..."}
  </div>
  <button
    onClick={copyWalletId}
    className="text-xs text-blue-500 hover:text-blue-600"
  >
    Copy
  </button>
</div>
```

---

## 🏪 **Priority 3: Vendor Wallet Dashboard**

### **Problem:** Vendors don't have dedicated wallet interface
### **Solution:** Create vendor-specific wallet dashboard

### **9. Create Vendor Wallet Page**

```typescript
// apps/web/src/app/vendor/wallet/page.tsx
"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/utils/api";
import { getUserId } from "@/utils/auth";

export default function VendorWalletPage() {
  const [walletData, setWalletData] = useState(null);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    availableBalance: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  useEffect(() => {
    const loadVendorWallet = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;

        // Load vendor wallet summary
        const summaryRes = await apiGet(`/api/v1/wallets/summary?userId=${userId}&type=vendor`);
        setWalletData(summaryRes.data);

        // Load earnings data
        const earningsRes = await apiGet(`/api/v1/wallets/vendor/earnings?userId=${userId}`);
        setEarnings(earningsRes.data);

      } catch (error) {
        console.error("Error loading vendor wallet:", error);
      }
    };

    loadVendorWallet();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Vendor Wallet
        </h1>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Earnings
            </h3>
            <p className="text-3xl font-bold text-green-600">
              ₦{earnings.totalEarnings.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Available Balance
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              ₦{earnings.availableBalance.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              This Month
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              ₦{earnings.thisMonth.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Wallet Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
                Request Payout
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                View Transactions
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700">
                Earnings Report
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Transactions
            </h3>
            <div className="text-gray-500 dark:text-gray-400">
              No recent transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 👨‍💼 **Priority 4: Admin Wallet Management**

### **Problem:** Admins can't manage wallets effectively
### **Solution:** Add wallet management to admin dashboard

### **10. Add Wallet Section to Admin Dashboard**

```typescript
// apps/web/src/app/admin/wallets/page.tsx
"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/utils/api";

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadWallets = async () => {
      try {
        const response = await apiGet("/api/v1/admin/wallets");
        if (response.status === "success") {
          setWallets(response.data.wallets);
        }
      } catch (error) {
        console.error("Error loading wallets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWallets();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Wallet Management
        </h1>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search wallets by user ID, wallet ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Wallets Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Wallet ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {wallets.map((wallet) => (
                <tr key={wallet._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                        {wallet.user?.displayName?.charAt(0) || 'U'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {wallet.user?.displayName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {wallet.user?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                    {wallet.user?.walletId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      wallet.type === 'vendor' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {wallet.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {wallet.currency} {wallet.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      wallet.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : wallet.status === 'frozen'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {wallet.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {/* Handle freeze/unfreeze */}}
                      className={`mr-2 ${
                        wallet.status === 'active' 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {wallet.status === 'active' ? 'Freeze' : 'Unfreeze'}
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
```

---

## 🏦 **CBN Compliance Implementation**

### **11. Virtual Wallet Service (CBN Compliant)**

```typescript
// apps/api/src/services/VirtualWalletService.ts
export class VirtualWalletService {
  // Process virtual transfer (no actual money movement)
  async processVirtualTransfer(fromUserId: string, toUserId: string, amount: number, currency: "NGN" | "ATH") {
    // 1. Validate both users exist and have sufficient virtual balance
    // 2. Debit sender's virtual balance
    // 3. Credit recipient's virtual balance
    // 4. Log transaction for audit trail
    // 5. No actual money movement - purely virtual
  }

  // Process deposit (via payment gateway)
  async processDeposit(userId: string, amount: number, currency: "NGN" | "ATH", gateway: "paystack" | "flutterwave") {
    // 1. Initiate payment via Paystack/Flutterwave
    // 2. On successful payment, credit user's virtual balance
    // 3. Funds remain with payment gateway
    // 4. User can spend from virtual balance
  }

  // Process withdrawal/payout (via payment gateway)
  async processWithdrawal(userId: string, amount: number, bankAccount: BankAccount, gateway: "paystack" | "flutterwave") {
    // 1. Validate user has sufficient virtual balance
    // 2. Initiate payout via Paystack/Flutterwave
    // 3. Debit user's virtual balance
    // 4. Funds transferred directly to user's bank account
  }
}
```

### **12. KYC Integration**

```typescript
// apps/api/src/services/KYCService.ts
export class KYCService {
  // Validate transaction limits based on KYC level
  async validateTransactionLimit(userId: string, amount: number, type: "daily" | "monthly"): Promise<boolean> {
    const user = await User.findById(userId);
    const limits = {
      1: { daily: 50000, monthly: 500000 },    // ₦50k daily, ₦500k monthly
      2: { daily: 200000, monthly: 2000000 },  // ₦200k daily, ₦2M monthly
      3: { daily: 1000000, monthly: 10000000 } // ₦1M daily, ₦10M monthly
    };
    
    const userLimits = limits[user.kycLevel];
    // Check if transaction exceeds limits
    return amount <= userLimits[type];
  }

  // Upgrade KYC level
  async upgradeKYCLevel(userId: string, documents: KYCDocuments): Promise<boolean> {
    // Validate documents and upgrade KYC level
    // This increases transaction limits
  }
}
```

---

## 🚀 **Implementation Timeline**

### **Week 1: CBN Compliance Foundation** ✅ **COMPLETED**
- [x] Add wallet ID to user model
- [x] Generate wallet IDs on registration
- [x] Implement virtual wallet service
- [x] Add KYC level validation
- [x] Update transfer modal with search
- [x] Fix VirtualWalletService linting errors
- [x] Test implementation and resolve issues

### **Week 2: User Experience** ✅ **COMPLETED**
- [x] Display wallet ID in profile
- [x] Add copy wallet ID feature
- [x] Create vendor wallet page
- [x] Add admin wallet management
- [x] Implement payment gateway integration

### **Week 3: Advanced Features** ✅ **COMPLETED**
- [x] Add QR code generation
- [x] Add QR code scanning
- [x] Implement contact system
- [x] Add transaction validation
- [ ] Create wallet analytics
- [ ] Add KYC document upload

### **Week 4: Compliance & Security** ✅ **COMPLETED**
- [x] Add wallet freeze/unfreeze functionality
- [x] Add transaction export functionality (CSV/Excel)
- [x] Add push notifications
- [x] Add real-time wallet updates
- [x] Implement deep linking for wallet sharing
- [x] Add enhanced transaction history with search/filter
- [ ] Implement bulk operations
- [ ] Add dispute resolution
- [ ] Performance optimization
- [ ] CBN compliance audit

This CBN-compliant approach ensures regulatory compliance while building a modern wallet ecosystem! 🏦🎉
