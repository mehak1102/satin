import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useWishlist() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: ["wishlist"],
    enabled: Boolean(auth.user),
    queryFn: async () => (await api.get("/wishlist")).data.items,
  });

  const toggle = useMutation({
    mutationFn: async (productId) => {
      const saved = (list.data || []).some((item) => item._id === productId);
      if (saved) await api.delete(`/wishlist/${productId}`);
      else await api.post(`/wishlist/${productId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  return {
    items: list.data || [],
    count: list.data?.length || 0,
    loading: list.isLoading,
    error: list.isError,
    refetch: () => list.refetch(),
    has(productId) {
      return (list.data || []).some((item) => item._id === productId);
    },
    toggle: toggle.mutateAsync,
    pending: toggle.isPending,
  };
}
