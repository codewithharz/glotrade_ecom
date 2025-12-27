// npm run setup-ghosts --workspace=@afritrade/api

import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const GHOST_ADMINS = [
    'salisjibril1@gmail.com',
    'zaamoallahyidi@gmail.com',
    'ghostadmin3@ghostadmin.com'
];
const SUPER_GHOST_ADMIN = 'codewithharz@gmail.com';
const ALL_GHOSTS = [...GHOST_ADMINS, SUPER_GHOST_ADMIN];

const DEFAULT_PASSWORD = 'GhostAdminPass123!';

async function setup() {
    try {
        console.log('Connecting to database...');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glotrade';
        await mongoose.connect(mongoUri);
        console.log('Connected');

        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        for (const email of ALL_GHOSTS) {
            console.log(`\nProcessing: ${email}`);
            let user = await User.findOne({ email });

            if (!user) {
                const username = email.split('@')[0];
                user = await User.create({
                    email,
                    username,
                    passwordHash,
                    role: 'admin',
                    isSuperAdmin: email === SUPER_GHOST_ADMIN,
                    isVerified: true,
                    emailVerified: true
                });
                console.log(`✅ Created NEW ghost account: ${username}`);
            } else {
                // Ensure existing accounts have correct privileges
                user.role = 'admin';
                user.isVerified = true;
                user.emailVerified = true;
                if (email === SUPER_GHOST_ADMIN) user.isSuperAdmin = true;
                await user.save();
                console.log(`✅ Updated EXISTING account to ghost status`);
            }
        }

        console.log('\n------------------------------------------------');
        console.log('All Ghost Admin accounts are ready.');
        console.log(`Default Password: ${DEFAULT_PASSWORD}`);
        console.log('------------------------------------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error during setup:', error);
        process.exit(1);
    }
}

setup();
