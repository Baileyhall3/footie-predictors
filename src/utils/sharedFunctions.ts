import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import type { Prediction } from "../types";

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