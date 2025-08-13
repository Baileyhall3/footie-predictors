<template>
  <div class="fixed inset-0 flex items-center justify-center bg-white py-12">
    <div class="text-center">
      <img src="../assets/images/green-football-md.png"
        alt="Loading Football"
        class="animate-spin h-12 w-12 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-gray-800">Loading...</h2>
      <p class="text-gray-600 mt-2">{{ message || 'Please wait while we set things up' }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingScreen',
  props: {
    message: {
      type: String,
      default: ''
    }
  }
}
</script>
