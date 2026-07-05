<template>
  <v-dialog v-model="model" max-width="420" persistent>
    <v-card class="glass-card pa-6" rounded="xl">
      <div class="text-center mb-4">
        <v-icon :icon="icon || 'mdi-alert-circle-outline'" :color="iconColor" size="52" class="mb-3" />
        <h3 class="text-h6 font-weight-bold text-high-emphasis mb-2">{{ title }}</h3>
        <p class="text-body-2 text-medium-emphasis">{{ message }}</p>
      </div>
      <div class="d-flex ga-3">
        <v-btn
          variant="tonal"
          rounded="lg"
          class="action-btn"
          @click="$emit('cancel')"
          :disabled="loading"
        >Cancel</v-btn>
        <v-btn
          :color="confirmColor || 'error'"
          rounded="lg"
          class="action-btn"
          :loading="loading"
          @click="$emit('confirm')"
        >{{ confirmText || 'Delete' }}</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  title:        string
  message:      string
  icon?:        string
  iconColor?:   string
  confirmText?: string
  confirmColor?: string
  loading?:     boolean
}>()
defineEmits(['confirm', 'cancel'])

const model = defineModel<boolean>()
</script>

<style scoped>
.action-btn {
  flex: 1 1 0;
}
</style>
