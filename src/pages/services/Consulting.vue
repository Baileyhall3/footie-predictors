<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <!-- Consulting Section -->
        <div class="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Consulting Services</h2>
            <p class="text-gray-600 mb-4">Expert advice on web strategy, technology choices, and digital transformation.</p>
            <ul class="list-disc list-inside text-gray-700">
                <li>Technology assessment</li>
                <li>Digital strategy</li>
                <li>Project planning</li>
                <li>Best practices guidance</li>
            </ul>
        </div>

        <!-- Case Study Section -->
        <div class="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Case Study: Digital Transformation for a Tattoo Shop</h2>
            <p class="text-gray-600 mb-4">
                I was approached by a local tattoo studio with the purpose of streamlining their operations by creating
                a digital tattoo consent form, accessible via a QR code in their studio.
            </p>
            <p class="text-gray-600 mb-4">
                This saved all parties time by giving customers the ability to fill in their consent forms prior to their appointment,
                rather than eating into their paid-for tattoo time.
            </p>
            <p class="text-gray-600 mb-4">
                It also lowered costs for the studio by eliminating the need for physical paperwork, while also boosting efficiency by having all consent
                forms stored in the cloud instead of a drawer in the studio.
            </p>
            
            <!-- Website Preview (Replace URL with actual site) -->
            <div class="border border-gray-300 rounded-lg overflow-hidden shadow-md">
                <iframe src="https://www.inkangel.co.uk/consent-form.html" class="w-full h-96" frameborder="0"></iframe>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-4">Client Review</h2>
            <p class="text-gray-600 mb-4 italic">
                "Bailey was excellent throughout the process of digitally transforming our business. I came to him because we were spending a fortune
                on printing paper for consent forms, and constantly struggling to locate them in the shop. He assured me that this new innovation for our
                studio would solve our issue, and it has made a huge difference."
            </p>
            <p class="text-gray-600 mb-4 italic">
                "I would highly recommend his services to anyone looking to improve their business' efficiency. He was always quick to respond to my messages
                and designed the form exactly to our studio's needs."
            </p>
            <p class="text-gray-600 mb-4">
                - Kyle, owner of Ink Angel Tattoo Studio
            </p>
        </div>
    </div>
</template>

<script setup>
    import { useHead } from '@vueuse/head'

    // SEO
    useHead({
    title: 'Digital Transformation - Freelance Web Pro',
    meta: [
        {
        name: 'description',
        content: 'Discover how your business can be digitally transformed to increase efficiency and lower overheads.'
        }
    ]
    })
</script>