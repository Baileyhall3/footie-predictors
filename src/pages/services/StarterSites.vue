<template>
    <section id="pricing" class="w-full py-16 bg-gray-100 text-center min-h-screen">
        <h2 class="text-4xl font-bold text-gray-800 mb-10">Starter Sites</h2>
        <div class="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            <!-- Static Website Plans -->
            <div class="bg-white p-6 rounded-lg shadow-lg w-80 hover:scale-105 transition-transform cursor-pointer">
            <h3 class="text-2xl font-semibold mb-3">Basic Package</h3>
            <p class="text-gray-600 text-xl font-bold mb-4">£150</p>
            <ul class="text-gray-700 text-left space-y-2">
                <li>&#10003; 5-page static website</li>
                <li>&#10003; Responsive design</li>
                <li>&#10003; Contact form</li>
                <li>&#10003; Basic SEO</li>
                <li>&#10003; 1 revision</li>
            </ul>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg w-80 hover:scale-105 transition-transform cursor-pointer">
            <h3 class="text-2xl font-semibold mb-3">Standard Package</h3>
            <p class="text-gray-600 text-xl font-bold mb-4">£250</p>
            <ul class="text-gray-700 text-left space-y-2">
                <li>&#10003; Everything in Basic</li>
                <li>&#10003; Blog setup</li>
                <li>&#10003; Social media integration</li>
                <li>&#10003; Google Analytics</li>
                <li>&#10003; 2 revisions</li>
            </ul>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg w-80 hover:scale-105 transition-transform cursor-pointer">
            <h3 class="text-2xl font-semibold mb-3">Premium Package</h3>
            <p class="text-gray-600 text-xl font-bold mb-4">£400</p>
            <ul class="text-gray-700 text-left space-y-2">
                <li>&#10003; Everything in Standard</li>
                <li>&#10003; Custom animations</li>
                <li>&#10003; Advanced SEO</li>
                <li>&#10003; Performance optimization</li>
                <li>&#10003; 3 revisions</li>
            </ul>
            </div>
        </div>
    </section>
</template>

<script setup>
import { useHead } from '@vueuse/head'

// SEO optimization
useHead({
  title: 'Starter Sites - Freelance Web Pro',
  meta: [
    {
      name: 'description',
      content: 'Delve into our starter website packages to find an affordable plan for your small business.'
    }
  ]
})
</script>