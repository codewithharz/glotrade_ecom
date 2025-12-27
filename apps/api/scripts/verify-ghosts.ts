// npx ts-node -P apps/api/tsconfig.json apps/api/scripts/verify-ghosts.ts

import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { AdminService } from '../src/services/AdminService';
import { User } from '../src/models';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function verify() {
    try {
        console.log('Connecting to database...');
        // Use localhost if not provided, or the one from .env
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glotrade';
        await mongoose.connect(mongoUri);
        console.log('Connected');

        const adminService = new AdminService();

        const GHOST_ADMINS = [
            'ghostadmin1@ghostadmin.com',
            'ghostadmin2@ghostadmin.com',
            'ghostadmin3@ghostadmin.com'
        ];
        const SUPER_GHOST_ADMIN = 'superghostadmin@ghostadmin.com';
        const ALL_GHOSTS = [...GHOST_ADMINS, SUPER_GHOST_ADMIN];

        const totalInDbBefore = await User.countDocuments({});

        // Create a temporary ghost admin if it doesn't exist
        let tempGhostCreated = false;
        let ghostUser = await User.findOne({ email: GHOST_ADMINS[0] });
        if (!ghostUser) {
            ghostUser = await User.create({
                email: GHOST_ADMINS[0],
                username: 'tempghost',
                passwordHash: 'dummy',
                role: 'admin'
            });
            tempGhostCreated = true;
            console.log(`\nCreated temporary ghost admin: ${GHOST_ADMINS[0]}`);
        }

        const totalInDb = await User.countDocuments({});
        const ghostCountInDb = await User.countDocuments({ email: { $in: ALL_GHOSTS } });
        console.log(`Found ${ghostCountInDb} ghost admins in database (Total users in DB: ${totalInDb})`);

        console.log('\n--- Test 1: Regular Admin Visibility ---');
        const regularAdmin = { email: 'admin@test.com', role: 'admin' } as any;
        const result1 = await adminService.getUsersWithFilters({ page: 1, limit: 100 }, regularAdmin);
        const hasGhosts1 = result1.users.some(u => ALL_GHOSTS.includes(u.email));
        console.log(`Regular Admin sees ghosts: ${hasGhosts1} (Expected: false)`);
        console.log(`Regular Admin total count: ${result1.total} (Expected: ${totalInDb - ghostCountInDb})`);

        console.log('\n--- Test 2: Ghost Admin Visibility ---');
        const ghostAdmin = { email: GHOST_ADMINS[0], role: 'admin' } as any;
        const result2 = await adminService.getUsersWithFilters({ page: 1, limit: 100 }, ghostAdmin);
        const hasGhosts2 = result2.users.some(u => ALL_GHOSTS.includes(u.email));
        console.log(`Ghost Admin sees ghosts: ${hasGhosts2} (Expected: false)`);
        console.log(`Ghost Admin total count: ${result2.total} (Expected: ${totalInDb - ghostCountInDb})`);

        console.log('\n--- Test 3: Super Ghost Admin Visibility ---');
        const superGhostAdmin = { email: SUPER_GHOST_ADMIN, role: 'admin', isSuperAdmin: true } as any;
        const result3 = await adminService.getUsersWithFilters({ page: 1, limit: 100 }, superGhostAdmin);
        const hasGhosts3 = result3.users.some(u => ALL_GHOSTS.includes(u.email));
        console.log(`Super Ghost Admin sees ghosts: ${hasGhosts3} (Expected: ${ghostCountInDb > 0})`);
        console.log(`Super Ghost Admin total count: ${result3.total} (Expected: ${totalInDb})`);

        console.log('\n--- Test 4: Dashboard Stats ---');
        const metrics = await adminService.getDashboardMetrics();
        console.log(`Total Users in stats: ${metrics.totalUsers} (Expected: ${totalInDb - ghostCountInDb})`);

        // Cleanup
        if (tempGhostCreated) {
            await User.deleteOne({ _id: ghostUser._id });
            console.log('\nCleaned up temporary ghost admin.');
        }

        await mongoose.disconnect();
        console.log('\nVerification complete.');
    } catch (error) {
        console.error('Error during verification:', error);
        process.exit(1);
    }
}

verify();
