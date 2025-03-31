import { footballApiService } from "../src/api/footballApiService";

export default async function handler(req, res) {
    try {
        console.log("Running scheduled job: Updating match scores...");
        
        await footballApiService.updateMatchScores();

        res.status(200).json({ message: "Match scores updated successfully" });
    } catch (error) {
        console.error("Error updating match scores:", error);
        res.status(500).json({ error: "Failed to update match scores" });
    }
}