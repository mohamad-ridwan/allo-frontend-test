<template>
  <v-row class="mb-6">
    <v-col
      cols="12"
      sm="4"
    >
      <v-card
        variant="tonal"
        color="primary"
        class="pa-4 text-center rounded-lg"
      >
        <v-icon
          icon="mdi-currency-usd"
          size="32"
          class="mb-1"
        />
        <div class="text-caption text-medium-emphasis">
          Cost Per Launch
        </div>
        <div class="text-h6 font-weight-bold mt-1">
          {{ formatCost(launchCost) }}
        </div>
      </v-card>
    </v-col>

    <v-col
      cols="12"
      sm="4"
    >
      <v-card
        variant="tonal"
        color="info"
        class="pa-4 text-center rounded-lg"
      >
        <v-icon
          icon="mdi-flag-outline"
          size="32"
          class="mb-1"
        />
        <div class="text-caption text-medium-emphasis">
          Country
        </div>
        <div class="text-h6 font-weight-bold mt-1">
          {{ countryCode || 'N/A' }}
        </div>
      </v-card>
    </v-col>

    <v-col
      cols="12"
      sm="4"
    >
      <v-card
        variant="tonal"
        color="secondary"
        class="pa-4 text-center rounded-lg"
      >
        <v-icon
          icon="mdi-calendar-start"
          size="32"
          class="mb-1"
        />
        <div class="text-caption text-medium-emphasis">
          First Flight
        </div>
        <div class="text-h6 font-weight-bold mt-1">
          {{ formatDate(maidenFlight) }}
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import { formatCost, formatDate } from '@/utils/formatters'

defineProps<{
  launchCost?: string | number | null
  countryCode?: string | null
  maidenFlight?: string | null
}>()
</script>
