const mongoose = require('mongoose');

async function checkData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/glotrade_ecom');

        console.log('=== ORDER STATUS BREAKDOWN ===');
        const orderStats = await mongoose.connection.db.collection('orders').aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();
        console.log(JSON.stringify(orderStats, null, 2));

        console.log('\n=== CATEGORY BREAKDOWN ===');
        const categoryStats = await mongoose.connection.db.collection('products').aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();
        console.log(JSON.stringify(categoryStats, null, 2));

        console.log('\n=== SAMPLE ORDERS ===');
        const sampleOrders = await mongoose.connection.db.collection('orders').find({})
            .limit(5)
            .project({ status: 1, totalPrice: 1, currency: 1, createdAt: 1, lineItems: 1 })
            .toArray();
        console.log(JSON.stringify(sampleOrders, null, 2));

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
