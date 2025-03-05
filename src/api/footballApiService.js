import axios from 'axios';

const API_KEY = '7083fb402d09efe6ac264b1cda620f9f';
const BASE_URL = 'https://v3.football.api-sports.io';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'x-apisports-key': API_KEY }
});

export const footballApiService = {
  /**
   * Fetch available leagues
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getLeagues() {
    try {
      const response = await apiClient.get('/leagues');
      return { data: response.data.response, error: null };
    } catch (error) {
      console.error('Error fetching leagues:', error);
      return { data: null, error };
    }
  },

  /**
   * Fetch upcoming matches for a league
   * @param {number} leagueId - League ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getMatches(leagueId) {
    try {
      const response = await apiClient.get(`/fixtures`, {
        params: { league: leagueId, season: new Date().getFullYear(), next: 10 } // Get next 10 matches
      });
      debugger
      return { data: response.data.response, error: null };
    } catch (error) {
      console.error('Error fetching matches:', error);
      return { data: null, error };
    }
  }
};
