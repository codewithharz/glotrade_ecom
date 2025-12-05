const mongoose = require('mongoose');

async function debugCategoryAnalytics() {
    try {
        await mongoose.connect('mongodb://localhost:27017/afritrade');

        console.log('=== CHECKING CATEGORIES ===');
        const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
        console.log(`Total categories: ${categories.length}`);
        if (categories.length > 0) {
            console.log('Sample category:', JSON.stringify(categories[0], null, 2));
        }

        console.log('\n=== CHECKING PRODUCTS ===');
        const products = await mongoose.connection.db.collection('products').find({}).limit(3).toArray();
        console.log(`Total products: ${await mongoose.connection.db.collection('products').countDocuments({})}`);
        if (products.length > 0) {
            console.log('Sample product categories:');
            products.forEach(p => {
                console.log(`- ${p.title}: category="${p.category}", subcategory="${p.subcategory}"`);
            });
        }

        console.log('\n=== CHECKING ORDERS ===');
        const orders = await mongoose.connection.db.collection('orders').find({
            status: { $in: ['delivered', 'completed', 'processing', 'shipped', 'pending'] },
            paymentStatus: 'completed'
        }).limit(3).toArray();
        console.log(`Orders with completed payment: ${await mongoose.connection.db.collection('orders').countDocuments({ paymentStatus: 'completed' })}`);
        if (orders.length > 0) {
            console.log('Sample order:', JSON.stringify({
                _id: orders[0]._id,
                status: orders[0].status,
                paymentStatus: orders[0].paymentStatus,
                totalPrice: orders[0].totalPrice,
                lineItems: orders[0].lineItems
            }, null, 2));

            // Check if we can find the product for this order
            if (orders[0].lineItems && orders[0].lineItems.length > 0) {
                const productId = orders[0].lineItems[0].productId;
                const product = await mongoose.connection.db.collection('products').findOne({ _id: productId });
                if (product) {
                    console.log('\nProduct from order:', JSON.stringify({
                        title: product.title,
                        category: product.category,
                        subcategory: product.subcategory
                    }, null, 2));
                }
            }
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugCategoryAnalytics();
