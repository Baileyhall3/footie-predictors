<template>
  <div class="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b">
      <div class="flex items-center gap-3">
        <button @click="goToPreviousMonth">←</button>
        <h2 class="text-lg font-semibold">
          {{ format(currentMonth, 'MMMM yyyy') }}
        </h2>
        <button @click="goToNextMonth">→</button>
      </div>

      <button
        class="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        @click="goToToday"
      >
        Today
      </button>
    </div>

    <!-- Weekday Labels -->
    <div class="grid grid-cols-7 text-xs font-medium text-gray-500 border-b">
      <div
        v-for="day in weekDayLabels"
        :key="day"
        class="py-2 text-center"
      >
        {{ day }}
      </div>
    </div>

    <!-- Weeks -->
    <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="border-b">

      <!-- Week Grid -->
      <div class="grid grid-cols-7 relative min-h-[8rem]">

        <!-- Day Cells -->
        <div
          v-for="(day, index) in week.days"
          :key="day.date.toISOString()"
          class="border-r border-gray-100 p-1 relative cursor-pointer hover:bg-gray-100 transition"
          :class="{ 'bg-gray-50': !day.isCurrentMonth, 'bg-gray-100' : isSameDay(day.date, selectedDate) }"
          @click="selectDay(day, week)"
        >
          <div class="grid items-center grid-cols-3">
            <!-- +X more (left) -->
             <div class="flex items-center">
               <span
                 v-if="week.overflowCounts?.[index] > 0"
                 class="text-[0.5rem] text-gray-500 font-medium hover:underline"
               >
                 +{{ week.overflowCounts[index] }}
               </span>
             </div>

            <!-- Day number (right) -->
               <div
                 class="text-xs w-6 h-6 flex items-center justify-center rounded-full"
                 :class="{
                   'bg-black text-white': day.isToday,
                   'font-bold': isSameDay(day.date, selectedDate),
                   'text-gray-400': !day.isCurrentMonth && !day.isToday
                 }"
               >
                 {{ format(day.date, 'd') }}
               </div>
          </div>
        </div>

        <!-- Event Layers -->
        <template v-for="(layer, layerIndex) in week.layers">
          <div
            v-for="segment in layer"
            :key="segment.event.id + '-' + segment.startCol"
            class="absolute text-[0.6rem] px-1 rounded truncate text-white overflow-hidden"
            :style="{
              top: `${32 + layerIndex * 18}px`,
              left: `calc(${segment.startCol * (100/7)}% + 2px)`,
              width: `calc(${segment.span * (100/7)}% - ${SEGMENT_GUTTER}px)`,
              backgroundColor: segment.event.color || '#6366f1'
            }"
          >
            <div class="truncate w-full min-w-0">
              {{ segment.event.title }}
            </div>
            <!-- {{ formatEventTime(segment.event.start) }} -->
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  startOfMonth,
  startOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  differenceInCalendarDays,
  min,
  max,
  isWithinInterval, startOfDay, endOfDay
} from 'date-fns'

type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  color?: string
}

interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface Layer {
  event: CalendarEvent;
  span: number;
  startCol: number;
}

interface WeekGroup {
  days: Day[];
  layers: Layer[];
  overflowCount: number[];
}

const props = defineProps<{
  events: CalendarEvent[]
}>()

const emit = defineEmits<{
  (e: 'day-selected', date: Date, events: CalendarEvent[]): void
}>()

function selectDay(day: Day) {
  selectedDate.value = day.date
  emit('day-selected', day.date, getEventsForDate(day.date))
}

function getEventsForDate(date: Date): CalendarEvent[] {
  return props.events.filter(event => {
    const start = new Date(event.start)
    const end = new Date(event.end)

    return isWithinInterval(date, {
      start: startOfDay(start),
      end: endOfDay(end)
    })
  })
}

const MAX_VISIBLE_LAYERS = 4
const SEGMENT_GUTTER = 4 // px total (2px each side)

const selectedDate = ref(new Date());
const currentMonth = ref(new Date());

const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function goToPreviousMonth() {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

function goToNextMonth() {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

function goToToday() {
  currentMonth.value = new Date()
}

/* -----------------------------
   Build Weeks (6 x 7)
------------------------------*/

const weeks = computed(() => {
  const startMonth = startOfMonth(currentMonth.value)
  const gridStart = startOfWeek(startMonth, { weekStartsOn: 1 })

  const days: Day[] = Array.from({ length: 42 }).map((_, i) => {
    const date = addDays(gridStart, i)
    return {
      date,
      isCurrentMonth: isSameMonth(date, currentMonth.value),
      isToday: isToday(date)
    }
  })

  const weekGroups: WeekGroup[] = []

  for (let i = 0; i < 6; i++) {
    const weekDays = days.slice(i * 7, i * 7 + 7)

    const weekStart = weekDays[0].date
    const weekEnd = weekDays[6].date

    const segments = buildWeekSegments(weekStart, weekEnd)
    const layers = assignLayers(segments)

    const visibleLayers = layers.slice(0, MAX_VISIBLE_LAYERS)
    const hiddenLayers = layers.slice(MAX_VISIBLE_LAYERS)

    const overflowCounts = Array(7).fill(0)

    hiddenLayers.forEach(layer => {
      layer.forEach(segment => {
        for (let col = segment.startCol; col < segment.startCol + segment.span; col++) {
          overflowCounts[col]++
        }
      })
    })

    weekGroups.push({
      days: weekDays,
      layers: visibleLayers,
      overflowCounts
    })
  }

  return weekGroups;
})

/* -----------------------------
   Build Event Segments Per Week
------------------------------*/

function buildWeekSegments(weekStart: Date, weekEnd: Date) {
  const segments: any[] = []

  props.events.forEach(event => {
    const start = new Date(event.start)
    const end = new Date(event.end)

    if (end < weekStart || start > weekEnd) return

    const segStart = max([start, weekStart])
    const segEnd = min([end, weekEnd])

    const startCol = differenceInCalendarDays(segStart, weekStart)
    const span = differenceInCalendarDays(segEnd, segStart) + 1

    segments.push({
      event,
      startCol,
      span
    })
  })

  return segments
}

/* -----------------------------
   Layer Assignment (No overlap)
------------------------------*/

function assignLayers(segments: any[]) {
  const layers: any[] = []

  segments.sort((a, b) => a.startCol - b.startCol)

  segments.forEach(segment => {
    let placed = false

    for (const layer of layers) {
      const conflict = layer.some(
        (s: any) =>
          s.startCol < segment.startCol + segment.span &&
          segment.startCol < s.startCol + s.span
      )

      if (!conflict) {
        layer.push(segment)
        placed = true
        break
      }
    }

    if (!placed) {
      layers.push([segment])
    }
  })

  return layers
}

function applyDayOverflow(layers: any[], maxPerDay = 3) {
  const dayCounts = Array(7).fill(0)
  const overflowCounts = Array(7).fill(0)

  const visibleLayers = layers.map(layer => {
    return layer.filter(segment => {

      let visibleSomewhere = false

      for (let col = segment.startCol; col < segment.startCol + segment.span; col++) {

        if (dayCounts[col] < maxPerDay) {
          dayCounts[col]++
          visibleSomewhere = true
        } else {
          overflowCounts[col]++
        }

      }

      return visibleSomewhere
    })
  })

  return { visibleLayers, overflowCounts }
}


function formatEventTime(start: string) {
  return format(new Date(start), 'HH:mm')
}
</script>
