<template>
    <div class="overflow-x-auto">
        <table class="table-auto border-collapse w-full text-center">
            <thead>
                <tr>
                    <th class="text-left px-2">User</th>
                    <th v-for="pos in userCount" :key="pos">{{ pos }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id">
                    <td class="flex items-center gap-2 px-2 py-1">
                        <!-- <img :src="user.avatar" class="w-6 h-6 rounded-full" /> -->
                        {{ user.username }}
                    </td>
                    <td
                        v-for="pos in userCount"
                        :key="pos"
                        :class="cellClass(user.id, pos)"
                    >
                        {{ positionCounts[user.id]?.[pos] || '' }}
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

type User = {
    id: string,
    username: string,
    bgColor: string
    currentPoints: number | null,
    currentPosition: number,
    currentTotalCorrectScores: number | null
}

type Prediction = {
    userId: string,
    matchId: string,
    homeScore: number
    awayScore: number
}

type Match = {
    id: string,
    homeTeam: string,
    awayTeam: string,
    actualScore: { home: number, away: number } | null
}

export interface IProps {
    scoringSystem: ScoringSystem,
    users: User[],
    predictions: Prediction[],
    matches: Match[]
}

const props = defineProps<IProps>();

const positionCounts = ref({})
const worstPositions = ref<Record<string, number>>({})

// Computed user count
const userCount = computed(() => props.users.length)

// Utility function: compare predicted result to actual
function getPoints(pred, actual, scoringSystem) {
  if (pred.homeScore === actual.home && pred.awayScore === actual.away) {
    return scoringSystem.exact_score_points
  }

  const predResult = pred.homeScore === pred.awayScore
    ? 'draw'
    : pred.homeScore > pred.awayScore ? 'home' : 'away'

  const actualResult = actual.home === actual.away
    ? 'draw'
    : actual.home > actual.away ? 'home' : 'away'

  return predResult === actualResult
    ? scoringSystem.correct_result_points
    : scoringSystem.incorrect_points
}

// Main simulation function
// Main simulation function
function simulateOutcomes() {
  const unfinishedMatches = props.matches.filter(m => m.actualScore == null)
  const outcomes = generateAllMatchOutcomes(unfinishedMatches)
  const userScoresPerSimulation = []
  const tempWorst = {} as Record<string, number>

  // Reset counts
  positionCounts.value = {}

  for (const outcome of outcomes) {
    const allScores: Record<string, number> = {}

    for (const user of props.users) {
      let total = user.currentPoints ?? 0

      for (const match of unfinishedMatches) {
        const pred = props.predictions.find(
          p => p.userId === user.id && p.matchId === match.id
        )
        if (pred) {
          const simulatedScore = outcome[match.id]
          total += getPoints(pred, simulatedScore, props.scoringSystem)
        }
      }

      allScores[user.id] = total
    }

    // Sort by score desc, assign positions (with ties)
    const sorted = Object.entries(allScores).sort((a, b) => b[1] - a[1])

    let currentRank = 1
    for (let i = 0; i < sorted.length; i++) {
      const [userId, score] = sorted[i]
      if (i > 0 && score < sorted[i - 1][1]) {
        currentRank = i + 1
      }

      // Update positionCounts
      if (!positionCounts.value[userId]) positionCounts.value[userId] = {}
      if (!positionCounts.value[userId][currentRank]) positionCounts.value[userId][currentRank] = 0
      positionCounts.value[userId][currentRank]++

      // Track worst position
      if (!tempWorst[userId] || currentRank > tempWorst[userId]) {
        tempWorst[userId] = currentRank
      }
    }
  }

  // ✅ Move this outside the loop
  worstPositions.value = tempWorst
}


// Generates all possible match outcomes for unfinished matches
function generateAllMatchOutcomes(matches) {
  const outcomes = []

  function backtrack(i, acc) {
    if (i === matches.length) {
      outcomes.push({ ...acc })
      return
    }

    const match = matches[i]
    const predictedScores = getDistinctPredictedScores(match.id) // ["1‑0","0‑0", …]

    // 1️⃣  EXACT‑score branch
    for (const scoreStr of predictedScores) {
      acc[match.id] = strToScore(scoreStr)
      backtrack(i + 1, acc)
    }

    // 2️⃣  NOT‑exact branch (pick one un‑predicted score with same result type)
    // Use the first user’s prediction to decide desired result type
    const firstPred = props.predictions.find(p => p.matchId === match.id)
    const desiredResult =
      firstPred.homeScore === firstPred.awayScore
        ? 'draw'
        : firstPred.homeScore > firstPred.awayScore
        ? 'home'
        : 'away'

    acc[match.id] = randomUnpredictedScore(match.id, desiredResult)
    backtrack(i + 1, acc)
  }

  backtrack(0, {})
  return outcomes          // ≤ 2^matches.length scenarios
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

  debugger

  return {
    'bg-purple-800 text-white': count === max && count > 0,
    'bg-purple-300': count && count < max,
    'bg-gray-400 text-black': isCurrentPos,
    'bg-red-900 text-white': isWorstPos && !isCurrentPos,
    'font-semibold': isCurrentPos
  }
}

// Placeholder: replace with real rank based on current standings
function getCurrentPosition(userId: string) {
  const user = props.users.find(u => u.id === userId)
  return user?.currentPosition ?? null
}

/** Distinct scores predicted for a match, e.g. ["1‑0","2‑1"] */
function getDistinctPredictedScores(matchId: string) {
  const set = new Set(
    props.predictions
      .filter(p => p.matchId === matchId)
      .map(p => `${p.homeScore}-${p.awayScore}`)
  )
  return Array.from(set)
}

/** Convert "2-1" → {home:2, away:1} */
function strToScore(scoreStr) {
  const [h, a] = scoreStr.split('-').map(Number)
  return { home: h, away: a }
}

/** Generate a score nobody predicted but with the same result type */
function randomUnpredictedScore(matchId: string, desiredResult) {
  const tried = new Set(getDistinctPredictedScores(matchId))
  while (true) {
    const home = Math.floor(Math.random() * 4)   // 0‑3
    const away = Math.floor(Math.random() * 4)
    const key = `${home}-${away}`
    if (tried.has(key)) continue

    const res =
      home === away
        ? 'draw'
        : home > away
        ? 'home'
        : 'away'

    if (res === desiredResult) return { home, away }
  }
}

onMounted(() => {
    simulateOutcomes()
})
</script>
