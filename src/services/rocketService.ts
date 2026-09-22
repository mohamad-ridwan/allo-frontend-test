import { apiClient } from "./apiClient";
import type { Rocket } from "@/types/rocket";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const rocketService = {
  /**
   * Mengambil daftar roket SpaceX dengan mode detailed dan limit 20
   */
  async getRockets(): Promise<Rocket[]> {
    const data = await apiClient.get<PaginatedResponse<Rocket>>(
      "/config/launcher/",
      {
        manufacturer__name: "SpaceX",
        mode: "detailed",
        limit: 20,
      },
    );

    return data.results || [];
  },

  /**
   * Mengambil data detail satu roket berdasarkan ID
   */
  async getRocketById(id: string | number): Promise<Rocket> {
    return await apiClient.get<Rocket>(`/config/launcher/${id}/`);
  },
};
