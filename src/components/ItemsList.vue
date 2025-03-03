<template>
    <div class="min-h-screen max-w-7xl mx-auto p-6">
        <h1 class="text-3xl font-bold mb-6 text-center"> {{ props.headerTitle }}</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div v-for="item in props.dataSource" :key="item.id" class="p-4">
                <img :src="item.imgSrc" :alt="item.title" class="w-full h-64 object-cover rounded-md mb-4">
                <h2 class="text-xl font-semibold cursor-pointer hover:underline">{{ item.title }}</h2>
                <p class="text-lg font-medium text-gray-700">&pound;{{ item.price }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

export interface IProps {
    headerTitle: string;
    dataSource: any []
}

const props = defineProps<IProps>();

</script>
