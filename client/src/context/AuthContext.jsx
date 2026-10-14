import { createContext, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: ["me"],
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        return (await api.get("/auth/me")).data.user;
      } catch (error) {
        if (error.response?.status === 401) return null;
        throw error;
      }
    },
  });

  const value = useMemo(
    () => ({
      user: me.data ?? null,
      loading: me.isLoading,
      async login(payload) {
        const { data } = await api.post("/auth/login", payload);
        queryClient.setQueryData(["me"], data.user);
        return data.user;
      },
      async register(payload) {
        const { data } = await api.post("/auth/register", payload);
        queryClient.setQueryData(["me"], data.user);
        return data.user;
      },
      async logout() {
        await api.post("/auth/logout");
        queryClient.setQueryData(["me"], null);
      },
    }),
    [me.data, me.isLoading, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
