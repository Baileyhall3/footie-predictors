// Use ES module import instead of CommonJS require
import { gameweeksService } from "../src/api/gameweeksService.js";

export default async function handler(req, res) {
    try {
        console.log("Running scheduled job: Updating gameweek deadlines...");
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Running in Vercel:", !!process.env.VERCEL);
        
        // Force Node.js environment detection
        global.window = undefined;
        
        // Now we can use the service
        await gameweeksService.updateGameweeksLockStatus();

        res.status(200).json({ message: "Gameweek deadlines updated successfully" });
    } catch (error) {
        console.error("Error updating gameweek deadlines:", error);
        res.status(500).json({ error: "Failed to update gameweek deadlines" });
    }
}
