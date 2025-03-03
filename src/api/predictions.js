// In predictions.js
export const getUserPredictions = () => {
  return [
      {
          gameweek: { number: 1, id: 1, status: 'Pending' },
          predictions: [
              {
                  match_id: 1,
                  home_team: 'Man Utd',
                  away_team: 'Arsenal',
                  predicted_home_score: 2,
                  predicted_away_score: 1,
              },
              {
                  match_id: 2,
                  home_team: 'Chelsea',
                  away_team: 'Liverpool',
                  predicted_home_score: 1,
                  predicted_away_score: 1
              },
          ],
      },
      {
          gameweek: { number: 2, id: 2, status: 'Locked', },
          predictions: [
              {
                  match_id: 3,
                  home_team: 'Spurs',
                  away_team: 'Man City',
                  predicted_home_score: 0,
                  predicted_away_score: 2,
              },
          ],
      },
  ];
};
