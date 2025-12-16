
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkLatestOrder() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Define minimal schema to read the order
        const orderSchema = new mongoose.Schema({}, { strict: false });
        const Order = mongoose.model('Order', orderSchema);

        const latestOrder = await Order.findOne().sort({ createdAt: -1 }).lean();

        if (!latestOrder) {
            console.log('No orders found.');
        } else {
            console.log('Latest Order Record:');
            console.log(JSON.stringify(latestOrder, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

checkLatestOrder();
