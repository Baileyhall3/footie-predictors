<template>
  <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Contact Us</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-8">
        <form @submit.prevent="handleSubmit" className="space-y-6">
          <!-- Name Input -->
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <!-- Email Input -->
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          <!-- Phone Input -->
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              v-model="formData.phone"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+00 1234567890"
            />
          </div>

          <!-- Service Type -->
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
              What service are you interested in? *
            </label>
            <select
              id="serviceType"
              v-model="formData.serviceType"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a service</option>
              <option value="Custom Website">Custom Website</option>
              <option value="E-Commerce">E-Commerce Solution</option>
              <option value="SEO Services">SEO Services</option>
              <option value="Website Maintenance">Website Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <!-- Message Input -->
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Project Details *
            </label>
            <textarea
              id="message"
              v-model="formData.message"
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please describe your project or requirements..."
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="isSubmitting"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Sending...' : 'Send Message' }}
            </button>
          </div>

          <!-- Success/Error Message -->
          <div v-if="submitStatus" :class="[
            'p-4 rounded-lg text-center',
            submitStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          ]">
            {{ submitStatus.message }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useHead } from '@vueuse/head'
import emailjs from '@emailjs/browser';

// SEO
useHead({
  title: 'Contact Us - Irrelevant Clothing',
  meta: [
    {
      name: 'description',
      content: 'Get in touch with us for your web development needs. Contact us for custom websites, e-commerce solutions, and more.'
    }
  ]
})

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  serviceType: '',
  message: ''
});

const isSubmitting = ref(false);
const submitStatus = ref(null);

// Initialize EmailJS
onMounted(() => {
  emailjs.init("A4kYvhdrW8XjtppQm");
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  submitStatus.value = null;

  try {
    const response = await emailjs.send(
      "service_egu021a",
      "template_xlpyxmp",
      {
        from_name: formData.name,
        from_email: formData.email,
        phone_number: formData.phone,
        service_type: formData.serviceType,
        message: formData.message,
      }
    );

    if (response.status !== 200) throw new Error('Failed to send message');

    submitStatus.value = {
      type: 'success',
      message: 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.'
    };

    // Reset form
    Object.keys(formData).forEach(key => formData[key] = '');

  } catch (error) {
    submitStatus.value = {
      type: 'error',
      message: 'Sorry, there was an error sending your message. Please try again later.'
    };
  } finally {
    isSubmitting.value = false;
  }
};
</script>
