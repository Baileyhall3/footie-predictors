import { reactive } from 'vue'
import { leaderboardService } from '../api/leaderboardService'
import { userStore } from './userStore'
import { groupsStore } from './groupsStore'
import { predictionsStore } from './predictionsStore'

// Create a reactive state object
const state = reactive({
  leaderboard: [],
  gameweekScores: [],
  userScores: [],
  topPerformers: [],
  userPosition: null,
  loading: false,
  error: null
})

// Create and export the leaderboard store
export const leaderboardStore = {
  // Getters
  get leaderboard() {
    return state.leaderboard
  },
  get gameweekScores() {
    return state.gameweekScores
  },
  get userScores() {
    return state.userScores
  },
  get topPerformers() {
    return state.topPerformers
  },
  get userPosition() {
    return state.userPosition
  },
  get loading() {
    return state.loading
  },
  get error() {
    return state.error
  },

  // Methods
  async fetchGroupLeaderboard(groupId) {
    try {
      state.loading = true
      state.error = null

      // const currentGroup = groupsStore.currentGroup

      // if (currentGroup?.id === groupId && state.leaderboard.length > 0) {
      //   return { data: state.leaderboard, error: null }
      // }

      const { data, error } = await leaderboardService.getGroupLeaderboard(groupId)

      if (error) throw error

      state.leaderboard = data || []
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchGameweekScores(groupId, gameweekId) {
    try {
      state.loading = true
      state.error = null

      // const currentGroup = groupsStore.currentGroup
      // const currentGameweek = predictionsStore.currentGameweek

      // if (currentGroup?.id === groupId && 
      //   currentGameweek?.id === gameweekId && 
      //   state.gameweekScores.length > 0) {
      //   return { data: state.gameweekScores, error: null }
      // }

      const { data, error } = await leaderboardService.getGameweekScores(groupId, gameweekId)

      if (error) throw error

      state.gameweekScores = data || []
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchUserScores(groupId, userId = null) {
    try {
      state.loading = true
      state.error = null

      // If no userId is provided, use the current user
      const targetUserId = userId || (userStore.user ? userStore.user.id : null)
      
      if (!targetUserId) throw new Error('User ID is required')

      const { data, error } = await leaderboardService.getUserScores(groupId, targetUserId)

      if (error) throw error

      state.userScores = data || []
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchTopPerformers(groupId, limit = 5) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await leaderboardService.getTopPerformers(groupId, limit)

      if (error) throw error

      state.topPerformers = data || []
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchUserPosition(groupId, userId = null) {
    try {
      state.loading = true
      state.error = null

      // If no userId is provided, use the current user
      const targetUserId = userId || (userStore.user ? userStore.user.id : null)
      
      if (!targetUserId) throw new Error('User ID is required')

      const { data, error } = await leaderboardService.getUserPosition(groupId, targetUserId)

      if (error) throw error

      state.userPosition = data
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  clearError() {
    state.error = null
  }
}
