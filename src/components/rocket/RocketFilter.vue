<template>
  <v-card
    class="mb-6 pa-2"
    elevation="1"
    rounded="lg"
  >
    <v-text-field
      v-model="model"
      placeholder="Filter rockets by name or description..."
      prepend-inner-icon="mdi-magnify"
      clearable
      variant="solo-filled"
      flat
      hide-details
      density="comfortable"
    />
  </v-card>
</template>

<script lang="ts" setup>
const model = defineModel<string>({ default: '' })
</script>
