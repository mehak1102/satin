import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export function useSettings() {
  return useQuery({
    queryKey: ["store-settings"],
    staleTime: 60_000,
    queryFn: async () => (await api.get("/content/settings")).data.settings,
  });
}
