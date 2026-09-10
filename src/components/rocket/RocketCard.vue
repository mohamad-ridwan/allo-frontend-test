<template>
  <v-card
    hover
    elevation="2"
    rounded="lg"
    class="d-flex flex-column h-100 rocket-card"
    :to="`/rocket/${rocket.id}`"
  >
    <!-- Image with fallback -->
    <v-img
      :src="rocket.image_url || DEFAULT_PLACEHOLDER_IMAGE"
      height="200"
      cover
      class="bg-grey-lighten-2"
    >
      <template #placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>
      </template>
      <template #error>
        <v-img
          :src="DEFAULT_PLACEHOLDER_IMAGE"
          height="100%"
          width="100%"
          cover
          class="fill-height"
        />
      </template>
      <div
        v-if="rocket.isLocal"
        class="pa-2"
      >
        <v-chip
          color="success"
          size="small"
          variant="elevated"
        >
          Local
        </v-chip>
      </div>
    </v-img>

    <v-card-item>
      <v-card-title class="text-h6 font-weight-bold text-truncate">
        {{ rocket.full_name || 'Unnamed Rocket' }}
      </v-card-title>
    </v-card-item>

    <v-card-text class="flex-grow-1">
      <p class="text-body-2 text-medium-emphasis line-clamp-3 mb-0">
        {{ rocket.description || 'No description available for this rocket.' }}
      </p>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-3">
      <span class="text-caption text-medium-emphasis">
        {{ rocket.manufacturer?.country_code || 'Country: N/A' }}
      </span>
      <v-spacer />
      <v-btn
        color="primary"
        variant="text"
        append-icon="mdi-arrow-right"
        size="small"
      >
        Detail
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import type { Rocket } from '@/types/rocket'
import { DEFAULT_PLACEHOLDER_IMAGE } from '@/utils/formatters'

defineProps<{
  rocket: Rocket
}>()
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rocket-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.rocket-card:hover {
  transform: translateY(-4px);
}
</style>
