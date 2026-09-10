<template>
  <v-container
    class="py-8"
    max-width="1000"
  >
    <!-- Navigation Back Button -->
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      to="/"
    >
      Back to Rocket List
    </v-btn>

    <!-- Loading State -->
    <div
      v-if="store.isDetailLoading"
      class="py-6"
    >
      <v-skeleton-loader
        type="card, article, table"
        elevation="2"
        rounded="lg"
      />
    </div>

    <!-- Error State with Retry -->
    <v-alert
      v-else-if="store.detailError"
      type="error"
      variant="tonal"
      class="pa-4 my-4"
      rounded="lg"
      prominent
    >
      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between">
        <div>
          <h3 class="text-h6 font-weight-bold">
            Error loading rocket detail
          </h3>
          <p class="mb-0 text-body-2">
            {{ store.detailError }}
          </p>
        </div>
        <v-btn
          color="error"
          variant="elevated"
          prepend-icon="mdi-refresh"
          class="mt-3 mt-sm-0 align-self-start align-self-sm-center"
          @click="loadData"
        >
          Retry
        </v-btn>
      </div>
    </v-alert>

    <!-- Detail Content -->
    <v-card
      v-else-if="rocket"
      elevation="3"
      rounded="xl"
      class="overflow-hidden"
    >
      <!-- Hero Image -->
      <v-img
        :src="rocket.image_url || defaultPlaceholder"
        height="400"
        cover
        class="bg-grey-lighten-2 align-end"
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
            :src="defaultPlaceholder"
            height="100%"
            width="100%"
            cover
            class="fill-height"
          />
        </template>
        <div class="hero-overlay pa-6 text-white w-100">
          <div class="d-flex align-center gap-2 mb-1">
            <v-chip
              v-if="rocket.isLocal"
              color="success"
              size="small"
              variant="elevated"
              class="mr-2"
            >
              Local Rocket
            </v-chip>
            <v-chip
              v-if="rocket.manufacturer?.country_code"
              color="white"
              variant="outlined"
              size="small"
            >
              {{ rocket.manufacturer.country_code }}
            </v-chip>
          </div>
          <h1 class="text-h4 text-md-h3 font-weight-bold">
            {{ rocket.full_name || 'Unnamed Rocket' }}
          </h1>
        </div>
      </v-img>

      <v-card-text class="pa-6">
        <!-- Key Specifications Grid -->
        <h2 class="text-h6 font-weight-bold mb-4 d-flex align-center">
          <v-icon
            icon="mdi-information-outline"
            class="mr-2"
            color="primary"
          />
          Rocket Specifications
        </h2>

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
                {{ formatCost(rocket.launch_cost) }}
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
                {{ rocket.manufacturer?.country_code || 'N/A' }}
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
                {{ formatDate(rocket.maiden_flight) }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <!-- Description -->
        <h2 class="text-h6 font-weight-bold mb-3 d-flex align-center">
          <v-icon
            icon="mdi-text-box-outline"
            class="mr-2"
            color="primary"
          />
          Description
        </h2>
        <p class="text-body-1 text-medium-emphasis line-height-relaxed">
          {{ rocket.description || 'No description available for this rocket.' }}
        </p>

        <!-- Extra Technical Info Table -->
        <v-table class="mt-6 border rounded-lg">
          <thead>
            <tr>
              <th class="text-left font-weight-bold">
                Field
              </th>
              <th class="text-left font-weight-bold">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-medium-emphasis">
                Rocket Name
              </td>
              <td class="font-weight-medium">
                {{ rocket.full_name || 'N/A' }}
              </td>
            </tr>
            <tr>
              <td class="text-medium-emphasis">
                Manufacturer
              </td>
              <td>{{ rocket.manufacturer?.name || 'SpaceX' }}</td>
            </tr>
            <tr>
              <td class="text-medium-emphasis">
                Cost per Launch
              </td>
              <td>{{ formatCost(rocket.launch_cost) }}</td>
            </tr>
            <tr>
              <td class="text-medium-emphasis">
                Country of Origin
              </td>
              <td>{{ rocket.manufacturer?.country_code || 'N/A' }}</td>
            </tr>
            <tr>
              <td class="text-medium-emphasis">
                Maiden Flight
              </td>
              <td>{{ formatDate(rocket.maiden_flight) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Fallback if not found -->
    <v-empty-state
      v-else
      icon="mdi-alert-circle-outline"
      title="Rocket Not Found"
      text="We could not find the rocket you were looking for."
    >
      <template #actions>
        <v-btn
          color="primary"
          to="/"
        >
          Back to Rocket List
        </v-btn>
      </template>
    </v-empty-state>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRocketStore } from '@/stores/rocket'

const route = useRoute()
const store = useRocketStore()

const defaultPlaceholder = '/images/placeholders/rocket-placeholder.svg'

const rocketId = computed(() => {
  const param = route.params.id
  return Array.isArray(param) ? param[0] : param
})

const rocket = computed(() => store.selectedRocket)

function loadData() {
  if (rocketId.value) {
    store.fetchRocketById(rocketId.value)
  }
}

onMounted(() => {
  loadData()
})

function formatCost(cost: string | number | null | undefined): string {
  if (cost === null || cost === undefined || cost === '') return 'N/A'
  const numeric = Number(cost)
  if (isNaN(numeric)) return String(cost)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numeric)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
</script>

<style scoped>
.hero-overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 100%);
}
.line-height-relaxed {
  line-height: 1.8;
}
</style>
