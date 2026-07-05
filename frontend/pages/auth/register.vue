<template>
  <div class="login-card glass-card rounded-2xl pa-8 w-100">
    <div class="text-center mb-8">
      <h1 class="text-h5 font-weight-bold text-white mb-1">Create Account</h1>
      <p class="text-body-2" style="color:rgba(255,255,255,0.5)">Start managing your finances today</p>
    </div>

    <v-form @submit.prevent="handleRegister">
      <v-text-field
        v-model="form.name"
        label="Full Name"
        prepend-inner-icon="mdi-account-outline"
        :error-messages="errors.name"
        class="mb-3"
        autocomplete="name"
      />

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
        class="mb-3"
        autocomplete="new-password"
      />

      <v-text-field
        v-model="form.confirmPassword"
        label="Confirm Password"
        :type="showPass ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-check-outline"
        :error-messages="errors.confirmPassword"
        class="mb-6"
        autocomplete="new-password"
      />

      <v-btn
        type="submit"
        block
        size="large"
        class="btn-gold mb-4"
        :loading="loading"
        height="52"
      >
        Create Account
      </v-btn>

      <div class="text-center">
        <span class="text-body-2" style="color:rgba(255,255,255,0.5)">Already have an account? </span>
        <NuxtLink to="/auth/login" class="text-primary text-decoration-none font-weight-medium">
          Sign In
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
const form     = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const errors   = reactive({ name: '', email: '', password: '', confirmPassword: '' })

function validate() {
  errors.name            = form.name ? '' : 'Name is required'
  errors.email           = form.email ? '' : 'Email is required'
  errors.password        = form.password.length >= 6 ? '' : 'Password must be at least 6 characters'
  errors.confirmPassword = form.password === form.confirmPassword ? '' : 'Passwords do not match'
  if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email'
  return !errors.name && !errors.email && !errors.password && !errors.confirmPassword
}

async function handleRegister() {
  if (!validate()) return
  loading.value = true
  try {
    await authStore.register(form.name, form.email, form.password)
    toast.success('Account created! Please log in.')
    navigateTo('/auth/login')
  } catch (err: any) {
    toast.error(err.message || 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-card {
  border: 1px solid rgba(65, 169, 224, 0.25) !important;
  background: rgba(255,255,255,0.03) !important;
  backdrop-filter: blur(30px);
}
</style>
