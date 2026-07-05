<template>
  <div class="error-page">
    <div class="error-content text-center">
      <div class="error-code gold-text">{{ error?.statusCode || '404' }}</div>
      <h1 class="text-h4 font-weight-bold text-white mb-3">
        {{ error?.statusCode === 500 ? 'Server Error' : 'Page Not Found' }}
      </h1>
      <p class="text-body-1 mb-8" style="color:rgba(255,255,255,0.4)">
        {{ error?.statusCode === 500
          ? 'Something went wrong on our end. Please try again later.'
          : 'The page you are looking for does not exist.' }}
      </p>
      <v-btn class="btn-gold" size="large" @click="handleError" prepend-icon="mdi-home">
        Go to Dashboard
      </v-btn>
    </div>

    <!-- Background -->
    <div class="error-bg">
      <div class="error-bg__orb" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error?: any }>()

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  background: #080808;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.error-content { position: relative; z-index: 1; padding: 24px; }
.error-code {
  font-size: clamp(6rem, 20vw, 12rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -4px;
  margin-bottom: 24px;
}
.error-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  &__orb {
    position: absolute;
    width: 800px; height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
