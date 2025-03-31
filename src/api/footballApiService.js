import axios from 'axios';
// import cron from 'node-cron';
import { gameweeksService } from './gameweeksService';
import { predictionsService } from './predictionsService';

// cron.schedule('*/30 * * * *', async () => {
//   console.log("Checking for finished matches...");

//   const matches = await fetchFinishedMatches();
  
//   if (!matches.length) {
//     console.log("No matches need updating.");
//     return;
//   }

//   for (const match of matches) {
//     try {
//       const { homeScore, awayScore } = await footballApiService.fetchMatchScore(match.api_match_id);
      
//       if (homeScore !== null && awayScore !== null) {
//         await updateMatchScore(match.id, homeScore, awayScore);
//         await calculateMatchScores(match.id);
//         console.log(`Updated match ${match.id} with final scores.`);
//       }
//     } catch (error) {
//       console.error(`Failed to update match ${match.id}:`, error);
//     }
//   }
// });

const API_KEY = process.env.VITE_API_KEY;
const BASE_URL = process.env.VITE_API_BASE_URL;

export const footballApiService = {
  /**
   * Fetch available leagues
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getLeagues() {
    try {
      const response = await fetch(`${BASE_URL}/competitions`, {
        headers: { 'X-Auth-Token': API_KEY }
      });  
      const data = await response.json();
      const selectableLeagueIds = [2016, 2021, 2001, 2015, 2002, 2019, 2224]
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
        response = await fetch(`${BASE_URL}/competitions/${leagueId}/matches`, {
          headers: { 'X-Auth-Token': API_KEY }
        });  
      } else if (teamId) {
        response = await fetch(`${BASE_URL}/teams/${teamId}/matches`, {
          headers: { 'X-Auth-Token': API_KEY }
        });  
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
      const response = await fetch(`${BASE_URL}/competitions/${leagueId}/teams`, {
        headers: { 'X-Auth-Token': API_KEY }
      });  
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
      const response = await fetch(`${BASE_URL}/teams/${teamId}/matches`, {
        headers: { 'X-Auth-Token': API_KEY }
      });  
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
      const response = await fetch(`${BASE_URL}/matches/${matchId}`, {
        headers: { 'X-Auth-Token': API_KEY }
      });

      const data = await response.json();
      // if (data.status != "FINISHED") { return; }
  
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
