import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Rocket } from "@/types/rocket";

const API_BASE_URL = "https://lldev.thespacedevs.com/2.2.0/config/launcher";

export const useRocketStore = defineStore("rocket", () => {
  // State
  const apiRockets = ref<Rocket[]>([]);
  const localRockets = ref<Rocket[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const filterQuery = ref<string>("");

  const selectedRocket = ref<Rocket | null>(null);
  const isDetailLoading = ref<boolean>(false);
  const detailError = ref<string | null>(null);

  // Getters
  // rockets: Array gabungan data API dan data lokal
  const rockets = computed<Rocket[]>(() => {
    return [...localRockets.value, ...apiRockets.value];
  });

  // filter query searching on full_name and description
  const filteredRockets = computed<Rocket[]>(() => {
    const query = filterQuery.value.trim().toLowerCase();
    if (!query) return rockets.value;

    return rockets.value.filter((rocket) => {
      const nameMatch = rocket.full_name?.toLowerCase().includes(query);
      const descMatch = rocket.description?.toLowerCase().includes(query);
      return Boolean(nameMatch || descMatch);
    });
  });

  // Actions
  async function fetchRockets() {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await fetch(
        `${API_BASE_URL}/?manufacturer__name=SpaceX&mode=detailed&limit=20`,
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch rockets (HTTP ${res.status})`);
      }
      const data = await res.json();
      apiRockets.value = data.results || [];
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch rockets from API";
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchRocketById(id: string | number) {
    selectedRocket.value = null;
    isDetailLoading.value = true;
    detailError.value = null;

    // 1. Cek di local rockets terlebih dahulu
    const localFound = localRockets.value.find(
      (r) => String(r.id) === String(id),
    );
    if (localFound) {
      selectedRocket.value = localFound;
      isDetailLoading.value = false;
      return localFound;
    }

    // 2. Cek apakah sudah ada di apiRockets cache
    const cached = apiRockets.value.find((r) => String(r.id) === String(id));
    if (cached) {
      selectedRocket.value = cached;
      isDetailLoading.value = false;
      return cached;
    }

    // 3. Fetch langsung dari API
    try {
      const res = await fetch(`${API_BASE_URL}/${id}/`);
      if (!res.ok) {
        throw new Error(`Failed to load rocket details (HTTP ${res.status})`);
      }
      const data = await res.json();
      selectedRocket.value = data;
      return data;
    } catch (err: unknown) {
      detailError.value =
        err instanceof Error
          ? err.message
          : "Error occurred while loading rocket details";
    } finally {
      isDetailLoading.value = false;
    }
  }

  function addLocalRocket(newRocket: Omit<Rocket, "id" | "isLocal">) {
    const rocket: Rocket = {
      ...newRocket,
      id: `local-${Date.now()}`,
      isLocal: true,
    };
    localRockets.value.unshift(rocket);
  }

  return {
    // State
    apiRockets,
    localRockets,
    isLoading,
    error,
    filterQuery,
    selectedRocket,
    isDetailLoading,
    detailError,
    // Getters
    rockets,
    filteredRockets,
    // Actions
    fetchRockets,
    fetchRocketById,
    addLocalRocket,
  };
});
