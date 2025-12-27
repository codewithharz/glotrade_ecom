# API Services Reference — Core Business Logic Layer

The Services layer (`apps/api/src/services`) represents the functional "brain" of the Glotrade platform. It encapsulates complex business rules, financial calculations, and third-party integrations, ensuring a clean separation from the API controllers.

---

## 🏗️ 1. Infrastructure & Orchestration
The foundational services that power the platform's internal mechanics.
- **`AdminService.ts`**: The central orchestrator for the admin dashboard. It aggregates metrics across the entire system, handles bulk user/vendor verification, and processes high-level platform reports.
- **`BaseService.ts`**: A generic abstraction that provides standardized CRUD operations (Create, Read, Update, Delete) for all other services.
- **`TokenService.ts`**: Manages the platform's internal token economy, including staking tiers (Bronze to Platinum) and APY calculations for rewards.

## 💰 2. FinTech & Money Management
Industrial-grade logic for handling NGN balances and credit.
- **`WalletService.ts`**: The primary handler for financial state. It manages atomic balance updates, wallet freezing, and integrates with the payment providers.
- **`PaymentService.ts`**: An abstraction layer for the payment providers. It switches dynamically between **Paystack**, **Flutterwave**, and **Orange Money** drivers.
- **`CreditRequestService.ts`**: Implements the business credit logic. It analyzes a user's transaction history to vet creditworthiness and sets the `creditLimit` on the user's wallet.
- **`EscrowService.ts`**: Temporarily holds funds during order processing, ensuring safety for both buyers and sellers until order fulfillment is confirmed.

## 📈 3. GDIP & Automated Trading
The specialized logic for the Glotrade Distribution/Trusted Insured Partners platform.
- **`GDIPService.ts`**: Handles the purchase of TPIA blocks and the sequential formation of Global Digital Clusters (GDCs). When a GDC is fully formed, it triggers the trade cycle.
- **`TradeCycleService.ts`**: Orchestrates the **37-day trading cycle**. It calculates profit/loss based on commodity market rates and automatically distributes profits to TPIA holders and referring agents.

## 🤝 4. MLM & Commission Engine
The growth engine of the platform, managing a multi-tier referral network.
- **`ReferralService.ts`**: Tracks the relationship between Sales Agents and their referred users. It manages agent tiers and ensures unique referral code generation.
- **`CommissionService.ts`**: Calculates registration and purchase commissions. It enforces the **₦100,000 threshold** for automatic commission approval into an agent's wallet.
- **`DistributorService.ts`**: An automated service that runs every **90 days** (quarterly) to credit Distributors with 2% of their total wallet balance as a reward.

## 📦 5. E-Commerce & Logistics
Handling the lifecycle of physical and digital products.
- **`MarketService.ts` / `InventoryService.ts`**: Manages the product catalogue and ensures thread-safe stock deduction using Mongoose atomic increments (`$inc`).
- **`OrderService.ts` / `BatchOrderService.ts`**: Manages the lifecycle of orders, from initial creation to final delivery and historical analytics.
- **`VoucherService.ts`**: Validates and applies discount coupons to order totals during the checkout process.

---

## 📢 6. Communication & Alerts
Real-time interaction and transactional messaging.
- **`NotificationService.ts`**: The engine for in-app alert generation. It uses **`NotificationTemplates.ts`** to format dynamic messages for orders, payments, and security alerts.
- **`RealTimeNotificationService.ts`**: Uses Socket.io to push instant "toast" notifications to users' browsers for immediate feedback.

---

## 🛠️ Provider Drivers (`/providers`)
Specialized class implementations for external API integrations:
- **`PaystackProvider.ts`**: Handles NGN payments, bank resolution, and payouts.
- **`FlutterwaveProvider.ts`**: Secondary NGN/USD payment gateway.
- **`OrangeMoneyProvider.ts`**: Mobile money integration for regional coverage.

**GloTrade — A Multi-Role Commerce & Distribution Infrastructure**
Developer: NEXGEN TECH INNOVATIONS LIMITED
Contact: codewithharz@gmail.com | +2348107060160
