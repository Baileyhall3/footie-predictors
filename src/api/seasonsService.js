import { supabase } from './supabase'
import { supabaseDb } from './supabaseDb'

/**
 * Service for managing groups and group memberships
 */
export const seasonsService = {

  /**
   * Get a Season by ID
   * @param {string} id - Season ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getSeasonById(id) {
    return supabaseDb.getById('seasons', id)
  },

  /**
     * Get a season by id using custom view
     * @param {string} seasonId - Season ID
     * @returns {Promise<{data: Object, error: Object}>}
     */
  async getSeasonByIdUsingView(seasonId) {
    return supabaseDb.getById('season_with_group', seasonId)
  },

  /**
   * Create a new group
   * @param {object} seasonData - Group data
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createSeason(seasonData) {
    try {
      const { data: season, error } = await supabaseDb.create('seasons', {
        name: seasonData.name,
        start_date: seasonData.start_date,
        end_date: seasonData.end_date,
        group_id: seasonData.group_id
      });
  
      if (error) throw error;
  
      return { data: season, error: null };
    } catch (error) {
      console.error('Error creating season:', error);
      return { data: null, error };
    }
  },  

  /**
   * Update a season
   * @param {string} id - Season ID
   * @param {Object} data - Updated group data
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateSeason(id, data) {
    return supabaseDb.update('seasons', id, data)
  },

  /**
   * Delete a season
   * @param {string} id - Season ID
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async deleteSeason(id) {
    return supabaseDb.delete('seasons', id)
  },

  /**
   * Get all of a group's seasons
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
    async getGroupSeasons(groupId) {
        try {
            const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
                .from('seasons')
                .select(`*`)
                .eq('group_id', groupId)
            );
        
            if (error) throw error;
    
            return { data, error: null }
        } catch (error) {
            console.error('Error fetching group stats:', error)
            return { data: null, error }
        }
    },

    /**
    * Get all associated gameweeks with a season
    * @param {string} seasonId - Season ID
    * @returns {Promise<{data: Object, error: Object}>}
    */
    async getSeasonGameweeks(seasonId) {
        try {
            const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
                .from('gameweeks_with_group')
                .select(`*`)
                .eq('season_id', seasonId)
                .order('week_number', { ascending: true })
            );
        
            if (error) throw error;
    
            return { data, error: null }
        } catch(err) {
            console.error('Error fetching season gameweeks', err)
            return { data: null, err }
        }
    },

    /**
   * Get the leaderboard for a season
   * @param {string} seasonId - Season ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getSeasonLeaderboard(seasonId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('group_members_and_leaderboard')
          .select(`
            *
          `)
          .eq('season_id', seasonId)
          .order('total_points', { ascending: false })
          .order('total_correct_scores', { ascending: false })
      );
  
      if (error) throw error;
  
      const leaderboard = data.map((entry, index) => ({
        ...entry,
        position: index + 1
      }));
  
      // Fetch history for last TWO gameweeks
      const { data: historyRows, error: historyError } = await supabaseDb.customQuery((supabase) =>
        supabase
        .from('leaderboard_history_latest_view')
        .select('*')
        .eq('season_id', seasonId));

      if (historyError) throw historyError;

      const distinctGameweeks = [
        ...new Set(historyRows.map((row) => row.gameweek))
      ].sort((a, b) => b - a); // Descending order
  
      const [latest, previous] = distinctGameweeks;
  
      if (!latest || !previous) {
        return {
          data: leaderboard.map((entry) => ({ ...entry, movement: 'same' })),
          error: null
        };
      }
      
      // Map history data by user and gameweek
      const historyMap = {};
      for (const row of historyRows) {
        if (!historyMap[row.user_id]) historyMap[row.user_id] = {};
        historyMap[row.user_id][row.gameweek] = row.position;
      }

      const leaderboardWithMovement = leaderboard.map((entry) => {
        const userHistory = historyMap[entry.user_id] || {};
        const current = userHistory[latest];
        const prev = userHistory[previous];
  
        let movement = 'same';
        if (current && prev) {
          if (current > prev) movement = 'down';
          else if (current < prev) movement = 'up';
        }
  
        return {
          ...entry,
          movement
        };
      });
  
      return { data: leaderboardWithMovement, error: null };
  
    } catch (error) {
      console.error('Error fetching season leaderboard:', error);
      return { data: null, error };
    }
  },

  /**
     * Get user stats for a season
     * @param {string} seasonId - Season ID
     * @param {string} userId - user ID
     * @returns {Promise<{data: Array, error: Object}>}
     */
    async getSeasonStats(seasonId, userId = null) {
      try {
        
        if (!userId) {
          const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
              .from('user_group_stats')
              .select(`*`)
              .eq('season_id', seasonId)
          );
      
          if (error) throw error;
    
          return { data, error: null }
        } else if (seasonId && userId) {
          const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
              .from('user_group_stats')
              .select(`*`)
              .eq('season_id', seasonId)
              .eq('user_id', userId)
          );
      
          if (error) throw error;
    
          return { data, error: null }
        }
      } catch (error) {
        console.error('Error fetching season stats:', error)
        return { data: null, error }
      }
    },

  /**
   * Get the leaderboard history for a season
   * @param {string} seasonId - Season ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getSeasonLeaderboardHistory(seasonId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('leaderboard_history_view')
          .select(`*`)
          .eq('season_id', seasonId)
          .order('gameweek', { ascending: false })
      );
  
      if (error) throw error;

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching leaderboard history:', error)
      return { data: null, error }
    }
  },
}
