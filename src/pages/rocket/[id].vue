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

    <!-- 1. Loading State -->
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

    <!-- 2. Error State with Retry -->
    <StateError
      v-else-if="store.detailError"
      title="Error loading rocket detail"
      :message="store.detailError"
      @retry="loadData"
    />

    <!-- 3. Detail Content (Success State) -->
    <v-card
      v-else-if="rocket"
      elevation="3"
      rounded="xl"
      class="overflow-hidden"
    >
      <!-- Hero Image -->
      <v-img
        :src="rocket.image_url || DEFAULT_PLACEHOLDER_IMAGE"
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
            :src="DEFAULT_PLACEHOLDER_IMAGE"
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
        <!-- Key Specifications Metric Cards -->
        <h2 class="text-h6 font-weight-bold mb-4 d-flex align-center">
          <v-icon
            icon="mdi-information-outline"
            class="mr-2"
            color="primary"
          />
          Rocket Specifications
        </h2>

        <RocketSpecsCard
          :launch-cost="rocket.launch_cost"
          :country-code="rocket.manufacturer?.country_code"
          :maiden-flight="rocket.maiden_flight"
        />

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
        <RocketSpecsTable :rocket="rocket" />
      </v-card-text>
    </v-card>

    <!-- Fallback if not found -->
    <StateEmpty
      v-else
      icon="mdi-alert-circle-outline"
      title="Rocket Not Found"
      text="We could not find the rocket you were looking for."
      action-text="Back to Rocket List"
      @action="$router.push('/')"
    />
  </v-container>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRocketStore } from '@/stores/rocket'
import { DEFAULT_PLACEHOLDER_IMAGE } from '@/utils/formatters'
import StateError from '@/components/common/StateError.vue'
import StateEmpty from '@/components/common/StateEmpty.vue'
import RocketSpecsCard from '@/components/rocket/RocketSpecsCard.vue'
import RocketSpecsTable from '@/components/rocket/RocketSpecsTable.vue'

const route = useRoute()
const store = useRocketStore()

const rocketId = computed(() => {
  const param = 'id' in route.params ? route.params.id : undefined
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
</script>

<style scoped>
.hero-overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 100%);
}
.line-height-relaxed {
  line-height: 1.8;
}
</style>
