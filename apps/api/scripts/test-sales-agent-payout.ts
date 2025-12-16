import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User";
import Order from "../src/models/Order";
import Product from "../src/models/Product";
import Referral from "../src/models/Referral";
import Commission from "../src/models/Commission";
import Wallet from "../src/models/Wallet";
import CommissionService from "../src/services/CommissionService";
import { AdminService } from "../src/services/AdminService";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/glotrade_ecom";

async function main() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        // 1. Create Sales Agent
        const agentEmail = `agent_${Date.now()}@test.com`;
        const agent = await User.create({
            username: `agent_${Date.now()}`,
            email: agentEmail,
            passwordHash: "hash",
            role: "buyer", // Sales Agents are buyers with businessType
            businessInfo: {
                businessType: "Sales Agent",
                referralCode: `REF${Date.now()}`,
                agentStats: { tier: "Bronze" }
            }
        });
        console.log(`Created Sales Agent: ${agent.username} (${agent._id})`);

        // 2. Create Referred User
        const buyer = await User.create({
            username: `buyer_${Date.now()}`,
            email: `buyer_${Date.now()}@test.com`,
            passwordHash: "hash",
            role: "buyer"
        });
        console.log(`Created Buyer: ${buyer.username}`);

        // 3. Create Referral
        await Referral.create({
            agentId: agent._id,
            referredUserId: buyer._id,
            status: "active",
            referralCode: agent.businessInfo?.referralCode
        });

        // 4. Create Product with Discount
        const product = await Product.create({
            title: "Test Product",
            description: "A test product description",
            price: 50000,
            discount: 10, // 10% discount
            category: "Electronics",
            images: ["url"],
            seller: new mongoose.Types.ObjectId(), // Dummy vendor
            quantity: 100,
            condition: "new",
            location: { country: "Nigeria" }
        });

        // 5. Create Order
        const order = await Order.create({
            orderId: `ORD-${Date.now()}`,
            buyer: buyer._id,
            totalPrice: 90000,
            currency: "NGN",
            status: "delivered",
            paymentStatus: "completed",
            paymentMethod: "card",
            shippingDetails: {
                address: "123 Test St",
                city: "Lagos",
                country: "Nigeria"
            },
            items: [], // Deprecated field but schema might require it
            lineItems: [{
                productId: product._id,
                qty: 2,
                unitPrice: 50000,
                discount: 10, // 10% discount snapshot
                productTitle: product.title,
                vendorId: product.seller
            }]
        });

        // 6. Calculate Commission
        // Commission = 50000 * 2 * 10% = 10000
        console.log("Calculating commission...");
        const commission = await CommissionService.calculatePurchaseCommission(
            order._id.toString(),
            buyer._id.toString(),
            90000
        );

        if (!commission) {
            throw new Error("Commission not calculated!");
        }
        // Commission should be 10,000 Naira
        console.log(`Commission calculated: ₦${commission.amount}`);

        if (commission.amount !== 10000) {
            throw new Error(`Commission amount incorrect. Expected 10000, got ${commission.amount}`);
        }

        // 7. Approve Commission
        const adminId = new mongoose.Types.ObjectId();
        await CommissionService.approveCommission(commission._id.toString(), adminId.toString());
        console.log("Commission approved");

        // 8. Try Bulk Payout (Should fail < 100k)
        console.log("Attempting payout (should fail)...");
        try {
            await CommissionService.requestBulkPayout(agent._id.toString());
            console.error("Payout succeeded unexpectedly!");
        } catch (error: any) {
            console.log(`Payout failed as expected: ${error.message}`);
        }

        // 9. Add more commissions to reach 100k
        // Need 90k more. Let's create a manual commission for testing
        await Commission.create({
            agentId: agent._id,
            referralId: commission.referralId,
            orderId: new mongoose.Types.ObjectId(), // Dummy order
            type: "bonus",
            amount: 95000, // 95,000 Naira
            status: "approved",
            description: "Top up for testing",
            metadata: {
                paymentReference: `MANUAL-${Date.now()}`
            }
        });
        console.log("Added 95k bonus commission");

        // 10. Try Bulk Payout (Should succeed)
        console.log("Attempting payout (should succeed)...");
        const payoutResult = await CommissionService.requestBulkPayout(agent._id.toString());
        console.log(`Payout successful! Count: ${payoutResult.count}, Total: ₦${payoutResult.totalAmount}`);

        // 11. Verify Wallet
        const wallet = await Wallet.findOne({ userId: agent._id });
        console.log(`Wallet Balance: ₦${wallet?.balance}`);

        if (wallet?.balance !== 105000) { // 105,000 Naira
            throw new Error(`Wallet balance incorrect. Expected 105000, got ${wallet?.balance}`);
        }

        // 12. Verify Admin Filtering
        console.log("Verifying Admin Service filtering...");
        const adminService = new AdminService();
        const agentsList = await adminService.getUsersWithFilters({ businessType: "Sales Agent" });

        const foundAgent = agentsList.users.find(u => u._id.toString() === agent._id.toString());
        if (foundAgent) {
            console.log("Admin Service correctly found the Sales Agent");
        } else {
            throw new Error("Admin Service failed to find the Sales Agent");
        }

    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
