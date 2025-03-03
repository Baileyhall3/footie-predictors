<template>
  <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Our Services</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Custom Web Design -->
        <router-link to="/products/starter-sites" className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Custom Web Design</h2>
          <p className="text-gray-600 mb-4">
            Unique and modern designs tailored to your brand identity. We create responsive websites that look great on all devices.
          </p>
          <ul className="text-gray-600 space-y-2">
            <li>• Responsive design</li>
            <li>• Brand-aligned visuals</li>
            <li>• User experience optimization</li>
            <li>• Modern UI/UX principles</li>
          </ul>
        </router-link>

        <!-- E-Commerce Solutions -->
        <router-link to="/products/e-commerce-sites" className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">E-Commerce Solutions</h2>
          <p className="text-gray-600 mb-4">
            Build a powerful online store that converts visitors into customers with our comprehensive e-commerce solutions.
          </p>
          <ul className="text-gray-600 space-y-2">
            <li>• Secure payment integration</li>
            <li>• Inventory management</li>
            <li>• Shopping cart optimization</li>
            <li>• Mobile commerce ready</li>
          </ul>
        </router-link>

        <!-- SEO Optimization -->
        <router-link to="/services/SEO" className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">SEO Optimization</h2>
          <p className="text-gray-600 mb-4">
            Improve your search engine rankings and increase organic traffic with our proven SEO strategies.
          </p>
          <ul className="text-gray-600 space-y-2">
            <li>• Keyword optimization</li>
            <li>• Technical SEO</li>
            <li>• Content strategy</li>
            <li>• Performance optimization</li>
          </ul>
        </router-link>

        <!-- Web Development -->
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Web Development</h2>
          <p className="text-gray-600 mb-4">
            Custom web development solutions using the latest technologies and best practices.
          </p>
          <ul className="text-gray-600 space-y-2">
            <li>• Front-end development</li>
            <li>• Back-end systems</li>
            <li>• API integration</li>
            <li>• Database design</li>
          </ul>
        </div>

        <!-- Website Maintenance -->
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Website Maintenance</h2>
          <p className="text-gray-600 mb-4">
            Keep your website running smoothly with our comprehensive maintenance services.
          </p>
          <ul className="text-gray-600 space-y-2">
            <li>• Regular updates</li>
            <li>• Security monitoring</li>
            <li>• Performance optimization</li>
            <li>• Content updates</li>
          </ul>
        </div>

        <!-- Consulting -->
        <router-link to="/services/consulting" className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Consulting</h2>
          <p className="text-gray-600 mb-4">
            Expert advice on web strategy, technology choices, and digital transformation.
          </p>
          <ul className="text-gray-600 space-y-2">
            <li>• Technology assessment</li>
            <li>• Digital strategy</li>
            <li>• Project planning</li>
            <li>• Best practices guidance</li>
          </ul>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head'

// SEO optimization
useHead({
  title: 'Web Development Services - Freelance Web Pro',
  meta: [
    {
      name: 'description',
      content: 'Professional web development services including custom design, e-commerce solutions, SEO optimization, and website maintenance.'
    }
  ]
})
</script>
