<template>
    <section id="ecommerce-pricing" class="w-full py-16 bg-gray-100 text-center min-h-screen">
        <h2 class="text-4xl font-bold text-gray-800 mb-10">E-Commerce Sites</h2>
            <div class="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                <div class="bg-white p-6 rounded-lg shadow-lg w-80 hover:scale-105 transition-transform cursor-pointer">
                <h3 class="text-2xl font-semibold mb-3">E-Commerce Basic</h3>
                <p class="text-gray-600 text-xl font-bold mb-4">£500</p>
                <ul class="text-gray-700 text-left space-y-2">
                    <li>&#10003; Stripe payments</li>
                    <li>&#10003; Up to 10 products</li>
                    <li>&#10003; User-friendly admin panel</li>
                    <li>&#10003; Login system</li>
                    <li>&#10003; Basic SEO</li>
                </ul>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg w-80 hover:scale-105 transition-transform cursor-pointer">
                <h3 class="text-2xl font-semibold mb-3">E-Commerce Standard</h3>
                <p class="text-gray-600 text-xl font-bold mb-4">£800</p>
                <ul class="text-gray-700 text-left space-y-2">
                    <li>&#10003; Everything in Basic</li>
                    <li>&#10003; Unlimited products</li>
                    <li>&#10003; Product categories</li>
                    <li>&#10003; Blog setup</li>
                    <li>&#10003; Advanced SEO</li>
                </ul>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg w-80 hover:scale-105 transition-transform cursor-pointer">
                <h3 class="text-2xl font-semibold mb-3">E-Commerce Premium</h3>
                <p class="text-gray-600 text-xl font-bold mb-4">£1,200+</p>
                <ul class="text-gray-700 text-left space-y-2">
                    <li>&#10003; Everything in Standard</li>
                    <li>&#10003; Subscription features</li>
                    <li>&#10003; Multi-vendor support</li>
                    <li>&#10003; Advanced filtering</li>
                    <li>&#10003; Custom dashboard</li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script setup>
import { useHead } from '@vueuse/head'

// SEO optimization
useHead({
  title: 'E-Commerce Sites - Freelance Web Pro',
  meta: [
    {
      name: 'description',
      content: 'Take a look at our e-commerce website plans, to take your online shop to the next level'
    }
  ]
})
</script>