import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db';
import DistributorService from '../src/services/DistributorService';

// Load environment variables
dotenv.config();

const run = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected.');

        console.log('Running Distributor Reward Processing...');
        const result = await DistributorService.processRewards();

        console.log('-----------------------------------');
        console.log('Processing Complete');
        console.log(`Processed Distributors: ${result.processed}`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error running script:', error);
        process.exit(1);
    }
};

run();
