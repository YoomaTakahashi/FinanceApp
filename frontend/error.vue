<template>
  <v-app theme="dark">
    <div class="error-page">
      <div class="error-bg">
        <div class="error-bg__orb" />
      </div>

      <div class="error-content text-center px-6">
        <div class="error-code gold-text">{{ error?.statusCode || '404' }}</div>

        <h1 class="text-h4 font-weight-bold text-white mb-3">
          {{ error?.statusCode === 500 ? 'Something Went Wrong' : 'Page Not Found' }}
        </h1>

        <p class="text-body-1 mb-8 mx-auto" style="color:rgba(255,255,255,0.4);max-width:420px">
          {{ error?.statusCode === 500
            ? 'An unexpected error occurred. Our team has been notified.'
            : 'The page you are looking for might have been moved or deleted.' }}
        </p>

        <v-btn
          class="btn-gold"
          size="large"
          height="52"
          min-width="180"
          prepend-icon="mdi-home"
          @click="clearError({ redirect: '/' })"
        >
          Back to Dashboard
        </v-btn>
      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts">
defineProps<{ error?: { statusCode?: number; message?: string } }>()
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
.error-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  &__orb {
    position: absolute;
    width: 800px; height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }
}
.error-content { position: relative; z-index: 1; }
.error-code {
  font-size: clamp(7rem, 20vw, 14rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -6px;
  margin-bottom: 24px;
}
</style>
