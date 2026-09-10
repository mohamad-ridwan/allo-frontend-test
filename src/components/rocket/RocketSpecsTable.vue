<template>
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
</template>

<script lang="ts" setup>
import type { Rocket } from '@/types/rocket'
import { formatCost, formatDate } from '@/utils/formatters'

defineProps<{
  rocket: Rocket
}>()
</script>
