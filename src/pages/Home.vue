<template>
  <div className="min-h-screen bg-gray-100">
    <main className="flex-1 flex flex-col items-center justify-center text-center py-12">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Professional Websites for Your Business
      </h2>
      <p className="text-lg text-gray-600 mb-6">
          Custom, responsive, and high-performing websites tailored to your needs.
      </p>
      <router-link
        to="/contact"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition mb-2"
      >
          Get a Free Quote
      </router-link>
    </main>

    <section id="services" className="w-full py-12 bg-white text-center">
      <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Services</h3>
      <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
        <div className="bg-gray-200 p-6 rounded-lg shadow-md w-64 transform transition-all duration-300 hover:scale-105 cursor-pointer">
          <h4 className="text-xl font-semibold mb-2">Custom Design</h4>
          <p className="text-gray-600">
            Unique and modern designs to fit your brand.
          </p>
        </div>
        <router-link to="/products/e-commerce-sites" className="bg-gray-200 p-6 rounded-lg shadow-md w-64 transform transition-all duration-300 hover:scale-105 cursor-pointer">
          <h4 className="text-xl font-semibold mb-2">E-Commerce</h4>
          <p className="text-gray-600">
            Build an online store that converts visitors into customers.
          </p>
        </router-link>
        <router-link to="/services/SEO" className="bg-gray-200 p-6 rounded-lg shadow-md w-64 transform transition-all duration-300 hover:scale-105 cursor-pointer">
          <h4 className="text-xl font-semibold mb-2">SEO Optimization</h4>
          <p className="text-gray-600">
            Improve search rankings and online visibility.
          </p>
        </router-link>
      </div>
    </section>

    <section id="portfolio" className="w-full py-12 bg-gray-100 text-center">
      <h3 className="text-3xl font-bold text-gray-800 mb-6">Portfolio</h3>
      <p className="text-gray-600">Check out some of our past work.</p>
      
      <div className="flex flex-wrap justify-center gap-6 mt-6 max-w-4xl mx-auto">
          <a href="https://inkangel.co.uk" target="_blank" rel="noopener noreferrer" 
            className="bg-white rounded-lg shadow-md w-64 overflow-hidden hover:shadow-lg transition-shadow">
              <img src="../assets/images/ink-angel-preview.png" alt="Ink Angel Website" className="w-full h-40 object-cover" />
              <div className="p-4">
                  <h4 className="text-xl font-semibold text-gray-800">Ink Angel</h4>
                  <p className="text-gray-600 text-sm mt-2">A modern tattoo studio website featuring an online consent form via QR code.</p>
              </div>
          </a>

          <a href="https://example2.com" target="_blank" rel="noopener noreferrer" 
            className="bg-white rounded-lg shadow-md w-64 overflow-hidden hover:shadow-lg transition-shadow">
              <img src="../assets/images/ink-angel.png" alt="Project 2" className="w-full h-40 object-cover" />
              <div className="p-4">
                  <h4 className="text-xl font-semibold text-gray-800">Project 2</h4>
                  <p className="text-gray-600 text-sm mt-2">A custom-built e-commerce store with Stripe integration and product management.</p>
              </div>
          </a>

          <a href="https://example3.com" target="_blank" rel="noopener noreferrer" 
            className="bg-white rounded-lg shadow-md w-64 overflow-hidden hover:shadow-lg transition-shadow">
              <img src="../assets/images/ink-angel.png" alt="Project 3" className="w-full h-40 object-cover" />
              <div className="p-4">
                  <h4 className="text-xl font-semibold text-gray-800">Project 3</h4>
                  <p className="text-gray-600 text-sm mt-2">A dynamic blog platform with an intuitive CMS and SEO optimization.</p>
              </div>
          </a>
      </div>
  </section>

  </div>
</template>

<script setup>


</script>
