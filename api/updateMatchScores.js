import { gameweeksService } from "../src/api/gameweeksService.js";
import { footballApiServer } from "./footballApi.server.js";

const CHUNK_SIZE = 25;

export default async function handler(req, res) {
  try {
    console.log("Running scheduled job...");

    const matches = await gameweeksService.fetchFinishedMatches();
    console.log(`Found ${matches.length} finished matches to update.`);

    if (!matches.length) {
      return res.status(200).json({ ok: true, updated: 0 });
    }

    const updates = [];

    // split into chunks of 25
    for (let i = 0; i < matches.length; i += CHUNK_SIZE) {
      const chunk = matches.slice(i, i + CHUNK_SIZE);

      const apiMatchIds = chunk.map(m => m.api_match_id);

      try {
        const finishedMatches =
          await footballApiServer.getFinishedMatches(apiMatchIds);

        // index by api_match_id for fast lookup
        const finishedById = new Map(
          finishedMatches.map(m => [
            m.id,
            {
              homeScore: m.score.fullTime.home,
              awayScore: m.score.fullTime.away
            }
          ])
        );

        for (const match of chunk) {
          const score = finishedById.get(match.api_match_id);

          if (score && score.homeScore !== null && score.awayScore !== null) {
            updates.push({
              match_id: match.id,
              home_score: score.homeScore,
              away_score: score.awayScore
            });
          }
        }
      } catch (e) {
        console.error(
          `Error fetching scores for match chunk:`,
          apiMatchIds,
          e
        );
      }
    }

    if (!updates.length) {
      console.log("✅ No matches had final scores yet.");
      return res.status(200).json({ ok: true, updated: 0 });
    }

    await gameweeksService.updateMatchScoresBatch(updates);

    console.log("✅ Match scores updated successfully.");

    return res.status(200).json({
      ok: true,
      updated: updates.length
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: true });
  }
}
