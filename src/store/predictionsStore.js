import { reactive } from 'vue'
import { predictionsService } from '../api/predictionsService'
import { gameweeksService } from '../api/gameweeksService'
import { userStore } from './userStore'

// Create a reactive state object
const state = reactive({
  predictions: [],
  matches: [],
  currentGameweek: null,
  loading: false,
  error: null
})

// Create and export the predictions store
export const predictionsStore = {
  // Getters
  get predictions() {
    return state.predictions
  },
  get matches() {
    return state.matches
  },
  get currentGameweek() {
    return state.currentGameweek
  },
  get loading() {
    return state.loading
  },
  get error() {
    return state.error
  },

  // Methods
  async fetchGameweek(gameweekId) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await gameweeksService.getGameweekById(gameweekId)

      if (error) throw error

      state.currentGameweek = data
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchMatches(gameweekId) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await gameweeksService.getMatches(gameweekId)

      if (error) throw error

      state.matches = data || []
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchUserPredictions(gameweekId) {
    try {
      state.loading = true
      state.error = null

      if (!userStore.user) throw new Error('User not authenticated')

      const { data, error } = await predictionsService.getUserPredictionsMatchesView(userStore.user.id, gameweekId)

      if (error) throw error

      state.predictions = data || []
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async savePrediction(matchId, homeScore, awayScore) {
    try {
      state.loading = true
      state.error = null

      if (!userStore.user) throw new Error('User not authenticated')

      const { data, error } = await predictionsService.savePrediction(
        userStore.user.id,
        matchId,
        homeScore,
        awayScore
      )

      if (error) throw error

      // Update the prediction in the local state
      const index = state.predictions.findIndex(p => 
        p.match_id === matchId && p.user_id === userStore.user.id
      )
      
      if (index !== -1) {
        state.predictions[index] = data
      } else {
        state.predictions.push(data)
      }

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchMatchPredictions(matchId) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await predictionsService.getMatchPredictions(matchId)

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async getUserPrediction(matchId) {
    try {
      state.loading = true
      state.error = null

      if (!userStore.user) throw new Error('User not authenticated')

      const { data, error } = await predictionsService.getUserPrediction(userStore.user.id, matchId)

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchUpcomingMatches(groupId) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await gameweeksService.getUpcomingMatches(groupId)

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async updateMatchScore(matchId, homeScore, awayScore) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await gameweeksService.updateMatchScore(matchId, homeScore, awayScore)

      if (error) throw error

      // Update the match in the local state
      const index = state.matches.findIndex(m => m.id === matchId)
      if (index !== -1) {
        state.matches[index] = {
          ...state.matches[index],
          final_home_score: homeScore,
          final_away_score: awayScore
        }
      }

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async calculateMatchScores(matchId) {
    try {
      state.loading = true
      state.error = null

      const { success, error } = await predictionsService.calculateMatchScores(matchId)

      if (error) throw error

      return { success, error: null }
    } catch (error) {
      state.error = error.message
      return { success: false, error }
    } finally {
      state.loading = false
    }
  },

  clearError() {
    state.error = null
  }
}
