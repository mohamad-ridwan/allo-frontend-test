<template>
  <v-empty-state
    :icon="icon"
    :title="title"
    :text="text"
  >
    <template
      v-if="actionText"
      #actions
    >
      <v-btn
        color="primary"
        variant="tonal"
        @click="$emit('action')"
      >
        {{ actionText }}
      </v-btn>
    </template>
  </v-empty-state>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    icon?: string
    title?: string
    text?: string
    actionText?: string
  }>(),
  {
    icon: 'mdi-rocket-outline',
    title: 'No rockets found',
    text: '',
    actionText: '',
  },
)

defineEmits<{
  (e: 'action'): void
}>()
</script>
