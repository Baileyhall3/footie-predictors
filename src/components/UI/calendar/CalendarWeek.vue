<template>
  <div class="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b">
      <div class="flex items-center gap-3">
        <button @click="goToPreviousWeek">←</button>
        <h2 class="text-lg font-semibold">
          Week of {{ format(weekStart, 'MMM d, yyyy') }}
        </h2>
        <button @click="goToNextWeek">→</button>
      </div>

      <button
        class="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        @click="goToToday"
      >
        Today
      </button>
    </div>

    <!-- Day Headers -->
    <div class="grid grid-cols-8 border-b text-xs font-medium text-gray-500">
      <div class="border-r"></div>
      <div
        v-for="day in weekDays"
        :key="day.toISOString()"
        class="py-2 text-center border-r cursor-pointer hover:bg-gray-50"
        @click="selectDay(day)"
      >
        <div>{{ format(day, 'EEE') }}</div>
        <div
          class="mt-1 w-6 h-6 mx-auto flex items-center justify-center rounded-full"
          :class="{
            'bg-black text-white': isToday(day),
            'font-bold': isSameDay(day, selectedDate)
          }"
        >
          {{ format(day, 'd') }}
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="flex relative">

      <!-- Time Gutter -->
      <div class="w-16 border-r text-xs text-gray-400">
        <div
          v-for="hour in 24"
          :key="hour"
          class="h-16 pr-2 text-right relative"
        >
          <span class="absolute -top-2 right-2">
            {{ String(hour).padStart(2, '0') }}:00
          </span>
        </div>
      </div>

      <!-- Day Columns -->
      <div class="grid grid-cols-7 flex-1 relative">

        <div
          v-for="(day, index) in weekDays"
          :key="day.toISOString()"
          class="relative border-r"
          :style="{ height: totalHeight + 'px' }"
        >
          <!-- Hour lines -->
          <div
            v-for="hour in 24"
            :key="hour"
            class="h-16 border-b border-gray-100"
          ></div>

          <!-- Current Time Line -->
          <div
            v-if="isToday(day)"
            class="absolute left-0 right-0 h-[2px] bg-red-500 z-20"
            :style="{ top: currentTimePosition + 'px' }"
          ></div>

          <!-- Events -->
          <div
            v-for="event in positionedEventsByDay[index]"
            :key="event.id"
            class="absolute bg-indigo-500 text-white text-xs rounded px-2 py-1 overflow-hidden"
            :style="{
              top: event.top + 'px',
              height: event.height + 'px',
              width: event.width + '%',
              left: event.left + '%'
            }"
          >
            <div class="font-medium truncate">
              {{ event.title }}
            </div>
            <div class="text-[10px] opacity-90">
              {{ format(new Date(event.start), 'HH:mm') }}
            </div>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  format,
  isToday,
  isSameDay
} from 'date-fns'

type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  color?: string
}

const props = defineProps<{
  events: CalendarEvent[]
}>()

const emit = defineEmits<{
  (e: 'select-day', date: Date): void
}>()

const selectedDate = ref(new Date())
const currentDate = ref(new Date())

const HOUR_HEIGHT = 64
const MINUTE_HEIGHT = HOUR_HEIGHT / 60
const totalHeight = HOUR_HEIGHT * 24

const weekStart = computed(() =>
  startOfWeek(currentDate.value, { weekStartsOn: 1 })
)

const weekDays = computed(() =>
  Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart.value, i)
  )
)

function goToPreviousWeek() {
  currentDate.value = subWeeks(currentDate.value, 1)
}

function goToNextWeek() {
  currentDate.value = addWeeks(currentDate.value, 1)
}

function goToToday() {
  currentDate.value = new Date()
}

function selectDay(date: Date) {
  selectedDate.value = date
  emit('select-day', date)
}

/* -----------------------------
   Event Positioning
------------------------------*/

function getMinutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes()
}

function assignColumns(events: CalendarEvent[]) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  const columns: CalendarEvent[][] = []

  sorted.forEach(event => {
    let placed = false

    for (const col of columns) {
      const conflict = col.some(e =>
        new Date(e.start) < new Date(event.end) &&
        new Date(event.start) < new Date(e.end)
      )

      if (!conflict) {
        col.push(event)
        placed = true
        break
      }
    }

    if (!placed) {
      columns.push([event])
    }
  })

  return columns
}

const positionedEventsByDay = computed(() => {
  return weekDays.value.map(day => {
    const dayEvents = props.events.filter(e =>
      isSameDay(new Date(e.start), day)
    )

    const columns = assignColumns(dayEvents)
    const columnCount = columns.length || 1
    const width = 100 / columnCount

    const positioned: any[] = []

    columns.forEach((col, colIndex) => {
      col.forEach(event => {
        const start = new Date(event.start)
        const end = new Date(event.end)

        const top = getMinutes(start) * MINUTE_HEIGHT
        const height =
          (getMinutes(end) - getMinutes(start)) * MINUTE_HEIGHT

        positioned.push({
          ...event,
          top,
          height,
          width,
          left: colIndex * width
        })
      })
    })

    return positioned
  })
})

/* -----------------------------
   Current Time Indicator
------------------------------*/

const currentTimePosition = computed(() => {
  const now = new Date()
  return getMinutes(now) * MINUTE_HEIGHT
})
</script>
