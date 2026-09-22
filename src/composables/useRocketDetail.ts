import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRocketStore } from "@/stores/rocket";

export function useRocketDetail() {
  const route = useRoute();
  const store = useRocketStore();

  const rocketId = computed(() => {
    const param = "id" in route.params ? route.params.id : undefined;
    return Array.isArray(param) ? param[0] : param;
  });

  const rocket = computed(() => store.selectedRocket);

  function loadData() {
    if (rocketId.value) {
      store.fetchRocketById(rocketId.value);
    }
  }

  onMounted(() => {
    loadData();
  });

  return {
    store,
    rocketId,
    rocket,
    loadData,
  };
}
