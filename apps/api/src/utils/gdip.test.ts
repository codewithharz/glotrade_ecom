/**
 * GDIP Testing Utilities
 * 
 * Helper functions for testing GDIP functionality
 */

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Test GDIP API endpoints
 */
export class GDIPTestHelper {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private getHeaders() {
        return {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
        };
    }

    /**
     * Test TPIA purchase
     */
    async testPurchaseTPIA(commodityType: string = "Rice", profitMode: "TPM" | "EPS" = "TPM") {
        try {
            const response = await axios.post(
                `${API_URL}/api/gdip/tpia/purchase`,
                {
                    commodityType,
                    profitMode,
                    purchasePrice: 1000000,
                },
                { headers: this.getHeaders() }
            );

            console.log("✅ TPIA Purchase Test Passed");
            console.log("TPIA ID:", response.data.data.tpiaId);
            console.log("Insurance Certificate:", response.data.data.insuranceCertificateNumber);
            return response.data.data;
        } catch (error: any) {
            console.error("❌ TPIA Purchase Test Failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Test portfolio retrieval
     */
    async testGetPortfolio() {
        try {
            const response = await axios.get(`${API_URL}/api/gdip/portfolio`, {
                headers: this.getHeaders(),
            });

            console.log("✅ Portfolio Test Passed");
            console.log("Total TPIAs:", response.data.data.summary.totalTPIAs);
            console.log("Total Invested:", response.data.data.summary.totalInvested);
            return response.data.data;
        } catch (error: any) {
            console.error("❌ Portfolio Test Failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Test profit mode switching
     */
    async testSwitchProfitMode(tpiaId: string, newMode: "TPM" | "EPS") {
        try {
            const response = await axios.put(
                `${API_URL}/api/gdip/tpia/${tpiaId}/profit-mode`,
                { profitMode: newMode },
                { headers: this.getHeaders() }
            );

            console.log("✅ Profit Mode Switch Test Passed");
            console.log("New Mode:", response.data.data.profitMode);
            return response.data.data;
        } catch (error: any) {
            console.error("❌ Profit Mode Switch Test Failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log("🧪 Starting GDIP Tests...\n");

        try {
            // Test 1: Purchase TPIA
            console.log("Test 1: Purchase TPIA");
            const tpia = await this.testPurchaseTPIA();
            console.log("");

            // Test 2: Get Portfolio
            console.log("Test 2: Get Portfolio");
            await this.testGetPortfolio();
            console.log("");

            // Test 3: Switch Profit Mode
            console.log("Test 3: Switch Profit Mode");
            await this.testSwitchProfitMode(tpia._id, "EPS");
            console.log("");

            console.log("✅ All GDIP Tests Passed!");
            return true;
        } catch (error) {
            console.error("❌ GDIP Tests Failed");
            return false;
        }
    }
}

/**
 * Admin test helper
 */
export class GDIPAdminTestHelper {
    private token: string;

    constructor(adminToken: string) {
        this.token = adminToken;
    }

    private getHeaders() {
        return {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
        };
    }

    /**
     * Test cycle creation
     */
    async testCreateCycle(gdcId: string) {
        try {
            const response = await axios.post(
                `${API_URL}/api/gdip/admin/cycle/create`,
                {
                    gdcId,
                    commodityType: "Rice",
                    commodityQuantity: 100,
                    purchasePrice: 9500000,
                },
                { headers: this.getHeaders() }
            );

            console.log("✅ Cycle Creation Test Passed");
            console.log("Cycle ID:", response.data.data.cycleId);
            return response.data.data;
        } catch (error: any) {
            console.error("❌ Cycle Creation Test Failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Test cycle completion
     */
    async testCompleteCycle(cycleId: string) {
        try {
            const response = await axios.post(
                `${API_URL}/api/gdip/admin/cycle/${cycleId}/complete`,
                {
                    salePrice: 10500000,
                    tradingCosts: 50000,
                },
                { headers: this.getHeaders() }
            );

            console.log("✅ Cycle Completion Test Passed");
            console.log("Profit Generated:", response.data.data.totalProfitGenerated);
            console.log("ROI:", response.data.data.actualProfitRate + "%");
            return response.data.data;
        } catch (error: any) {
            console.error("❌ Cycle Completion Test Failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Test profit distribution
     */
    async testDistributeProfits(cycleId: string) {
        try {
            const response = await axios.post(
                `${API_URL}/api/gdip/admin/cycle/${cycleId}/distribute`,
                {},
                { headers: this.getHeaders() }
            );

            console.log("✅ Profit Distribution Test Passed");
            return response.data;
        } catch (error: any) {
            console.error("❌ Profit Distribution Test Failed:", error.response?.data || error.message);
            throw error;
        }
    }
}

/**
 * Example usage:
 * 
 * import { GDIPTestHelper, GDIPAdminTestHelper } from './utils/gdip.test';
 * 
 * // Partner tests
 * const partnerTests = new GDIPTestHelper('partner_jwt_token');
 * await partnerTests.runAllTests();
 * 
 * // Admin tests
 * const adminTests = new GDIPAdminTestHelper('admin_jwt_token');
 * await adminTests.testCreateCycle('gdcId');
 */

export default {
    GDIPTestHelper,
    GDIPAdminTestHelper,
};
