<template>
    <div class="flex flex-col items-center min-h-screen bg-gray-100 p-6">
        <!-- Video Section -->
        <div class="w-full max-w-2xl mb-6">
            <video id="searchVideo" class="w-full rounded-lg" autoplay muted playsinline>
                <source src="/src/assets/videos/SEO Search.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
        
        <!-- Loading Spinner (Initially Hidden) -->
        <div id="loadingSpinner" class="mt-4 hidden">
            <div class="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
        
        <!-- Mock Search Results (Initially Hidden) -->
         <div id="searchResults" class="hidden">
             <div class="mt-6 w-full max-w-2xl bg-white p-4 rounded-lg shadow-lg">
                 <p class="font-semibold text-lg text-blue-600">What is SEO?</p>
                 <p class="text-gray-600 mt-2">SEO stands for Search Engine Optimization. It is the practice of optimizing web pages to rank higher in search engines.</p>
                 <p class="text-gray-600 mt-2">Good SEO includes keyword research, quality content, backlinks, and fast-loading pages.</p>
                 <p class="text-gray-600 mt-2">Bad SEO practices include keyword stuffing, duplicate content, and buying links.</p>
             </div>
     
             <div class="mt-6 w-full max-w-2xl bg-white p-4 rounded-lg shadow-lg">
                 <p class="font-semibold text-lg text-blue-600">Why is SEO important?</p>
                 <p class="text-gray-600 mt-2">SEO optimised sites are easier to find for potential customers when searching for relevant keywords.</p>
                 <p class="text-gray-600 mt-2">More website traffic ultimately leads to increased brand awareness through reaching your target audience in an organic way.</p>
                 <p class="text-gray-600 mt-2">Having your site appear on the first page of search results is a great way to establish your business' online presence.</p>
             </div>
         </div>
    </div>

</template>
<script setup>
    import { onMounted } from 'vue';
    import { useHead } from '@vueuse/head'

    // SEO optimization
    useHead({
    title: 'SEO Service - Freelance Web Pro',
    meta: [
        {
        name: 'description',
        content: 'Explore what SEO is and how it can grow your business'
        }
    ]
    });

    onMounted(() => {
        const seoVideo = document.getElementById("searchVideo");
        seoVideo.playbackRate = 1.5;
        seoVideo.addEventListener("ended", function() {
            document.getElementById("loadingSpinner").classList.remove("hidden");
            
            setTimeout(() => {
                document.getElementById("loadingSpinner").classList.add("hidden");
                document.getElementById("searchResults").classList.remove("hidden");
            }, 1500); // Simulating loading time after video ends
        });
    });
</script>