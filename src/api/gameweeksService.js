import { supabase } from './supabase'
import { supabaseDb } from './supabaseDb'

/**
 * Service for managing gameweeks and matches
 */
export const gameweeksService = {
  /**
   * Get all gameweeks for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getGameweeks(groupId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('gameweeks')
          .select('*')
          .eq('group_id', groupId)
          .order('week_number', { ascending: true })
      )

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching gameweeks:', error)
      return { data: null, error }
    }
  },

  /**
   * Get active gameweek for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Object | null, error: Object | null}>}
   */
  async getActiveGameweek(groupId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('gameweeks')
          .select('*')
          .eq('group_id', groupId)
          .eq('is_active', true)
          .limit(1)
      )

      if (error) throw error

      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error('Error fetching gameweek:', error)
      return { data: null, error }
    }
  },

  /**
   * Get a gameweek by ID
   * @param {string} id - Gameweek ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getGameweekById(id) {
    return supabaseDb.getById('gameweeks', id)
  },

  /**
   * Create a new gameweek
   * @param {Object} gameweek - Gameweek data
   * @param {string} gameweek.group_id - Group ID
   * @param {number} gameweek.week_number - Week number
   * @param {string} gameweek.deadline - Deadline timestamp
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createGameweek(gameweek) {
    return supabaseDb.create('gameweeks', gameweek)
  },

  /**
   * Update a gameweek
   * @param {string} id - Gameweek ID
   * @param {Object} data - Updated gameweek data
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateGameweek(id, data) {
    return supabaseDb.update('gameweeks', id, data)
  },

  /**
   * Delete a gameweek
   * @param {string} id - Gameweek ID
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async deleteGameweek(id) {
    return supabaseDb.delete('gameweeks', id)
  },

  /**
   * Get all matches for a gameweek
   * @param {string} gameweekId - Gameweek ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getMatches(gameweekId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('matches')
          .select('*')
          .eq('gameweek_id', gameweekId)
          .order('match_time', { ascending: true })
      )

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching matches:', error)
      return { data: null, error }
    }
  },

  /**
   * Get a match by ID
   * @param {string} id - Match ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getMatchById(id) {
    return supabaseDb.getById('matches', id)
  },

  /**
   * Create a new match
   * @param {Object} match - Match data
   * @param {string} match.gameweek_id - Gameweek ID
   * @param {number} match.api_match_id - API match ID
   * @param {string} match.home_team - Home team name
   * @param {string} match.away_team - Away team name
   * @param {string} match.match_time - Match time timestamp
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createMatch(match) {
    return supabaseDb.create('matches', match)
  },

  /**
   * Update a match
   * @param {string} id - Match ID
   * @param {Object} data - Updated match data
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateMatch(id, data) {
    return supabaseDb.update('matches', id, data)
  },

  /**
   * Delete a match
   * @param {string} id - Match ID
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async deleteMatch(id) {
    return supabaseDb.delete('matches', id)
  },

  /**
   * Update match scores
   * @param {string} id - Match ID
   * @param {number} homeScore - Home team score
   * @param {number} awayScore - Away team score
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateMatchScore(id, homeScore, awayScore) {
    return supabaseDb.update('matches', id, {
      final_home_score: homeScore,
      final_away_score: awayScore
    })
  },

  /**
   * Get all matches for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getGroupMatches(groupId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('matches')
          .select(`
            *,
            gameweeks!inner (
              id,
              week_number,
              deadline,
              group_id
            )
          `)
          .eq('gameweeks.group_id', groupId)
          .order('match_time', { ascending: true })
      )

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching group matches:', error)
      return { data: null, error }
    }
  },

  /**
   * Get upcoming matches for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getUpcomingMatches(groupId) {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('matches')
          .select(`
            *,
            gameweeks!inner (
              id,
              week_number,
              deadline,
              group_id
            )
          `)
          .eq('gameweeks.group_id', groupId)
          .gt('match_time', now)
          .order('match_time', { ascending: true })
      )

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching upcoming matches:', error)
      return { data: null, error }
    }
  }
}
