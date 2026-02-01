import { gameweeksService } from "../src/api/gameweeksService.js";
import { footballApiServer } from "./footballApi.server.js";

export default async function handler(req, res) {
  try {
    console.log("Running scheduled job...");

    const matches = await gameweeksService.fetchFinishedMatches();

    console.log(`Found ${matches.length} finished matches to update.`);

    for (const match of matches) {
      const { homeScore, awayScore } =
        await footballApiServer.fetchMatchScore(match.api_match_id);

      if (homeScore !== null && awayScore !== null) {
        await gameweeksService.updateMatchScore(
          match.id,
          homeScore,
          awayScore
        );
      }
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: true });
  }
}
