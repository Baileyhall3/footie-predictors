<template>
    <div class="overflow-x-auto">
        <div class="min-w-[700px] w-full">
            <div class="px-4">
                <Line :data="chartData" :options="chartOptions" />
            </div>
        </div>
    </div>
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

const endLabelPlugin = {
    id: 'endLabels',
    afterDatasetsDraw(chart, args, options) {
        const { ctx } = chart;

        chart.data.datasets.forEach((dataset, index) => {
            const meta = chart.getDatasetMeta(index);
            const lastPoint = meta.data[meta.data.length - 1];

            if (!lastPoint) return;

            const { x, y } = lastPoint.tooltipPosition();

            ctx.save();
            ctx.font = '12px sans-serif';
            ctx.fillStyle = dataset.borderColor as string;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(dataset.label ?? '', x + 6, y);
            ctx.restore();
        });
    }
};

ChartJS.register(endLabelPlugin);

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
    data: number[],
    totalPointsPerGameweek: number[]
}

export interface ChartOptions {
    stepSize?: number
    precision?: number
    beginAtZero?: boolean
    reverse?: boolean
    minY: number
}

export interface IProps {
    lineData: LineData[],
    options: ChartOptions,
    xLabels: string[]
}

const props = defineProps<IProps>();

const chartData = {
    labels: props.xLabels ?? [],
    datasets: props.lineData.map(line => ({
        label: line.title ?? 'Line Chart',
        data: line.data,
        fill: false,
        borderColor: line.borderColor,
        tension: 0,
        totalPoints: line.totalPointsPerGameweek
    }))
};


const chartOptions = {
    responsive: true,
    layout: {
        padding: {
            top: 0,
            right: 40
        }
    },
    plugins: {
        legend: {
            display: false
        },
        endLabels: {
            display: true
        },
        tooltip: {
            callbacks: {
                label: (tooltipItem) => {
                    const dataset = tooltipItem.dataset;
                    const index = tooltipItem.dataIndex;
                    const user = dataset.label;
                    const position = dataset.data[index];
                    const totalPoints = dataset.totalPoints?.[index]; // our custom field
                    return `${user}: Position ${position}, ${totalPoints} pts`;
                }
            }
        }
    },
    scales: {
        y: {
            min: props.options?.minY ?? 0,
            ticks: {
                stepSize: props.options?.stepSize ?? 1,
                precision: props.options?.precision ?? 0,
            },
                beginAtZero: props.options?.beginAtZero ?? true,
                reverse: props.options?.reverse ?? false,
        }
    }
};

</script>
