<template>
    <ItemsList headerTitle="Accessories" :dataSource="dsAccessories" />
</template>

<script setup lang="ts">
    import ItemsList from '../../components/ItemsList.vue';

    const dsAccessories = [
    {
        id: 0,
        title: "Men's Classic Sweatshirt",
        color: "Black",
        price: 20,
        stock: 5,
        category: 'shirt',
        gender: 'male',
        imgSrc: "/src/assets/images/ink-angel-preview.png"
    },
    {
        id: 1,
        title: "Men's Classic Sweatshirt",
        color: "Black",
        price: 20,
        stock: 5,
        category: 'shirt',
        gender: 'male',
        imgSrc: "/src/assets/images/ink-angel-preview.png"
    },
    {
        id: 2,
        title: "Men's Classic Sweatshirt",
        color: "Black",
        price: 20,
        stock: 5,
        category: 'shirt',
        gender: 'male',
        imgSrc: "/src/assets/images/ink-angel-preview.png"
    },
    {
        id: 3,
        title: "Men's Classic Sweatshirt",
        color: "Black",
        price: 20,
        stock: 5,
        category: 'shirt',
        gender: 'male',
        imgSrc: "/src/assets/images/ink-angel-preview.png"
    },
    {
        id: 4,
        title: "Men's Classic Sweatshirt",
        color: "Black",
        price: 20,
        stock: 5,
        category: 'shirt',
        gender: 'male',
        imgSrc: "/src/assets/images/ink-angel-preview.png"
    },
    {
        id: 5,
        title: "Men's Classic Sweatshirt",
        color: "Black",
        price: 20,
        stock: 5,
        category: 'shirt',
        gender: 'male',
        imgSrc: "/src/assets/images/ink-angel-preview.png"
    },
    {
        id: 6,
        title: "Men's Classic Sweatshirt",
        color: "Black",
        price: 20,
        stock: 5,
        category: 'shirt',
        gender: 'male',
        imgSrc: "/src/assets/images/ink-angel-preview.png"
    },
    {
        id: 7,
        title: "Men's Classic Sweatshirt",
        color: "Black",
        price: 20,
        stock: 5,
        category: 'shirt',
        gender: 'male',
        imgSrc: "/src/assets/images/ink-angel-preview.png"
    },
];
</script>