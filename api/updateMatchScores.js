// Use CommonJS require instead of ES module import
const { footballApiService, initDependencies } = require("../src/api/footballApiService.js");

module.exports = async function handler(req, res) {
    try {
        console.log("Running scheduled job: Updating match scores...");
        
        // Initialize dependencies before using the service
        await initDependencies();
        
        // Now we can use the service
        await footballApiService.updateMatchScores();

        res.status(200).json({ message: "Match scores updated successfully" });
    } catch (error) {
        console.error("Error updating match scores:", error);
        res.status(500).json({ error: "Failed to update match scores" });
    }
}
