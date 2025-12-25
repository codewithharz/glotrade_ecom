/**
 * GDIP Integration Helper
 * 
 * This file provides helper functions to integrate GDIP with your existing application.
 * Import and use these functions in your main app setup.
 */

import express, { Application } from "express";
import gdipRoutes from "../routes/gdip.routes";
import initializeGDIPCronJobs from "../jobs/gdipCronJobs";

/**
 * Register GDIP routes with your Express app
 * 
 * @param app - Express application instance
 * @param basePath - Base path for GDIP routes (default: "/api/gdip")
 */
export function registerGDIPRoutes(app: Application, basePath: string = "/api/gdip") {
    console.log(`📦 Registering GDIP routes at ${basePath}`);
    app.use(basePath, gdipRoutes);
    console.log("✅ GDIP routes registered successfully");
}

/**
 * Initialize GDIP cron jobs for automated cycle management
 * Call this after database connection is established
 * 
 * @param enabled - Whether to enable cron jobs (default: true)
 */
export function initializeGDIPAutomation(enabled: boolean = true) {
    if (!enabled) {
        console.log("⏸️  GDIP automation disabled");
        return;
    }

    console.log("🔄 Initializing GDIP automation...");
    initializeGDIPCronJobs();
    console.log("✅ GDIP automation initialized");
}

/**
 * Complete GDIP integration setup
 * Call this in your main app initialization
 * 
 * @param app - Express application instance
 * @param options - Integration options
 */
export function setupGDIP(
    app: Application,
    options: {
        routesBasePath?: string;
        enableAutomation?: boolean;
    } = {}
) {
    const { routesBasePath = "/api/gdip", enableAutomation = true } = options;

    console.log("🚀 Setting up GDIP platform...");

    // Register routes
    registerGDIPRoutes(app, routesBasePath);

    // Initialize automation (should be called after DB connection)
    // You may want to call this separately after DB is ready
    if (enableAutomation) {
        console.log("⚠️  Note: GDIP automation will start after database connection");
        console.log("   Call initializeGDIPAutomation() after DB is ready");
    }

    console.log("✅ GDIP platform setup complete");
}

/**
 * Example usage in your main app file:
 * 
 * import { setupGDIP, initializeGDIPAutomation } from './integrations/gdip.integration';
 * 
 * // In your app setup
 * setupGDIP(app, {
 *   routesBasePath: '/api/gdip',
 *   enableAutomation: true
 * });
 * 
 * // After database connection
 * mongoose.connection.once('open', () => {
 *   console.log('✅ MongoDB connected');
 *   initializeGDIPAutomation();
 * });
 */

export default {
    registerGDIPRoutes,
    initializeGDIPAutomation,
    setupGDIP,
};
