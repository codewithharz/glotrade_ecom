import "dotenv/config";
import { NotificationService } from "../services/NotificationService";
import { connectDB } from "../config/db";
import mongoose from "mongoose";

async function testNotifications() {
    console.log("Testing Notification-Email Integration...");

    try {
        await connectDB();
        const notificationService = new NotificationService();

        // Find a test user
        const User = mongoose.model("User");
        const user = await User.findOne({ email: { $exists: true } });

        if (!user) {
            console.error("❌ No user found with an email address. Please seed the database first.");
            process.exit(1);
        }

        console.log(`Sending test notification to user: ${user.email}...`);

        await notificationService.createNotification({
            userId: user._id,
            type: "order_placed",
            data: {
                orderNumber: "GLO-TEST-123",
                currency: "USD",
                totalAmount: 99.99
            }
        });

        console.log("✅ Notification created! Check server logs to see if EmailService was triggered.");

    } catch (error) {
        console.error("❌ Notification test failed:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

testNotifications().catch(console.error);
