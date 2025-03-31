// Support both ES modules and CommonJS
let gameweeksService, predictionsService;

// Function to initialize dependencies
const initDependencies = async () => {
  try {
    // Try ES module import first (for browser/Vite)
    if (typeof window !== 'undefined' && typeof import.meta !== 'undefined') {
      // We're in a browser/Vite environment where dynamic imports work
      const gameweeksImport = await import('./gameweeksService');
      const predictionsImport = await import('./predictionsService');
      gameweeksService = gameweeksImport.gameweeksService;
      predictionsService = predictionsImport.predictionsService;
      return;
    }
  } catch (e) {
    console.log('ES module import failed, trying CommonJS');
  }
  
  // Fall back to CommonJS require (for Node.js)
  try {
    const gameweeksModule = require('./gameweeksService');
    const predictionsModule = require('./predictionsService');
    gameweeksService = gameweeksModule.gameweeksService;
    predictionsService = predictionsModule.predictionsService;
  } catch (err) {
    console.error('Failed to import dependencies:', err);
    // Create empty placeholders if imports fail
    gameweeksService = { fetchFinishedMatches: async () => [], updateMatchScore: async () => {} };
    predictionsService = { calculateMatchScores: async () => {} };
  }
};

// Initialize dependencies immediately in browser environments
if (typeof window !== 'undefined') {
  initDependencies();
}

// We need to handle both browser (Vite) and Node.js environments
// In browser, use import.meta.env
// In Node.js, use process.env
let BASE_URL;
let API_KEY;

// Check if we're in a browser environment (Vite)
if (typeof window !== 'undefined' && typeof import.meta !== 'undefined') {
  BASE_URL = import.meta.env.VITE_API_BASE_URL;
  API_KEY = import.meta.env.VITE_API_KEY;
} else {
  // We're in Node.js
  BASE_URL = process.env.VITE_API_BASE_URL || '/api';
  API_KEY = process.env.VITE_API_KEY || process.env.FOOTBALL_API_KEY;
}

// Create the service object
const footballApiService = {
  /**
   * Fetch available leagues
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getLeagues() {
    try {
      const response = await fetch(`${BASE_URL}/competitions`);  
      const data = await response.json();
      const selectableLeagueIds = [2016, 2021, 2001, 2015, 2002, 2019, 2224];
      const leagueData = data.competitions.filter(({id}) => selectableLeagueIds.includes(id));

      return { data: leagueData, error: null };
    } catch (error) {
      console.error('Error fetching leagues:', error);
      return { data: null, error };
    }
  },

  /**
   * Fetch upcoming matches for a league
   * @param {number} leagueId - League ID
   * @param {number} teamId - Team ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getMatches(leagueId, teamId) {
    try {
      let response = null;
      
      if (leagueId) {
        response = await fetch(`${BASE_URL}/competitions/${leagueId}/matches`);  
      } else if (teamId) {
        response = await fetch(`${BASE_URL}/teams/${teamId}/matches`);  
      }
      const data = await response.json();
      return { data: data.matches, error: null };
    } catch (error) {
      console.error('Error fetching matches:', error);
      return { data: null, error };
    }
  },

  /**
   * Fetch teams for a league
   * @param {number} leagueId - League ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getTeams(leagueId) {
    try {
      const response = await fetch(`${BASE_URL}/competitions/${leagueId}/teams`);  
      const data = await response.json();
      return { data: data.teams, error: null };
    } catch (error) {
      console.error('Error fetching teams:', error);
      return { data: null, error };
    }
  },

  /**
   * Fetch upcoming matches for a particular team
   * @param {number} teamId - Team ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getMatchesForTeam(teamId) {
    try {
      const response = await fetch(`${BASE_URL}/teams/${teamId}/matches`);  
      const data = await response.json();
      return { data: data.matches, error: null };
    } catch (error) {
      console.error('Error fetching matches for team:', error);
      return { data: null, error };
    }
  },

  /**
   * Fetch upcoming matches for a league
   * @param {number} matchId - Match ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async fetchMatchScore(matchId) {
    try {
      const response = await fetch(`${BASE_URL}/matches/${matchId}`);

      const data = await response.json();
      return {
        homeScore: data.score.fullTime.home ?? null,
        awayScore: data.score.fullTime.away ?? null
      };
    } catch (error) {
      console.error("Error fetching match score from API:", error);
      return { homeScore: null, awayScore: null };
    }
  },

  async updateMatchScores(gameweekId = null) {
    console.log("Checking for finished matches...");

    const finishedMatches = await gameweeksService.fetchFinishedMatches(gameweekId);
    const now = new Date();

    const matches = finishedMatches.filter(x => x.api_match_id && new Date(x.match_time) < now);
    
    if (!matches.length) {
      console.log("No matches need updating.");
      return;
    }

    for (const match of matches) {
      try {
        const { homeScore, awayScore } = await this.fetchMatchScore(match.api_match_id);
        
        if (homeScore !== null && awayScore !== null) {
          await gameweeksService.updateMatchScore(match.id, homeScore, awayScore);
          await predictionsService.calculateMatchScores(match.id);
          console.log(`Updated match ${match.id} with final scores.`);
        }
      } catch (error) {
        console.error(`Failed to update match ${match.id}:`, error);
      }
    }
  },
};

// Exporting using ES Module syntax
export { footballApiService, initDependencies };
