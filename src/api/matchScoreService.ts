import { supabase } from './supabase.js';
import { supabaseDb } from './supabaseDb.js';

export interface MatchScore {
    prediction_id: string | null,
    user_id: string,
    username: string,
    bg_colour: string | null,
    profile_picture_url: string| null,
    match_id: string,
    gameweek_id: string,
    home_team: string,
    away_team: string,
    match_time: Date,
    final_home_score: number | null,
    final_away_score: number | null,
    api_match_id: string | null,
    home_team_api_id: string | null,
    away_team_api_id: string | null,
    home_crest_url: string | null,
    away_crest_url: string | null,
    predicted_home_score: number | null,
    predicted_away_score: number | null,
    created_by_admin: boolean,
    total_points: number | null,
    total_correct_scores: number | null,
    match_points: number | null
}

export const matchScoreService = {
    /**
     * Get gameweek predictions for a user
     * @param userId - User ID
     * @param gameweekId - The gameweek for which to retrieve user's predictions for
     * @returns {Promise<{data: Array, error: Object}>}
     */
    async getUserGameweekMatches(
        userId: string, 
        gameweekId: string
    ): Promise<{data: Array<MatchScore>, error: any}> {
        try {
            const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
                .from('match_score_view')
                .select('*')
                .eq('user_id', userId)
                .eq('gameweek_id', gameweekId)
                .order('match_time', { ascending: false })
            )

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error('Error fetching user predictions:', error)
            return { data: null, error }
        }
    },
}