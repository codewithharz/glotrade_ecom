import "dotenv/config";
import { R2Service } from "../services/R2Service";
import path from "path";
import fs from "fs";

async function testStorage() {
    console.log(`Testing Storage Provider: ${process.env.STORAGE_PROVIDER || 'r2 (default)'}...`);

    const r2Service = new R2Service();
    const testKey = "test-upload.txt";
    const testContent = Buffer.from("Hello Glotrade Storage!");

    try {
        console.log(`Uploading test file to ${testKey}...`);
        const result = await r2Service.uploadFile(testContent, testKey, "text/plain");

        console.log("Upload Result:", result);

        if (process.env.STORAGE_PROVIDER === 'local') {
            const localPath = path.join(process.cwd(), 'public', 'uploads', testKey);
            if (fs.existsSync(localPath)) {
                console.log("✅ Local file exists at:", localPath);
            } else {
                console.error("❌ Local file NOT found at:", localPath);
            }
        }

        console.log(`Deleting test file...`);
        await r2Service.deleteFile(testKey);
        console.log("✅ Delete command sent.");

    } catch (error) {
        console.error("❌ Storage test failed:", error);
    } finally {
        process.exit(0);
    }
}

testStorage().catch(console.error);


// STORAGE_PROVIDER=local npx ts-node -r dotenv/config src/scripts/test-storage.ts
// STORAGE_PROVIDER=r2 npx ts-node -r dotenv/config src/scripts/test-storage.ts