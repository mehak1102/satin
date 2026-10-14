import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Retry } from "../../components/admin/Retry";
import { apiErrorMessage } from "../../components/form/Field";
import { api } from "../../services/api";

const statuses = ["new", "read", "resolved"];

export function AdminMessages() {
  const queryClient = useQueryClient();
  const messages = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => (await api.get("/admin/messages")).data.messages,
  });

  const update = useMutation({
    mutationFn: async ({ id, status }) => (await api.patch(`/admin/messages/${id}`, { status })).data.message,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "messages"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  if (messages.isLoading) return <p className="text-ink-soft">Loading messages…</p>;
  if (messages.isError) return <Retry message="Messages could not be loaded." onRetry={() => messages.refetch()} />;
  if (messages.data.length === 0) return <p className="text-ink-soft">No messages yet.</p>;

  return (
    <ul className="space-y-4">
      {messages.data.map((message) => (
        <li key={message._id} className="rounded-[1.5rem] bg-paper p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl text-ink">{message.subject}</p>
              <p className="text-sm text-ink-soft">
                {message.name} · {message.email}
                {message.phone ? ` · ${message.phone}` : ""}
              </p>
            </div>
            <select
              aria-label={`Status for ${message.subject}`}
              value={message.status}
              onChange={(event) => update.mutate({ id: message._id, status: event.target.value })}
              className="rounded-full border border-line bg-ivory px-3 py-2 text-sm"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{message.message}</p>
        </li>
      ))}
      {update.isError && <p className="text-sm text-rose">{apiErrorMessage(update.error, "Could not update that message.")}</p>}
    </ul>
  );
}
