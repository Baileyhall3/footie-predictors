import { supabaseService } from "./supabaseService.js";

export default async function handler(req, res) {
  try {
    console.log("Running gameweek generation job...");

    // ---------------------------------------------------------
    // 1. Get seasons that need a new gameweek
    // ---------------------------------------------------------

    const { data: seasons, error: seasonsError } =
      await supabaseService.rpc(
        "get_seasons_needing_gameweek"
      );

    if (seasonsError) {
      throw seasonsError;
    }

    if (!seasons?.length) {
      console.log("✅ No seasons need a new gameweek.");

      return res.status(200).json({
        ok: true,
        generated: 0
      });
    }

    console.log(
      `Found ${seasons.length} season(s) requiring a new gameweek.`
    );

    // ---------------------------------------------------------
    // 2. Generate gameweek for each season
    // ---------------------------------------------------------

    const results = [];

    for (const season of seasons) {
      console.log(
        `Generating gameweek for season ${season.season_id}...`
      );

      try {
        const { data, error } =
          await supabaseService.functions.invoke(
            "generate-gameweek",
            {
              body: {
                season_id: season.season_id
              }
            }
          );

        if (error) {
          console.error(
            `❌ Failed to generate gameweek for season ${season.season_id}:`,
            error
          );

          results.push({
            season_id: season.season_id,
            success: false,
            error: error.message
          });

          continue;
        }

        console.log(
          `✅ Gameweek generated for season ${season.season_id}.`
        );

        results.push({
          season_id: season.season_id,
          success: true,
          data
        });
      } catch (error) {
        console.error(
          `❌ Error generating gameweek for season ${season.season_id}:`,
          error
        );

        results.push({
          season_id: season.season_id,
          success: false,
          error: error instanceof Error
            ? error.message
            : "Unknown error"
        });
      }
    }

    // ---------------------------------------------------------
    // 3. Return results
    // ---------------------------------------------------------

    const generated = results.filter(
      result => result.success
    ).length;

    const failed = results.filter(
      result => !result.success
    ).length;

    console.log(
      `Gameweek generation complete. Generated: ${generated}, Failed: ${failed}`
    );

    return res.status(200).json({
      ok: failed === 0,
      generated,
      failed,
      results
    });

  } catch (error) {
    console.error(
      "Gameweek generation job failed:",
      error
    );

    return res.status(500).json({
      ok: false,
      error: error instanceof Error
        ? error.message
        : "Unknown error"
    });
  }
}