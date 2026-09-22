<template>
  <v-dialog
    v-model="isOpen"
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
          @click="closeDialog"
        />
      </v-toolbar>

      <v-form
        ref="formRef"
        v-model="isFormValid"
        @submit.prevent="handleSubmit"
      >
        <v-card-text class="pt-4">
          <v-text-field
            v-model="form.full_name"
            label="Rocket Name *"
            :rules="[v => !!v || 'Rocket name is required']"
            variant="outlined"
            density="comfortable"
            class="mb-2"
          />

          <v-textarea
            v-model="form.description"
            label="Description"
            rows="3"
            variant="outlined"
            density="comfortable"
            class="mb-2"
          />

          <v-text-field
            v-model="form.image_url"
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
                v-model="form.launch_cost"
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
            v-model="form.maiden_flight"
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
            @click="closeDialog"
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
</template>

<script lang="ts" setup>
import type { Rocket } from '@/types/rocket'
import { useRocketForm } from '@/composables/useRocketForm'

const isOpen = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'submit', payload: Omit<Rocket, 'id' | 'isLocal'>): void
}>()

function closeDialog() {
  isOpen.value = false
}

const {
  form,
  countryCodeInput,
  isFormValid,
  handleSubmit,
} = useRocketForm(
  (payload) => emit('submit', payload),
  closeDialog,
)
</script>
