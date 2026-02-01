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
  }
};
