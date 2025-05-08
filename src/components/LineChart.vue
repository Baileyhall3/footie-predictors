<template>
    <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Color
} from 'chart.js'

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale
)

export interface LineData {
    title?: string,
    borderColor: Color,
    xLabels: string[]
    data: number[]
    options: ChartOptions
}

export interface ChartOptions {
    stepSize?: number
    precision?: number
    beginAtZero?: boolean
    reverse?: boolean
    minY: number
}

export interface IProps {
    lineData: LineData,
}

const props = defineProps<IProps>();

const chartData = {
    labels: props.lineData.xLabels,
    datasets: [
        {
            label: props.lineData.title ?? 'Line Chart',
            data: props.lineData.data,
            fill: false,
            borderColor: props.lineData.borderColor,
            tension: 0.1
        }
    ]
};

const chartOptions = {
    responsive: true,
    scales: {
        y: {
        min: props.lineData.options?.minY ?? 0,
        ticks: {
            stepSize: props.lineData.options?.stepSize ?? 1,
            precision: props.lineData.options?.precision ?? 0,
        },
            beginAtZero: props.lineData.options?.beginAtZero ?? true,
            reverse: props.lineData.options?.reverse ?? false,
        }
    }
};

</script>
