const BASE_URL = 'https://api.football-data.org/v4';

export const footballApiServer = {
  async fetchMatchScore(matchId) {
    const res = await fetch(`${BASE_URL}/matches/${matchId}`, {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    console.log(`Fetched score for match ID ${matchId}:`, data);

    if (data.status === 'FINISHED') {
      return {
        homeScore: data.score.fullTime.home,
        awayScore: data.score.fullTime.away
      };
    }

    return { homeScore: null, awayScore: null };
  },

  async getFinishedMatches(matchIds) {
    const res = await fetch(
      `${BASE_URL}/matches?ids=${matchIds.join(',')}&status=FINISHED`,
      {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.ok) {
      throw new Error(`Football API error: ${res.status}`);
    }

    const data = await res.json();

    console.log('match data ', data);

    // Normalize return shape
    return data.matches.map(match => ({
      api_match_id: match.id,
      homeScore: match.score.fullTime.home,
      awayScore: match.score.fullTime.away
    }));
  }
};
