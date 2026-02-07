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
    console.log('[getFinishedMatches] fetching matches:', matchIds);

    const res = await fetch(
      `${BASE_URL}/matches?ids=${matchIds.join(',')}&status=FINISHED`,
      {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[getFinishedMatches] response status:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error('[getFinishedMatches] API error body:', text);
      throw new Error(`Football API error: ${res.status}`);
    }

    const data = await res.json();

    // High-level sanity check
    console.log('[getFinishedMatches] matches count:', data.matches?.length);
    console.log('[getFinishedMatches] resultSet:', data.resultSet);

    // Log a single full match (safe, readable)
    console.log(
      '[getFinishedMatches] sample match:',
      JSON.stringify(data.matches?.[0], null, 2)
    );

    return data.matches.map(match => {
      // Targeted logs per match
      console.log('[match]', {
        id: match.id,
        utcDate: match.utcDate,
        status: match.status,
        homeTeam: match.homeTeam?.name,
        awayTeam: match.awayTeam?.name,
        fullTimeScore: match.score?.fullTime
      });

      // Defensive checks (you WILL thank yourself later)
      if (!match.score?.fullTime) {
        console.warn('[match] missing fullTime score', {
          id: match.id,
          score: match.score
        });
      }

      return {
        api_match_id: match.id,
        homeScore: match.score?.fullTime?.home ?? null,
        awayScore: match.score?.fullTime?.away ?? null
      };
    });
  }

};
