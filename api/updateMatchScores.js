// Use ES module import instead of CommonJS require
import { footballApiService, initDependencies } from "../src/api/footballApiService.js";

export default async function handler(req, res) {
    try {
        console.log("Running scheduled job: Updating match scores...");
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Running in Vercel:", !!process.env.VERCEL);
        
        // Force Node.js environment detection
        global.window = undefined;
        
        // Initialize dependencies before using the service
        await initDependencies();
        
        // Log the API base URL and direct access mode
        console.log("API configuration after initialization:");
        console.log("- Direct API access mode:", footballApiService._getFetchOptions().headers ? "Yes" : "No");
        
        // Now we can use the service
        await footballApiService.updateMatchScores();

        res.status(200).json({ message: "Match scores updated successfully" });
    } catch (error) {
        console.error("Error updating match scores:", error);
        res.status(500).json({ error: "Failed to update match scores" });
    }
}
