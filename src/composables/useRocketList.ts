import { ref, onMounted } from "vue";
import { useRocketStore } from "@/stores/rocket";
import type { Rocket } from "@/types/rocket";

export function useRocketList() {
  const store = useRocketStore();
  const showAddDialog = ref(false);

  onMounted(() => {
    if (store.apiRockets.length === 0) {
      store.fetchRockets();
    }
  });

  function openAddDialog() {
    showAddDialog.value = true;
  }

  function closeAddDialog() {
    showAddDialog.value = false;
  }

  function handleCreateRocket(payload: Omit<Rocket, "id" | "isLocal">) {
    store.addLocalRocket(payload);
  }

  return {
    store,
    showAddDialog,
    openAddDialog,
    closeAddDialog,
    handleCreateRocket,
  };
}
