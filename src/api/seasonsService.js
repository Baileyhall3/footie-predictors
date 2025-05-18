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
                .from('gameweeks')
                .select(`*`)
                .eq('season_id', seasonId)
                .order('week_number', { ascending: true })
            );
        
            if (error) throw error;
    
            return { data, error: null }
        } catch(err) {
            console.error('Error fetching season gameweeks', error)
            return { data: null, error }
        }
    },
}
