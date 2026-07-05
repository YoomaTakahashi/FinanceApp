<template>
  <div class="login-card glass-card rounded-2xl pa-8 w-100">
    <div class="text-center mb-8">
      <h1 class="text-h5 font-weight-bold text-white mb-1">Welcome Back</h1>
      <p class="text-body-2" style="color:rgba(255,255,255,0.5)">Sign in to your account</p>
    </div>

    <v-form @submit.prevent="handleLogin">
      <v-text-field
        v-model="form.email"
        label="Email Address"
        type="email"
        prepend-inner-icon="mdi-email-outline"
        :error-messages="errors.email"
        class="mb-3"
        autocomplete="email"
      />

      <v-text-field
        v-model="form.password"
        label="Password"
        :type="showPass ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showPass = !showPass"
        :error-messages="errors.password"
        class="mb-2"
        autocomplete="current-password"
      />

      <div class="d-flex align-center justify-space-between mb-6">
        <v-checkbox
          v-model="form.rememberMe"
          label="Remember me"
          density="compact"
          color="primary"
          hide-details
        />
      </div>

      <v-btn
        type="submit"
        block
        size="large"
        class="btn-gold mb-4"
        :loading="loading"
        height="52"
      >
        Sign In
      </v-btn>

      <div class="text-center">
        <span class="text-body-2" style="color:rgba(255,255,255,0.5)">Don't have an account? </span>
        <NuxtLink to="/auth/register" class="text-primary text-decoration-none font-weight-medium">
          Sign Up
        </NuxtLink>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'

definePageMeta({ layout: 'auth', middleware: 'auth' })

const authStore = useAuthStore()
const toast     = useToast()

const loading  = ref(false)
const showPass = ref(false)
const form     = reactive({ email: '', password: '', rememberMe: false })
const errors   = reactive({ email: '', password: '' })

function validate() {
  errors.email    = form.email    ? '' : 'Email is required'
  errors.password = form.password ? '' : 'Password is required'
  if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email'
  return !errors.email && !errors.password
}

async function handleLogin() {
  if (!validate()) return
  loading.value = true
  try {
    await authStore.login(form.email, form.password, form.rememberMe)
    toast.success('Welcome back!')
    navigateTo('/')
  } catch (err: any) {
    toast.error(err.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-card {
  border: 1px solid rgba(201, 168, 76, 0.15) !important;
  background: rgba(255,255,255,0.03) !important;
  backdrop-filter: blur(30px);
}
</style>
