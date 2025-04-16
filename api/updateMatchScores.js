// Use ES module import instead of CommonJS require
import { footballApiService, initDependencies } from "../src/api/footballApiService.js";
import { gameweeksService } from "../src/api/gameweeksService.js";
import { supabaseService } from "./supabaseService.js";

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
        await updateMatchScores();

        res.status(200).json({ message: "Match scores updated successfully" });
    } catch (error) {
        console.error("Error updating match scores:", error);
        res.status(500).json({ error: "Failed to update match scores" });
    }
}

async function updateMatchScores(gameweekId = null) {
    console.log('Checking for finished matches...');

    const finishedMatches = await gameweeksService.fetchFinishedMatches(gameweekId);
    const now = new Date();

    const matches = finishedMatches.filter(
        (x) => x.api_match_id && new Date(x.match_time) < now
    );

    if (!matches.length) {
        console.log('No matches need updating.');
        return;
    }

    const unfinishedMatches = [];

    // Fetch all match scores in parallel
    const matchUpdates = await Promise.allSettled(
        matches.map(async (match) => {
            try {
                const { homeScore, awayScore } = await footballApiService.fetchMatchScore(match.api_match_id);

                if (homeScore !== null && awayScore !== null) {
                    await updateMatchScore(match.id, homeScore, awayScore);
                    console.log(`✅ Updated match ${match.id} with final scores.`);
                } else {
                unfinishedMatches.push(match.id);
                }
            } catch (error) {
                console.error(`❌ Failed to update match ${match.id}:`, error);
            }
        })
    );

    if (unfinishedMatches.length) {
        console.warn(`⚠️ The following matches are not finished yet: ${unfinishedMatches.join(', ')}`);
    }
    
    console.log('Match score updates completed.');
}

/**
 * Update a single match's final scores
 * @param {string} id - Match ID
 * @param {number} homeScore
 * @param {number} awayScore
 * @returns {Promise<{ data: Object|null, error: Object|null }>}
 */
async function updateMatchScore(id, homeScore, awayScore) {
    const { data, error } = await supabaseService
        .from('matches')
        .update({
            final_home_score: homeScore,
            final_away_score: awayScore
        })
        .eq('id', id);

    if (error) {
        console.error(`❌ Error updating match ${id}:`, error);
    } else {
        console.log(`✅ Match ${id} updated successfully.`);
    }

    return { data, error };
}
