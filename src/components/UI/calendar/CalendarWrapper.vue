<template>
    <CalendarMonth :events="events" @day-selected="handleDaySelected" />
    <CalendarWeek :events="events" />

    <CalendarDayEvents ref="eventsDialog" :events="selectedDay?.events" :date="selectedDay?.date" @create-clicked="handleCreateClicked" />
    <CalendarAddEvent ref="addEventDialog" :date="selectedDay?.date" />
</template>

<script setup lang="ts">
import CalendarDayEvents from './CalendarDayEvents.vue';
import CalendarMonth from './CalendarMonth.vue';
import CalendarWeek from './CalendarWeek.vue';
import CalendarAddEvent from './CalendarAddEvent.vue';
import { ref } from 'vue';

let events = [
  {
    id: '1',
    title: '6-7',
    start: '2026-02-16T06:00:00',
    end: '2026-02-16T07:00:00',
    color: '#10b981'
  },
  {
    id: '2',
    title: '7-8',
    start: '2026-02-16T07:00:00',
    end: '2026-02-16T08:00:00',
    color: '#10b981'
  },
  {
    id: '3',
    title: '6-7',
    start: '2026-02-16T18:00:00',
    end: '2026-02-16T19:00:00',
    color: '#ef4444'
  },
  {
    id: '4',
    title: 'Long seshun',
    start: '2026-02-24T22:00:00',
    end: '2026-02-26T00:00:00',
    color: '#ef4444'
  },
  {
    id: '5',
    title: '6-7',
    start: '2026-02-18T06:00:00',
    end: '2026-02-18T07:00:00',
    color: '#10b981'
  },
  {
    id: '6',
    title: '7-8',
    start: '2026-02-18T07:00:00',
    end: '2026-02-18T08:00:00',
    color: '#10b981'
  },
  {
    id: '7',
    title: '6-7',
    start: '2026-02-18T18:00:00',
    end: '2026-02-18T19:00:00',
    color: '#ef4444'
  },
  {
    id: '8',
    title: '6-7',
    start: '2026-02-19T06:00:00',
    end: '2026-02-19T07:00:00',
    color: '#10b981'
  },
  {
    id: '9',
    title: '7-8',
    start: '2026-02-19T07:00:00',
    end: '2026-02-19T08:00:00',
    color: '#10b981'
  },
  {
    id: '10',
    title: '6-7',
    start: '2026-02-19T18:00:00',
    end: '2026-02-19T19:00:00',
    color: '#ef4444'
  },
  {
    id: '11',
    title: '6-7',
    start: '2026-02-20T06:00:00',
    end: '2026-02-20T07:00:00',
    color: '#10b981'
  },
  {
    id: '12',
    title: '6-7',
    start: '2026-02-20T18:00:00',
    end: '2026-02-20T19:00:00',
    color: '#ef4444'
  },
  {
    id: '13',
    title: '8-9',
    start: '2026-02-21T08:00:00',
    end: '2026-02-21T09:00:00',
    color: '#ef4444'
  },
]

const selectedDay = ref<{date: Date, events: any[]}>();
const eventsDialog = ref();
const addEventDialog = ref();

function handleDaySelected(date: Date, events: any[]) {
    selectedDay.value = {date, events}
    eventsDialog.value.show();
}

function handleCreateClicked() {
  addEventDialog.value.show();
}
</script>