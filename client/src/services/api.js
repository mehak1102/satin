import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const SESSION_HINT = "satin-session";
const signedInRoutes = ["/auth/login", "/auth/register", "/auth/reset-password", "/auth/refresh"];
const noRetryRoutes = [...signedInRoutes, "/auth/logout", "/auth/forgot-password"];
let refreshing = null;

function hasSession() {
  try {
    return localStorage.getItem(SESSION_HINT) === "1";
  } catch {
    return false;
  }
}

function setSession(on) {
  try {
    if (on) localStorage.setItem(SESSION_HINT, "1");
    else localStorage.removeItem(SESSION_HINT);
  } catch {
    // Storage can be unavailable in private browsing; refresh is then skipped.
  }
}

api.interceptors.response.use(
  (response) => {
    const url = response.config.url || "";
    if (url.startsWith("/auth/me") || signedInRoutes.some((route) => url.startsWith(route))) setSession(true);
    if (url.startsWith("/auth/logout")) setSession(false);
    return response;
  },
  async (error) => {
    const { config, response } = error;
    const url = config?.url || "";
    if (response?.status !== 401 || !config || config._retried || noRetryRoutes.some((route) => url.startsWith(route)) || !hasSession()) {
      throw error;
    }
    config._retried = true;
    refreshing ??= api.post("/auth/refresh").finally(() => {
      refreshing = null;
    });
    try {
      await refreshing;
    } catch {
      setSession(false);
      throw error;
    }
    return api(config);
  },
);

export function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}
