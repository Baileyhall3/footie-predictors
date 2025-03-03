<template>
  <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Our Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- Product 1 -->
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-600 p-4">
            <h2 className="text-2xl font-semibold text-white">Starter Website Package</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Perfect for small businesses looking to establish their online presence.
            </p>
            <ul className="text-gray-600 space-y-2 mb-6">
              <li>✓ Responsive design</li>
              <li>✓ Up to 5 pages</li>
              <li>✓ Basic SEO setup</li>
              <li>✓ Contact form</li>
              <li>✓ Mobile optimization</li>
              <li>✓ 3 months support</li>
            </ul>
            <router-link 
              to="/contact"
              className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </router-link>
          </div>
        </div>

        <!-- Product 2 -->
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-600 p-4">
            <h2 className="text-2xl font-semibold text-white">E-Commerce Package</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Complete e-commerce solution for businesses ready to sell online.
            </p>
            <ul className="text-gray-600 space-y-2 mb-6">
              <li>✓ Full e-commerce functionality</li>
              <li>✓ Product management system</li>
              <li>✓ Secure payment integration</li>
              <li>✓ Inventory tracking</li>
              <li>✓ Advanced SEO features</li>
              <li>✓ 6 months support</li>
            </ul>
            <router-link 
              to="/contact"
              className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Learn More
            </router-link>
          </div>
        </div>
      </div>

      <!-- Additional Features -->
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">All Products Include</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-800 mb-2">Performance Optimization</h4>
            <p className="text-gray-600">Fast loading speeds and optimal performance across all devices</p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-800 mb-2">Security Features</h4>
            <p className="text-gray-600">SSL certificates and security best practices implemented</p>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-800 mb-2">Analytics Integration</h4>
            <p className="text-gray-600">Track your website's performance with detailed analytics</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head'

// SEO optimization
useHead({
  title: 'Web Development Products - Freelance Web Pro',
  meta: [
    {
      name: 'description',
      content: 'Explore our web development products including starter websites and e-commerce solutions. Custom-built websites with modern features and ongoing support.'
    }
  ]
})
</script>
