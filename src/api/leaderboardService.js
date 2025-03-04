import { supabase } from './supabase'
import { supabaseDb } from './supabaseDb'

/**
 * Service for managing leaderboards and scores
 */
export const leaderboardService = {
  /**
   * Get the leaderboard for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getGroupLeaderboard(groupId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('leaderboard')
          .select(`
            *,
            users (
              id,
              username
            )
          `)
          .eq('group_id', groupId)
          .order('total_points', { ascending: false })
      )

      if (error) throw error

      // Transform the data to a more usable format
      const leaderboard = data.map((entry, index) => ({
        position: index + 1,
        id: entry.id,
        user_id: entry.user_id,
        username: entry.users.username,
        total_points: entry.total_points,
        total_correct_scores: entry.total_correct_scores,
        total_correct_results: entry.total_correct_results
      }))

      return { data: leaderboard, error: null }
    } catch (error) {
      console.error('Error fetching group leaderboard:', error)
      return { data: null, error }
    }
  },

  /**
   * Get the gameweek scores for a group
   * @param {string} groupId - Group ID
   * @param {string} gameweekId - Gameweek ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getGameweekScores(groupId, gameweekId) {
    try {
      // First get all users in the group
      const { data: groupMembers, error: membersError } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('group_members')
          .select(`
            user_id,
            users (
              id,
              username
            )
          `)
          .eq('group_id', groupId)
      )

      if (membersError) throw membersError

      // Then get scores for each user for this gameweek
      const { data: scores, error: scoresError } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('scores')
          .select('*')
          .eq('gameweek_id', gameweekId)
          .in('user_id', groupMembers.map(member => member.user_id))
      )

      if (scoresError) throw scoresError

      // Combine the data
      const gameweekScores = groupMembers.map(member => {
        const userScore = scores.find(score => score.user_id === member.user_id) || { total_points: 0 }
        return {
          user_id: member.user_id,
          username: member.users.username,
          total_points: userScore.total_points
        }
      })

      // Sort by points (highest first)
      gameweekScores.sort((a, b) => b.total_points - a.total_points)

      // Add position
      gameweekScores.forEach((score, index) => {
        score.position = index + 1
      })

      return { data: gameweekScores, error: null }
    } catch (error) {
      console.error('Error fetching gameweek scores:', error)
      return { data: null, error }
    }
  },

  /**
   * Get a user's scores across all gameweeks in a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getUserScores(groupId, userId) {
    try {
      // Get all gameweeks for the group
      const { data: gameweeks, error: gameweeksError } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('gameweeks')
          .select('*')
          .eq('group_id', groupId)
          .order('week_number', { ascending: true })
      )

      if (gameweeksError) throw gameweeksError

      // Get scores for each gameweek
      const { data: scores, error: scoresError } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('scores')
          .select('*')
          .eq('user_id', userId)
          .in('gameweek_id', gameweeks.map(gameweek => gameweek.id))
      )

      if (scoresError) throw scoresError

      // Combine the data
      const userScores = gameweeks.map(gameweek => {
        const gameweekScore = scores.find(score => score.gameweek_id === gameweek.id) || { total_points: 0 }
        return {
          gameweek_id: gameweek.id,
          week_number: gameweek.week_number,
          total_points: gameweekScore.total_points
        }
      })

      return { data: userScores, error: null }
    } catch (error) {
      console.error('Error fetching user scores:', error)
      return { data: null, error }
    }
  },

  /**
   * Get the top performers in a group
   * @param {string} groupId - Group ID
   * @param {number} limit - Number of users to return
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getTopPerformers(groupId, limit = 5) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('leaderboard')
          .select(`
            *,
            users (
              id,
              username
            )
          `)
          .eq('group_id', groupId)
          .order('total_points', { ascending: false })
          .limit(limit)
      )

      if (error) throw error

      // Transform the data
      const topPerformers = data.map((entry, index) => ({
        position: index + 1,
        user_id: entry.user_id,
        username: entry.users.username,
        total_points: entry.total_points,
        total_correct_scores: entry.total_correct_scores,
        total_correct_results: entry.total_correct_results
      }))

      return { data: topPerformers, error: null }
    } catch (error) {
      console.error('Error fetching top performers:', error)
      return { data: null, error }
    }
  },

  /**
   * Get a user's position in the leaderboard
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getUserPosition(groupId, userId) {
    try {
      // Get the full leaderboard
      const { data: leaderboard, error } = await this.getGroupLeaderboard(groupId)
      
      if (error) throw error
      
      // Find the user's position
      const userPosition = leaderboard.find(entry => entry.user_id === userId)
      
      if (!userPosition) {
        return { data: { position: 0, total_points: 0 }, error: null }
      }
      
      return { data: userPosition, error: null }
    } catch (error) {
      console.error('Error fetching user position:', error)
      return { data: null, error }
    }
  }
}
