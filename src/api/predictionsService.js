import { supabase } from './supabase.js';
import { supabaseDb } from './supabaseDb.js';

/**
 * Service for managing predictions
 */
export const predictionsService = {
  /**
   * Get a user's prediction for a match
   * @param {string} userId - User ID
   * @param {string} matchId - Match ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getUserPrediction(userId, matchId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('predictions')
          .select('*')
          .eq('user_id', userId)
          .eq('match_id', matchId)
          .single()
      )

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user prediction:', error)
      return { data: null, error }
    }
  },
  // async getUserPredictionsMatchesView(userId, gameweekId) {
  //   try {
  //     const { data, error } = await supabaseDb.customQuery((supabase) =>
  //       supabase
  //       .from("user_predictions_view")
  //       .select("*")
  //       .eq("user_id", userId)
  //       .eq("gameweek_id", gameweekId)
  //     )

  //     if (error) {
  //       console.error("Error fetching user predictions:", error);
  //     }

  //     return { data, error: null }
  //   } catch (error) {
  //     console.error('Error fetching user prediction:', error)
  //     return { data: null, error }
  //   }
  // },
  
  /**
   * Get all predictions for a match
   * @param {string} matchId - Match ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getMatchPredictions(matchId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('predictions')
          .select(`
            *,
            users!inner (
              id,
              username,
              is_fake
            ),
            matches (
              id,
              gameweek_id,
              home_team,
              away_team,
              match_time,
              final_home_score,
              final_away_score
            )
          `)
          .eq('match_id', matchId)
      )

      if (error) throw error

      // Transform the data to a more usable format
      const predictions = data.map(prediction => ({
        id: prediction.id,
        match_id: prediction.matches.id,
        user_id: prediction.user_id,
        username: prediction.users.username,
        predicted_home_score: prediction.predicted_home_score,
        predicted_away_score: prediction.predicted_away_score,
        final_home_score: prediction.matches.final_home_score,
        final_away_score: prediction.matches.final_away_score,
        is_locked: prediction.is_locked,
        created_at: prediction.created_at
      }))

      return { data: predictions, error: null }
    } catch (error) {
      console.error('Error fetching match predictions:', error)
      return { data: null, error }
    }
  },

  /**
   * Get all predictions for a user in a gameweek
   * @param {string} userId - User ID
   * @param {string} gameweekId - Gameweek ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getUserGameweekPredictions(userId, gameweekId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('predictions')
          .select(`
            *,
            matches!inner (
              id,
              gameweek_id,
              home_team,
              away_team,
              match_time,
              final_home_score,
              final_away_score
            )
          `)
          .eq('user_id', userId)
          .eq('matches.gameweek_id', gameweekId)
      )

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user gameweek predictions:', error)
      return { data: null, error }
    }
  },

  /**
   * Get all predictions for a gameweek, optionally filtering only fake users' predictions
   * @param {string} gameweekId - Gameweek ID
   * @param {boolean} onlyFakeUsers - Whether to filter by fake users
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getGameweekPredictions(gameweekId, onlyFakeUsers = false) {
    try {
      const { data, error } = await supabaseDb.customQuery(async (supabase) => {
        // Step 1: Get all match IDs for the gameweek
        const { data: matchRows, error: matchError } = await supabase
          .from('matches')
          .select('id')
          .eq('gameweek_id', gameweekId);

        if (matchError) throw matchError;
        if (!matchRows || matchRows.length === 0) return [];

        const matchIds = matchRows.map((match) => match.id);

        // Step 2: Get predictions that match those match IDs
        let query = supabase
          .from('predictions')
          .select(`
            *,
            users!inner (
              id,
              username,
              is_fake
            ),
            matches (
              id,
              gameweek_id,
              home_team,
              away_team,
              match_time,
              final_home_score,
              final_away_score
            )
          `)
          .in('match_id', matchIds)
          .order('match_time', { foreignTable: 'matches', ascending: true });

        if (onlyFakeUsers) {
          query = query.eq('users.is_fake', true);
        }

        const { data: predictions, error: predictionError } = await query;

        if (predictionError) throw predictionError;

        return { data: predictions, error: null };
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching gameweek predictions:', error);
      return { data: null, error };
    }
  },


  /**
   * Create or update a prediction
   * @param {string} userId - User ID
   * @param {string} matchId - Match ID
   * @param {number} homeScore - Predicted home score
   * @param {number} awayScore - Predicted away score
   * @param {boolean} createdByAdmin - If the prediction was made by admin (fake users only)
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async savePrediction(userId, matchId, homeScore, awayScore, createdByAdmin = false) {
    try {
      // Check if prediction already exists
      const { data: existingPrediction } = await this.getUserPrediction(userId, matchId)
      
      if (existingPrediction) {
        // Update existing prediction if not locked
        if (existingPrediction.is_locked) {
          throw new Error('Prediction is locked and cannot be updated')
        }
        
        return supabaseDb.update('predictions', existingPrediction.id, {
          predicted_home_score: homeScore,
          predicted_away_score: awayScore
        })
      } else {
        // Create new prediction
        return supabaseDb.create('predictions', {
          user_id: userId,
          match_id: matchId,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
          is_locked: false,
          created_by_admin: createdByAdmin
        })
      }
    } catch (error) {
      console.error('Error saving prediction:', error)
      return { data: null, error }
    }
  },

  /**
   * Lock predictions for a match
   * @param {string} matchId - Match ID
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async lockMatchPredictions(matchId) {
    try {
      const { error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('predictions')
          .update({ is_locked: true })
          .eq('match_id', matchId)
      )

      if (error) throw error

      return { success: true, error: null }
    } catch (error) {
      console.error('Error locking match predictions:', error)
      return { success: false, error }
    }
  },

  /**
   * Lock all predictions for a gameweek
   * @param {string} gameweekId - Gameweek ID
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async lockGameweekPredictions(gameweekId) {
    try {
      // Get all matches in the gameweek
      const { data: matches, error: matchesError } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('matches')
          .select('id')
          .eq('gameweek_id', gameweekId)
      )

      if (matchesError) throw matchesError

      // Lock predictions for each match
      for (const match of matches) {
        const { error } = await this.lockMatchPredictions(match.id)
        if (error) throw error
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Error locking gameweek predictions:', error)
      return { success: false, error }
    }
  },

  /**
 * Calculate scores for a match
 * @param {string} matchId - Match ID
 * @returns {Promise<{success: boolean, error: Object}>}
 */
async calculateMatchScores(matchId) {

  console.log(`Calculating scores for match: ${matchId}`);

  try {
    // Get the match
    const { data: match, error: matchError } = await supabaseDb.getById('matches', matchId);
    if (matchError) throw matchError;

    // If match doesn't have final scores, can't calculate
    if (match.final_home_score === null || match.final_away_score === null) {
      // throw new Error('Match does not have final scores');
      console.error(`Skipping match ${matchId}: Scores not updated yet.`);
      return { success: false, error: 'Match does not have final scores' };
    }

    // Get the gameweek
    const { data: gameweek, error: gameweekError } = await supabaseDb.getById('gameweeks', match.gameweek_id);
    if (gameweekError) throw gameweekError;

    // Get the group
    const { data: group, error: groupError } = await supabaseDb.customQuery((supabase) =>
      supabase.from('groups').select('*').eq('id', gameweek.group_id).single()
    );
    if (groupError) throw groupError;

    // Get all predictions for this match
    const { data: predictions, error: predictionsError } = await supabaseDb.customQuery((supabase) =>
      supabase.from('predictions').select('*').eq('match_id', matchId)
    );
    if (predictionsError) throw predictionsError;

    // Calculate points for each prediction
    for (const prediction of predictions) {
      let points = 0;
      let isExactScore = false;
      let isCorrectResult = false;

      // Check if exact score
      if (
        prediction.predicted_home_score === match.final_home_score &&
        prediction.predicted_away_score === match.final_away_score
      ) {
        points = group.exact_score_points;
        isExactScore = true;
      }
      // Check if correct result
      else if (
        (prediction.predicted_home_score > prediction.predicted_away_score && match.final_home_score > match.final_away_score) ||
        (prediction.predicted_home_score < prediction.predicted_away_score && match.final_home_score < match.final_away_score) ||
        (prediction.predicted_home_score === prediction.predicted_away_score && match.final_home_score === match.final_away_score)
      ) {
        points = group.correct_result_points;
        isCorrectResult = true;
      } else {
        points = group.incorrect_points;
      }

      // Update user's score for this gameweek
      const { data: existingScore, error: scoreError } = await supabaseDb.customQuery((supabase) =>
        supabase.from('scores').select('*').eq('user_id', prediction.user_id).eq('gameweek_id', gameweek.id).single()
      );

      if (scoreError && scoreError.code !== 'PGRST116') throw scoreError;

      if (existingScore) {
        // Update existing score
        await supabaseDb.update('scores', existingScore.id, {
          total_points: existingScore.total_points + points,
          total_correct_scores: existingScore.total_correct_scores + (isExactScore ? 1 : 0),
        });
      } else {
        // Create new score
        await supabaseDb.create('scores', {
          user_id: prediction.user_id,
          gameweek_id: gameweek.id,
          total_points: points,
          total_correct_scores: isExactScore ? 1 : 0,
        });
      }

      // Update user's leaderboard entry
      const { data: leaderboardEntry, error: leaderboardError } = await supabaseDb.customQuery((supabase) =>
        supabase.from('leaderboard').select('*').eq('user_id', prediction.user_id).eq('group_id', gameweek.group_id).single()
      );

      if (leaderboardError && leaderboardError.code !== 'PGRST116') throw leaderboardError;

      if (leaderboardEntry) {
        // Update existing leaderboard entry
        await supabaseDb.update('leaderboard', leaderboardEntry.id, {
          total_points: leaderboardEntry.total_points + points,
          total_correct_scores: leaderboardEntry.total_correct_scores + (isExactScore ? 1 : 0),
          total_correct_results: leaderboardEntry.total_correct_results + (isCorrectResult ? 1 : 0),
        });
      } else {
        // Create new leaderboard entry
        await supabaseDb.create('leaderboard', {
          user_id: prediction.user_id,
          group_id: gameweek.group_id,
          total_points: points,
          total_correct_scores: isExactScore ? 1 : 0,
          total_correct_results: isCorrectResult ? 1 : 0,
        });
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error calculating match scores:', error);
    return { success: false, error };
  }
},

/**
   * Get all predictions for a user in a gameweek
   * @param {string} userId - User ID
   * @param {string} gameweekId - Gameweek ID
   * @returns {Promise<{data: { predictions: Array<any>, totalPoints: number }, error: Object}>}
   */
async getUserGameweekPredictionsUsingView(userId, gameweekId) {
  try {
    const { data, error } = await supabaseDb.customQuery((supabase) =>
      supabase
        .from('match_predictions')
        .select(`*`)
        .eq('user_id', userId)
        .eq('gameweek_id', gameweekId)
    )

    if (error) throw error

    const mappedData = { predictions: data, totalPoints: data[0]?.total_points }

    return { data: mappedData, error: null }
  } catch (error) {
    console.error('Error fetching user gameweek predictions:', error)
    return { data: null, error }
  }
},

/**
   * Get all predictions for a user in a gameweek
   * @param {string} matchId - Match ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
async getMatchPredictionsUsingView(matchId) {
  try {
    const { data, error } = await supabaseDb.customQuery((supabase) =>
      supabase
        .from('match_predictions')
        .select(`*`)
        .eq('match_id', matchId)
    )

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching match predictions:', error)
    return { data: null, error }
  }
},

}
