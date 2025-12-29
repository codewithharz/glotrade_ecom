import "dotenv/config";
import cacheService from "../services/CacheService";

async function testRedis() {
    console.log(`Testing CacheService...`);
    const testKey = "test-key";
    const testValue = { message: "Hello from Redis!", timestamp: Date.now() };

    try {
        console.log(`Setting value for ${testKey}...`);
        await cacheService.set(testKey, testValue, 60);

        console.log(`Getting value for ${testKey}...`);
        const retrievedValue = await cacheService.get(testKey);

        console.log("Retrieved value:", retrievedValue);

        if (JSON.stringify(retrievedValue) === JSON.stringify(testValue)) {
            console.log("✅ Cache test PASSED!");
        } else {
            console.error("❌ Cache test FAILED! Values do not match.");
        }

        console.log(`Deleting value for ${testKey}...`);
        await cacheService.del(testKey);

        const deletedValue = await cacheService.get(testKey);
        if (!deletedValue) {
            console.log("✅ Delete test PASSED!");
        } else {
            console.error("❌ Delete test FAILED! Value still exists.");
        }

    } catch (error) {
        console.error("❌ Redis test encountered an error:", error);
    } finally {
        // Give it a moment to log before exiting if async loggers are finishing
        setTimeout(() => process.exit(0), 1000);
    }
}

testRedis().catch(console.error);


// cd apps/api && npx ts-node -r dotenv/config src/scripts/test-redis.ts