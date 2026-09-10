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
    <v-card
      class="mb-6 pa-2"
      elevation="1"
      rounded="lg"
    >
      <v-text-field
        v-model="store.filterQuery"
        placeholder="Filter rockets by name or description..."
        prepend-inner-icon="mdi-magnify"
        clearable
        variant="solo-filled"
        flat
        hide-details
        density="comfortable"
      />
    </v-card>

    <!-- Loading State -->
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

    <!-- Error State with Retry Button -->
    <v-alert
      v-else-if="store.error"
      type="error"
      variant="tonal"
      class="mb-6 pa-4"
      rounded="lg"
      prominent
    >
      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between">
        <div>
          <h3 class="text-h6 font-weight-bold">
            Error loading rockets
          </h3>
          <p class="mb-0 text-body-2">
            {{ store.error }}
          </p>
        </div>
        <v-btn
          color="error"
          variant="elevated"
          prepend-icon="mdi-refresh"
          class="mt-3 mt-sm-0 align-self-start align-self-sm-center"
          @click="store.fetchRockets"
        >
          Retry
        </v-btn>
      </div>
    </v-alert>

    <!-- Rocket Grid (Success State) -->
    <div v-else>
      <v-row v-if="store.filteredRockets.length > 0">
        <v-col
          v-for="rocket in store.filteredRockets"
          :key="rocket.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            hover
            elevation="2"
            rounded="lg"
            class="d-flex flex-column h-100 rocket-card"
            :to="`/rocket/${rocket.id}`"
          >
            <!-- Image with fallback -->
            <v-img
              :src="rocket.image_url || defaultPlaceholder"
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
                  :src="defaultPlaceholder"
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
        </v-col>
      </v-row>

      <!-- Empty Filter Result -->
      <v-empty-state
        v-else
        icon="mdi-rocket-outline"
        title="No rockets found"
        :text="`No results found matching &quot;${store.filterQuery}&quot;`"
      >
        <template #actions>
          <v-btn
            color="primary"
            variant="tonal"
            @click="store.filterQuery = ''"
          >
            Clear Filter
          </v-btn>
        </template>
      </v-empty-state>
    </div>

    <!-- Add Rocket Dialog -->
    <v-dialog
      v-model="showAddDialog"
      max-width="600"
      persistent
    >
      <v-card rounded="lg">
        <v-toolbar
          color="primary"
          density="comfortable"
        >
          <v-toolbar-title class="font-weight-bold">
            Add New Rocket (Local)
          </v-toolbar-title>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showAddDialog = false"
          />
        </v-toolbar>

        <v-form
          ref="formRef"
          v-model="isFormValid"
          @submit.prevent="handleSubmit"
        >
          <v-card-text class="pt-4">
            <v-text-field
              v-model="newRocket.full_name"
              label="Rocket Name *"
              :rules="[v => !!v || 'Rocket name is required']"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />

            <v-textarea
              v-model="newRocket.description"
              label="Description"
              rows="3"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />

            <v-text-field
              v-model="newRocket.image_url"
              label="Image URL"
              placeholder="https://example.com/rocket.jpg"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />

            <v-row dense>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="newRocket.launch_cost"
                  label="Cost per Launch"
                  placeholder="e.g. 50000000"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="countryCodeInput"
                  label="Country Code"
                  placeholder="e.g. USA"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model="newRocket.maiden_flight"
              label="First Flight Date"
              type="date"
              variant="outlined"
              density="comfortable"
            />
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="plain"
              @click="showAddDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              :disabled="!isFormValid"
              type="submit"
            >
              Save Rocket
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import { useRocketStore } from '@/stores/rocket'

const store = useRocketStore()

const defaultPlaceholder = '/images/placeholders/rocket-placeholder.svg'

const showAddDialog = ref(false)
const isFormValid = ref(false)
const formRef = ref()
const countryCodeInput = ref('USA')

const newRocket = reactive({
  full_name: '',
  description: '',
  image_url: '',
  launch_cost: '',
  maiden_flight: '',
})

onMounted(() => {
  if (store.apiRockets.length === 0) {
    store.fetchRockets()
  }
})

function handleSubmit() {
  if (!newRocket.full_name) return

  store.addLocalRocket({
    full_name: newRocket.full_name,
    description: newRocket.description || null,
    image_url: newRocket.image_url || null,
    launch_cost: newRocket.launch_cost || null,
    maiden_flight: newRocket.maiden_flight || null,
    manufacturer: {
      name: 'SpaceX',
      country_code: countryCodeInput.value || null,
    },
  })

  // Reset form
  newRocket.full_name = ''
  newRocket.description = ''
  newRocket.image_url = ''
  newRocket.launch_cost = ''
  newRocket.maiden_flight = ''
  countryCodeInput.value = 'USA'
  showAddDialog.value = false
}
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
