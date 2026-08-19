import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders,
        });
    }

    try {
        // ---------------------------------------------------------
        // 1. Validate request
        // ---------------------------------------------------------

        const { season_id } = await req.json();

        if (!season_id) {
            return new Response(
                JSON.stringify({
                    error: "season_id is required",
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        // ---------------------------------------------------------
        // 2. Get environment variables
        // ---------------------------------------------------------

        const footballDataApiKey = Deno.env.get(
            "FOOTBALL_DATA_API_KEY",
        );

        if (!footballDataApiKey) {
            throw new Error(
                "FOOTBALL_DATA_API_KEY is not configured",
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceRoleKey = Deno.env.get(
            "SUPABASE_SERVICE_ROLE_KEY",
        );

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            throw new Error(
                "Supabase environment variables are not configured",
            );
        }

        // ---------------------------------------------------------
        // 3. Create Supabase client
        // ---------------------------------------------------------

        const supabase = createClient(
            supabaseUrl,
            supabaseServiceRoleKey,
        );

        // ---------------------------------------------------------
        // 4. Get season
        // ---------------------------------------------------------

        const { data: season, error: seasonError } = await supabase
            .from("seasons")
            .select(`
                id,
                name,
                group_id,
                competition_id,
                competition_season_id,
                competitions (
                    id,
                    name,
                    emblem
                )
            `)
            .eq("id", season_id)
            .single();

        if (seasonError) {
            throw seasonError;
        }

        if (!season) {
            throw new Error("Season not found");
        }

        if (!season.competition_id) {
            throw new Error(
                "Season does not have a competition",
            );
        }

        if (!season.competition_season_id) {
            throw new Error(
                "Season does not have a competition season ID",
            );
        }

        if (!season.competitions) {
            throw new Error(
                "Competition not found",
            );
        }

        // ---------------------------------------------------------
        // 5. Get existing gameweeks
        // ---------------------------------------------------------

        const { data: existingGameweeks, error: gameweeksError } =
            await supabase
                .from("gameweeks")
                .select(`
                    id,
                    week_number,
                    api_week_number
                `)
                .eq("season_id", season_id)
                .order("week_number", {
                    ascending: true,
                });

        if (gameweeksError) {
            throw gameweeksError;
        }

        // ---------------------------------------------------------
        // 6. Determine next gameweek
        // ---------------------------------------------------------

        const nextWeekNumber =
            existingGameweeks.length > 0
                ? Math.max(
                    ...existingGameweeks.map(
                        (gameweek) => gameweek.week_number,
                    ),
                ) + 1
                : 1;

        const nextApiWeekNumber =
            existingGameweeks.length > 0
                ? Math.max(
                    ...existingGameweeks
                        .filter(
                            (gameweek) =>
                                gameweek.api_week_number !== null,
                        )
                        .map(
                            (gameweek) =>
                                gameweek.api_week_number,
                        ),
                ) + 1
                : 1;
        
        const existingNextGameweek = existingGameweeks.find(
            (gameweek) =>
                gameweek.week_number === nextWeekNumber ||
                gameweek.api_week_number === nextApiWeekNumber,
        );

        if (existingNextGameweek) {
            console.log(`Gameweek ${existingNextGameweek.week_number} already exists`,);

            return new Response(
                JSON.stringify({
                    success: true,
                    already_exists: true,
                    gameweek: existingNextGameweek,
                    week_number: existingNextGameweek.week_number,
                    api_week_number: existingNextGameweek.api_week_number,
                }),
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        console.log(
            `Generating gameweek ${nextWeekNumber} (API matchday ${nextApiWeekNumber})`,
        );

        // ---------------------------------------------------------
        // 7. Get matches from football-data.org
        // ---------------------------------------------------------

        const response = await fetch(
            `https://api.football-data.org/v4/competitions/${season.competition_id}/matches`,
            {
                headers: {
                    "X-Auth-Token": footballDataApiKey,
                },
            },
        );

        if (!response.ok) {
            const errorBody = await response.text();

            throw new Error(
                `football-data.org returned ${response.status}: ${errorBody}`,
            );
        }

        const footballData = await response.json();

        // ---------------------------------------------------------
        // 8. Filter matches for this API matchday
        // ---------------------------------------------------------

        const seasonMatches = footballData.matches.filter(
            (match: any) =>
                match.season?.id === season.competition_season_id,
        );

        if (seasonMatches.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: `No matches found for competition_season_id ${season.competition_season_id}`,
                    week_number: nextWeekNumber,
                    api_week_number: nextApiWeekNumber,
                }),
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const matchesForGameweek =
            seasonMatches.filter(
                (match: any) =>
                    match.matchday === nextApiWeekNumber,
            );

        if (matchesForGameweek.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: `No matches found for API matchday ${nextApiWeekNumber}`,
                    week_number: nextWeekNumber,
                    api_week_number: nextApiWeekNumber,
                }),
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        // ---------------------------------------------------------
        // 9. Map matches to Footie Predictors format
        // ---------------------------------------------------------

        const matches = matchesForGameweek.map((match: any) => ({
            api_match_id: match.id,
            home_team: match.homeTeam.shortName,
            away_team: match.awayTeam.shortName,
            home_team_api_id: match.homeTeam.id,
            away_team_api_id: match.awayTeam.id,
            home_team_crest: match.homeTeam.crest,
            away_team_crest: match.awayTeam.crest,
            match_time: match.utcDate,
            competition: match.competition.name,
            competition_emblem_url: match.competition.emblem,
        }));

        // ---------------------------------------------------------
        // 10. Determine deadline
        // ---------------------------------------------------------

        const deadline = matchesForGameweek.reduce(
            (earliest: string, match: any) =>
                new Date(match.utcDate) <
                new Date(earliest)
                    ? match.utcDate
                    : earliest,
            matchesForGameweek[0].utcDate,
        );

        // ---------------------------------------------------------
        // 11. Create gameweek using existing RPC
        // ---------------------------------------------------------

        const { data: gameweek, error: createError } =
            await supabase.rpc(
                "create_gameweek_with_matches_and_notifications",
                {
                    p_group_id: season.group_id,
                    p_week_number: nextWeekNumber,
                    p_deadline: deadline,
                    p_is_active: true,
                    p_matches: matches,
                    p_api_week_number: nextApiWeekNumber,
                },
            );

        if (createError) {
            throw createError;
        }

        // ---------------------------------------------------------
        // 12. Return result
        // ---------------------------------------------------------

        return new Response(
            JSON.stringify({
                success: true,
                gameweek,
                week_number: nextWeekNumber,
                api_week_number: nextApiWeekNumber,
                match_count: matches.length,
            }),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            },
        );
    } catch (error) {
        console.error(error);

        return new Response(
            JSON.stringify({
                error: error instanceof Error
                    ? error.message
                    : "Unknown error",
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            },
        );
    }
});