import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { cycleSummary, localToday } from "../lib/cycle";
import { api } from "../services/api";

const LOCAL_KEY = "satin-tracker";

function readLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
    return saved && typeof saved.days === "object" && saved.days ? saved.days : {};
  } catch {
    return {};
  }
}

function writeLocal(days) {
  try {
    if (Object.keys(days).length) localStorage.setItem(LOCAL_KEY, JSON.stringify({ days }));
    else localStorage.removeItem(LOCAL_KEY);
  } catch {
    // Without storage the log only lasts for this visit.
  }
}

const toMap = (list = []) => Object.fromEntries(list.map((day) => [day.date, day.flow]));
const toList = (map) =>
  Object.entries(map)
    .map(([date, flow]) => ({ date, flow }))
    .sort((a, b) => a.date.localeCompare(b.date));

export function useTracker() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const signedIn = Boolean(auth.user);
  const remote = useQuery({
    queryKey: ["tracker"],
    enabled: signedIn,
    queryFn: async () => (await api.get("/tracker")).data,
  });
  const [localDays, setLocalDays] = useState(readLocal);
  const [error, setError] = useState("");
  const queue = useRef(Promise.resolve());
  const latest = useRef(0);

  const synced = signedIn && Boolean(remote.data?.synced);
  const days = useMemo(() => (synced ? toMap(remote.data.days) : localDays), [synced, remote.data, localDays]);
  const today = localToday();
  const summary = useMemo(() => cycleSummary(Object.keys(days), today), [days, today]);

  function saveLocal(next) {
    setLocalDays(next);
    writeLocal(next);
  }

  // Saves run one after another; only the newest reply replaces what is on screen.
  function push(body) {
    const id = ++latest.current;
    queryClient.setQueryData(["tracker"], (old) => ({ ...old, synced: true, days: body.days, reminder: body.reminder ?? old?.reminder }));
    const run = queue.current.catch(() => {}).then(() => api.put("/tracker", body));
    queue.current = run;
    return run.then(
      ({ data }) => {
        if (id === latest.current) queryClient.setQueryData(["tracker"], data);
        setError("");
        return data;
      },
      (err) => {
        setError("That change could not be saved. Check the connection and try again.");
        queryClient.invalidateQueries({ queryKey: ["tracker"] });
        throw err;
      },
    );
  }

  function setDay(date, flow) {
    const next = { ...days };
    if (flow) next[date] = flow;
    else delete next[date];
    if (synced) push({ days: toList(next) }).catch(() => {});
    else saveLocal(next);
  }

  async function syncToAccount() {
    await push({ days: toList({ ...toMap(remote.data?.days), ...localDays }) });
    saveLocal({});
  }

  async function keepOnDevice() {
    const copy = toMap(remote.data?.days);
    saveLocal(copy);
    const { data } = await api.delete("/tracker");
    queryClient.setQueryData(["tracker"], data);
  }

  async function deleteAll() {
    if (synced) {
      const { data } = await api.delete("/tracker");
      queryClient.setQueryData(["tracker"], data);
    }
    saveLocal({});
  }

  function setReminder(on) {
    return push({ days: toList(days), reminder: on });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), days: toList(days) }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `satin-tracker-${today}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return {
    ready: !auth.loading && (!signedIn || !remote.isLoading),
    loadError: signedIn && remote.isError,
    retry: () => remote.refetch(),
    signedIn,
    synced,
    days,
    summary,
    today,
    reminder: Boolean(remote.data?.reminder),
    emailReady: Boolean(remote.data?.emailReady),
    hasLocal: Object.keys(localDays).length > 0,
    error,
    setDay,
    syncToAccount,
    keepOnDevice,
    deleteAll,
    setReminder,
    exportData,
  };
}
