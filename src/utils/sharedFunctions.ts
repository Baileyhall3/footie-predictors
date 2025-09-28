import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import type { Prediction, Match } from "../types";

export function copyPageLink(entity: string) {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast(`${entity} link copied!`, {
        "type": "info",
        "position": "top-center"
    });
}

/**
 * Function to determine text color based on prediction accuracy
 * @param match - The match for qhich to get prediction color for
 * @returns color string to be used as a class
 */
export const getPredictionColor = (match: Prediction) => {
    if (!match) { return "test-gray-600"; }
    if (match.final_home_score === undefined || match.final_away_score === undefined) { return "test-gray-600"; }
    if (match.final_home_score === null || match.final_away_score === null) {
        return "test-gray-600"; // No color if match is not finished
    }

    const predictedHome = match.predicted_home_score;
    const predictedAway = match.predicted_away_score;
    const actualHome = match.final_home_score;
    const actualAway = match.final_away_score;

    if (predictedHome === actualHome && predictedAway === actualAway) {
        return "text-green-500"; // Exact score
    }

    const predictedWinner = predictedHome > predictedAway ? "home" : predictedAway > predictedHome ? "away" : "draw";
    const actualWinner = actualHome > actualAway ? "home" : actualAway > actualHome ? "away" : "draw";

    if (predictedWinner === actualWinner) {
        return "text-amber-500"; // Correct result but wrong score
    }

    return "text-red-500"; // Incorrect result
};

export const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
        case 'info':
            return 'bg-blue-500'
        case 'success':
            return 'bg-green-500'
        case 'warning':
            return 'bg-yellow-500'
        case 'urgent':
            return 'bg-red-500'
        default:
            return 'bg-gray-400'
    }
}

export interface FormattedMatch {
  api_match_id: string | null;
  awayClub: string | null;
  away_team: string;
  away_team_api_id: string | null;
  away_team_crest: string | undefined;
  competition: string | null;
  competition_emblem_url: string | null;
  created_at: string; // ISO timestamp
  final_away_score: number | null;
  final_home_score: number | null;
  gameweek_id: string;
  homeClub: string | null;
  home_team: string;
  home_team_api_id: string | null;
  home_team_crest: string | undefined;
  id: string;
  match_time: Date | string;
  predicted_away_score: number | undefined;
  predicted_home_score: number | undefined;
  prediction_id: string | null;
  previous_away_score: number | null;
  previous_home_score: number | null;
}

export interface KeyedPrediction {
  [predictionId: string]: {
    predicted_away_score: number | undefined;
    predicted_home_score: number | undefined;
  };
}

export interface MappedData {
    matches: FormattedMatch[];
    predictions: KeyedPrediction[];
}

export function mapPredictions(
    predictionsData: Prediction[], 
    matchData: Match[]
): MappedData {
    // Map predictions by match_id for quick lookup
    const predictionsMap = predictionsData.reduce((acc, prediction) => {
        acc[prediction.match_id] = prediction;
        return acc;
    }, {});

    let mappedData: MappedData = { matches: [], predictions: [] }

    // Merge predictions into matches
    mappedData.matches = matchData.map(match => ({
        ...match,
        api_match_id: match.api_match_id,
        previous_home_score: match.final_home_score, // Store initial score
        previous_away_score: match.final_away_score,
        predicted_home_score: predictionsMap[match.id]?.predicted_home_score ?? (match.final_home_score == undefined ? 0 : undefined),
        predicted_away_score: predictionsMap[match.id]?.predicted_away_score ?? (match.final_away_score == undefined ? 0 : undefined),
        prediction_id: predictionsMap[match.id]?.id || null,
        home_team_crest: match.homeClub?.crest_url,
        away_team_crest: match.awayClub?.crest_url
    }));

    // Initialize predictions object for v-model binding
    mappedData.predictions = mappedData.matches.reduce((acc, match) => {
        acc[match.id] = {
            predicted_home_score: match.predicted_home_score,
            predicted_away_score: match.predicted_away_score
        };
        return acc;
    }, {});

    return mappedData;
}