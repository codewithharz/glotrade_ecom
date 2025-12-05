
import mongoose from 'mongoose';
import { User, Order, Product, ProductReview, Payment } from '../models';
import dotenv from 'dotenv';
import path from 'path';

// Load env from apps/api/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkRecentActivity() {
    try {
        console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('buyer', 'username email firstName lastName')
            .populate('product', 'title price category')
            .populate('seller', 'username store');
        console.log(`Found ${recentOrders.length} recent orders`);

        // Get recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('username email role firstName lastName isVerified createdAt');
        console.log(`Found ${recentUsers.length} recent users`);

        // Get recent products
        const recentProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title price category seller createdAt')
            .populate('seller', 'username store');
        console.log(`Found ${recentProducts.length} recent products`);

        const activities = [
            ...recentOrders.map(order => ({ type: 'order', timestamp: order.createdAt })),
            ...recentUsers.map(user => ({ type: 'user', timestamp: user.createdAt })),
            ...recentProducts.map(product => ({ type: 'product', timestamp: product.createdAt }))
        ];

        console.log(`Total activities before sort: ${activities.length}`);

        const sorted = activities.sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA;
        }).slice(0, 10);

        console.log('Top 10 recent activities:');
        console.log(JSON.stringify(sorted, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkRecentActivity();
