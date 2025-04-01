// ES module version of the file
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

  // Fall back to CommonJS require (for Node.js) - this can be removed after fully switching to ES modules
  try {
    const gameweeksModule = await import('./gameweeksService.js'); // ES module import for gameweeksService
    const predictionsModule = await import('./predictionsService.js'); // ES module import for predictionsService
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
let DIRECT_API_ACCESS = false;

// Log environment information for debugging
console.log('Environment detection:');
console.log('- window defined:', typeof window !== 'undefined');
console.log('- import.meta defined:', typeof import.meta !== 'undefined');

// Always use direct API access in Node.js environments
// This is the safest approach for serverless functions and GitHub Actions
if (typeof window === 'undefined') {
  console.log('- process.env.CI:', process.env?.CI);
  console.log('- process.env.GITHUB_ACTIONS:', process.env?.GITHUB_ACTIONS);
  console.log('- process.env.VERCEL:', process.env?.VERCEL);
  console.log('- process.env.NODE_ENV:', process.env?.NODE_ENV);
  console.log('Node.js environment detected, using direct API access');
  BASE_URL = 'https://api.football-data.org/v4';
  API_KEY = process.env.VITE_API_KEY || process.env.FOOTBALL_API_KEY;
  DIRECT_API_ACCESS = true;
} else {
  // Browser environment - use the proxy
  console.log('Browser environment detected, using proxy');
  BASE_URL = import.meta.env.VITE_API_BASE_URL;
  API_KEY = import.meta.env.VITE_API_KEY;
  DIRECT_API_ACCESS = false;
}

console.log(`API Base URL: ${BASE_URL}`);
console.log(`Direct API Access: ${DIRECT_API_ACCESS}`);

// Create the service object
const footballApiService = {
  /**
   * Helper method to create fetch options with API key when needed
   * @returns {Object} Fetch options
   */
  _getFetchOptions() {
    // When accessing the API directly, we need to include the API key in the headers
    if (DIRECT_API_ACCESS) {
      return {
        headers: {
          'X-Auth-Token': API_KEY,
          'Content-Type': 'application/json',
        }
      };
    }
    return {
      headers: {
        'X-Auth-Token': API_KEY,
      }
    };
  },

  /**
   * Fetch available leagues
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getLeagues() {
    try {
      const response = await fetch(`${BASE_URL}/competitions`, this._getFetchOptions());
      const data = await response.json();
      const selectableLeagueIds = [2016, 2021, 2001, 2015, 2002, 2019, 2224];
      const leagueData = data.competitions.filter(({ id }) => selectableLeagueIds.includes(id));

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
        response = await fetch(`${BASE_URL}/competitions/${leagueId}/matches`, this._getFetchOptions());
      } else if (teamId) {
        response = await fetch(`${BASE_URL}/teams/${teamId}/matches`, this._getFetchOptions());
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
      const response = await fetch(`${BASE_URL}/competitions/${leagueId}/teams`, this._getFetchOptions());
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
      const response = await fetch(`${BASE_URL}/teams/${teamId}/matches`, this._getFetchOptions());
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
      const response = await fetch(`${BASE_URL}/matches/${matchId}`, this._getFetchOptions());

      const data = await response.json();

      if (data.status === "FINISHED") {
        return {
          homeScore: data.score.fullTime.home ?? null,
          awayScore: data.score.fullTime.away ?? null,
        };
      } else {
        return;
      }
    } catch (error) {
      console.error('Error fetching match score from API:', error);
      return { homeScore: null, awayScore: null };
    }
  },

  async updateMatchScores(gameweekId = null) {
      console.log('Checking for finished matches...');

      const finishedMatches = await gameweeksService.fetchFinishedMatches(gameweekId);
      const now = new Date();

      const matches = finishedMatches.filter(
          (x) => x.api_match_id && new Date(x.match_time) < now
      );

      if (!matches.length) {
          console.log('No matches need updating.');
          return;
      }

      const unfinishedMatches = [];

      // Fetch all match scores in parallel
      const matchUpdates = await Promise.allSettled(
          matches.map(async (match) => {
              try {
                  const { homeScore, awayScore } = await footballApiService.fetchMatchScore(match.api_match_id);

                  if (homeScore !== null && awayScore !== null) {
                      await gameweeksService.updateMatchScore(match.id, homeScore, awayScore);
                      console.log(`✅ Updated match ${match.id} with final scores.`);
                  } else {
                    unfinishedMatches.push(match.id);
                  }
              } catch (error) {
                  console.error(`❌ Failed to update match ${match.id}:`, error);
              }
          })
      );

      if (unfinishedMatches.length) {
        console.warn(`⚠️ The following matches are not finished yet: ${unfinishedMatches.join(', ')}`);
      }
      
      console.log('Match score updates completed.');
  },
};

// Exporting using ES Module syntax
export { footballApiService, initDependencies };
