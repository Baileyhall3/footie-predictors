import { gameweeksService } from "../src/api/gameweeksService.js";
import { footballApiServer } from "./footballApi.server.js";

export default async function handler(req, res) {
  try {
    console.log("Running scheduled job...");

    const matches = await gameweeksService.fetchFinishedMatches();
    console.log(`Found ${matches.length} finished matches to update.`);

    if (!matches.length) {
      return res.status(200).json({ ok: true, updated: 0 });
    }

    const updates = [];

    for (const match of matches) {
      try {
        const { homeScore, awayScore } =
          await footballApiServer.fetchMatchScore(match.api_match_id);
  
        if (homeScore !== null && awayScore !== null) {
          updates.push({
            match_id: match.id,
            home_score: homeScore,
            away_score: awayScore,
          });
        }
      } catch (e) {
        console.error(`Error fetching score for match ID ${match.api_match_id}:`, e);
      }
    }

    if (!updates.length) {
      console.log("✅ No matches had final scores yet.");
      return res.status(200).json({ ok: true, updated: 0 });
    }

    await gameweeksService.updateMatchScoresBatch(updates);

    console.log("✅ Match scores updated successfully.");

    res.status(200).json({
      ok: true,
      updated: updates.length,
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: true });
  }
}
