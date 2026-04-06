import callPakfollowersAPI from './server/utils/pakfollowers.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const testAPI = async () => {
    console.log("==========================================");
    console.log("🚦 INITIATING UPSTREAM API TEST");
    console.log("==========================================");
    try {
        console.log("1. Checking API Balance...");
        const balanceResponse = await callPakfollowersAPI({ action: 'balance' });
        console.log("✅ Balance Response:", balanceResponse);

        console.log("\n2. Fetching Services (First 3)...");
        const servicesResponse = await callPakfollowersAPI({ action: 'services' });
        
        if (Array.isArray(servicesResponse)) {
            console.log(`✅ Fetched ${servicesResponse.length} services successfully.`);
            console.log("🔍 Preview:", servicesResponse.slice(0, 3));
        } else {
             console.log("⚠️ Unexpected Services Output:", servicesResponse);
        }

        console.log("\n✅ ALL TESTS COMPLETED SECURELY!");
    } catch (error) {
        console.error("❌ CRITICAL API ERROR:", error.message);
    }
};

testAPI();
