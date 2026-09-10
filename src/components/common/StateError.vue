<template>
  <v-alert
    type="error"
    variant="tonal"
    class="mb-6 pa-4"
    rounded="lg"
    prominent
  >
    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between">
      <div>
        <h3 class="text-h6 font-weight-bold">
          {{ title }}
        </h3>
        <p class="mb-0 text-body-2">
          {{ message }}
        </p>
      </div>
      <v-btn
        color="error"
        variant="elevated"
        prepend-icon="mdi-refresh"
        class="mt-3 mt-sm-0 align-self-start align-self-sm-center"
        @click="$emit('retry')"
      >
        {{ retryText }}
      </v-btn>
    </div>
  </v-alert>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    title?: string
    message?: string
    retryText?: string
  }>(),
  {
    title: 'Error loading data',
    message: 'An unexpected error occurred. Please try again.',
    retryText: 'Retry',
  },
)

defineEmits<{
  (e: 'retry'): void
}>()
</script>
