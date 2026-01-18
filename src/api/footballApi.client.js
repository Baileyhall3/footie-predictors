const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/*
  IDs:
  2016 = Championship
  2021 = Premier League
  2001 = UCL
  2015 = Ligue 1
  2002 = Bundesliga
  2019 = Serie A
  2224 = La Liga
*/

export const footballApiClient = {
  async getLeagues() {
    const res = await fetch(`${BASE_URL}/competitions`);
    const data = await res.json();
    const selectableLeagueIds = [2016, 2021, 2001, 2015, 2002, 2019, 2224];
    return data.competitions.filter(({ id }) => selectableLeagueIds.includes(id));
  },

  async getMatches(leagueId, teamId) {
    let res = null;
    if (leagueId) {
      res = await fetch(`${BASE_URL}/competitions/${leagueId}/matches`);
    } else if (teamId) {
      res = await fetch(`${BASE_URL}/teams/${teamId}/matches`);
    }
    const data = await res.json();
    return data.matches;
  },

  async getTeams(leagueId) {
    const response = await fetch(`${BASE_URL}/competitions/${leagueId}/teams`);
    const data = await response.json();
    return data.teams
  },
};
