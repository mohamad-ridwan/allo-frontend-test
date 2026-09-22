import { ref, reactive } from "vue";
import type { Rocket } from "@/types/rocket";

export function useRocketForm(
  emitSubmit: (payload: Omit<Rocket, "id" | "isLocal">) => void,
  onClose?: () => void,
) {
  const isFormValid = ref(false);
  const countryCodeInput = ref("USA");

  const form = reactive({
    full_name: "",
    description: "",
    image_url: "",
    launch_cost: "",
    maiden_flight: "",
  });

  function resetForm() {
    form.full_name = "";
    form.description = "";
    form.image_url = "";
    form.launch_cost = "";
    form.maiden_flight = "";
    countryCodeInput.value = "USA";
    isFormValid.value = false;
  }

  function handleSubmit() {
    if (!form.full_name) return;

    emitSubmit({
      full_name: form.full_name,
      description: form.description || null,
      image_url: form.image_url || null,
      launch_cost: form.launch_cost || null,
      maiden_flight: form.maiden_flight || null,
      manufacturer: {
        name: "SpaceX",
        country_code: countryCodeInput.value || null,
      },
    });

    resetForm();
    onClose?.();
  }

  return {
    form,
    countryCodeInput,
    isFormValid,
    resetForm,
    handleSubmit,
  };
}
