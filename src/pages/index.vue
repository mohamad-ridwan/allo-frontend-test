<template>
  <v-container
    class="py-8"
    max-width="1200"
  >
    <!-- Header -->
    <v-row
      align="center"
      class="mb-6"
    >
      <v-col
        cols="12"
        md="7"
      >
        <h1 class="text-h4 font-weight-bold d-flex align-center gap-2">
          <v-icon
            color="primary"
            icon="mdi-rocket-launch"
            class="mr-2"
          />
          SpaceX Rockets
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis mt-1">
          Explore SpaceX rockets and launch vehicles from Launch Library API
        </p>
      </v-col>

      <v-col
        cols="12"
        md="5"
        class="d-flex justify-md-end gap-2"
      >
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          elevation="2"
          @click="showAddDialog = true"
        >
          Add Rocket
        </v-btn>
      </v-col>
    </v-row>

    <!-- Search / Filter Bar -->
    <RocketFilter v-model="store.filterQuery" />

    <!-- 1. Loading State -->
    <div
      v-if="store.isLoading"
      class="py-8"
    >
      <v-row>
        <v-col
          v-for="n in 6"
          :key="n"
          cols="12"
          sm="6"
          md="4"
        >
          <v-skeleton-loader
            type="image, article, actions"
            elevation="2"
            rounded="lg"
          />
        </v-col>
      </v-row>
    </div>

    <!-- 2. Error State with Retry Button -->
    <StateError
      v-else-if="store.error"
      title="Error loading rockets"
      :message="store.error"
      @retry="store.fetchRockets"
    />

    <!-- 3. Rocket Grid (Success State) -->
    <div v-else>
      <v-row v-if="store.filteredRockets.length > 0">
        <v-col
          v-for="rocket in store.filteredRockets"
          :key="rocket.id"
          cols="12"
          sm="6"
          md="4"
        >
          <RocketCard :rocket="rocket" />
        </v-col>
      </v-row>

      <!-- Empty Filter Result -->
      <StateEmpty
        v-else
        icon="mdi-rocket-outline"
        title="No rockets found"
        :text="`No results found matching &quot;${store.filterQuery}&quot;`"
        action-text="Clear Filter"
        @action="store.filterQuery = ''"
      />
    </div>

    <!-- Add Rocket Dialog Modal -->
    <AddRocketDialog
      v-model="showAddDialog"
      @submit="handleCreateRocket"
    />
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRocketStore } from '@/stores/rocket'
import type { Rocket } from '@/types/rocket'
import RocketCard from '@/components/rocket/RocketCard.vue'
import RocketFilter from '@/components/rocket/RocketFilter.vue'
import AddRocketDialog from '@/components/rocket/AddRocketDialog.vue'
import StateError from '@/components/common/StateError.vue'
import StateEmpty from '@/components/common/StateEmpty.vue'

const store = useRocketStore()
const showAddDialog = ref(false)

onMounted(() => {
  if (store.apiRockets.length === 0) {
    store.fetchRockets()
  }
})

function handleCreateRocket(payload: Omit<Rocket, 'id' | 'isLocal'>) {
  store.addLocalRocket(payload)
}
</script>
