<template>
  <div class="overflow-x-auto">
    <table class="table-fixed border-collapse">
      <thead>
        <tr>
          <th class="w-24 border p-2 text-left">User</th>
          <th
            v-for="pos in maxPosition"
            :key="pos"
            class="w-16 border p-2 text-center"
          >
            {{ pos }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.username">
          <td class="border p-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[6rem]">
            {{ user.username }}
          </td>
          <td
            v-for="pos in maxPosition"
            :key="pos"
            class="border p-2 text-center"
            :class="getCellClass(user.username, pos)"
          >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

type ScoringSystem = {
    exactScorePoints: number,
    correctResultPoints: number,
    incorrectResultPoints: number
}

type Prediction = {
    matchId: string,
    homeScore: number
    awayScore: number
}

type UserPrediction = {
  username: string,
  userId: string,
  currentPoints: number,
  currentPosition: number,
  predictions: Prediction[]
}

export interface IProps {
    scoringSystem?: ScoringSystem,
    userPredictions: UserPrediction[],
}

const props = withDefaults(defineProps<IProps>(), {
  scoringSystem: { exactScorePoints: 3, correctResultPoints: 1, incorrectResultPoints: 0 },
});

const scenarios = computed(() => simulateGameweek(props.userPredictions, props.scoringSystem));
const positionMap = computed(() => computePositionMatrix(scenarios.value));

const users = props.userPredictions;
const maxPosition = Math.max(...users.map(u => users.length));

onMounted(() => {
    const scenarios = simulateGameweek(props.userPredictions, props.scoringSystem);

    const scoresOnly = scenarios.map(x => x.userScores);
    console.log('scenarios ', scoresOnly)
});

function getResultType(home: number, away: number) {
  if (home > away) return 'H';
  if (home < away) return 'A';
  return 'D';
}

function extractPossibleOutcomes(predictions: UserPrediction[]) {
    const matchOutcomes = new Map();

    for (const user of predictions) {
        for (const pred of user.predictions) {
            if (!matchOutcomes.has(pred.matchId)) {
                matchOutcomes.set(pred.matchId, new Set());
            }
            matchOutcomes.get(pred.matchId).add(`${pred.homeScore}-${pred.awayScore}`);
        }
    }

    // Convert Set to Array and add 'unpredicted' outcome
    const matchOutcomesArr = Array.from(matchOutcomes.entries())
        .sort(([a], [b]) => a - b) // Ensure matchId order
        .map(([matchId, outcomes]) => {
            const arr = Array.from(outcomes);
            // Add a dummy value that no user predicted to simulate all-wrong
            arr.push("UNPREDICTED");
            return { matchId, outcomes: arr };
        });

    return matchOutcomesArr;
}


function cartesianProduct(arrays) {
    return arrays.reduce((acc, curr) => {
        return acc.flatMap(a => curr.outcomes.map(b => [...a, { matchId: curr.matchId, outcome: b }]));
    }, [[]]);
}

function simulateGameweek(predictions: UserPrediction[], scoringSystem: ScoringSystem) {
  const matchOutcomesArr = extractPossibleOutcomes(predictions);
  const allCombinations = cartesianProduct(matchOutcomesArr);

  const scenarios = [];

  for (const combination of allCombinations) {
    const userScores = predictions.map(user => {
      let totalAdded = 0;

      for (const { matchId, outcome } of combination) {
        if (outcome === "UNPREDICTED") {
          // No user got this correct
          continue;
        }

        const [simHome, simAway] = outcome.split('-').map(Number);
        const simulatedResult = getResultType(simHome, simAway);

        const pred = user.predictions.find(p => p.matchId === matchId);
        if (!pred) continue;

        const isExact = pred.homeScore === simHome && pred.awayScore === simAway;
        const isCorrectResult = getResultType(pred.homeScore, pred.awayScore) === simulatedResult;

        if (isExact) {
          totalAdded += scoringSystem.exactScorePoints;
        } else if (isCorrectResult) {
          totalAdded += scoringSystem.correctResultPoints;
        } else {
          totalAdded += scoringSystem.incorrectResultPoints;
        }
      }

      return {
        user: user.username,
        totalPoints: user.currentPoints + totalAdded
      };
    });

    // Sort for positions
    const sorted = [...userScores].sort((a, b) => b.totalPoints - a.totalPoints);
    sorted.forEach((u, i) => (u.position = i + 1));

    scenarios.push({
      combination,
      userScores: sorted
    });
  }

  // Deduplicate based on userScores
  const deduplicatedScenarios = [];
  const seen = new Set();

  for (const scenario of scenarios) {
    const key = JSON.stringify(
      scenario.userScores
        .map(u => ({ user: u.user, totalPoints: u.totalPoints, position: u.position }))
        .sort((a, b) => a.user.localeCompare(b.user)) // sort to ensure stable key
    );

    if (!seen.has(key)) {
      seen.add(key);
      deduplicatedScenarios.push(scenario);
    }
  }

  return deduplicatedScenarios;
}

function computePositionMatrix(scenarios) {
  const positionMap = new Map();

  for (const scenario of scenarios) {
    for (const { user, position } of scenario.userScores) {
      if (!positionMap.has(user)) {
        positionMap.set(user, new Set());
      }
      positionMap.get(user).add(position);
    }
  }

  return positionMap;
}

function getCellClass(username: string, pos: number) {
  const possiblePositions = positionMap.value.get(username) ?? new Set();

  if (!possiblePositions.has(pos)) {
    return 'bg-gray-200';
  }

  const user = users.find(u => u.username === username);
  const positions = Array.from(positionMap.value.get(username) ?? []);

  const min = Math.min(...positions);
  const max = Math.max(...positions);

  if (user?.currentPosition === pos) return 'bg-blue-300'; // current
  if (pos === min) return 'bg-green-300'; // best
  if (pos === max) return 'bg-red-300'; // worst

  return 'bg-yellow-100'; // other valid finish
}

// Cell class for grid visualization
function cellClass(userId, pos) {
  const userData = positionCounts.value[userId]
  const user = props.users.find(u => u.id === userId)
  if (!user) return ''

  const count = userData?.[pos] || 0
  const max = userData ? Math.max(...Object.values(userData)) : 0
  const isCurrentPos = pos === user.currentPosition
  const isWorstPos = pos === worstPositions[userId]

  return {
    'bg-purple-800 text-white': count === max && count > 0,
    'bg-purple-300': count && count < max,
    'bg-gray-400 text-black': isCurrentPos,
    'bg-red-900 text-white': isWorstPos && !isCurrentPos,
    'font-semibold': isCurrentPos
  }
}

</script>
