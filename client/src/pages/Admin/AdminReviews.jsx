import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Retry } from "../../components/admin/Retry";
import { apiErrorMessage } from "../../components/form/Field";
import { api } from "../../services/api";

export function AdminReviews() {
  const queryClient = useQueryClient();
  const reviews = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => (await api.get("/admin/reviews")).data.reviews,
  });
  const update = useMutation({
    mutationFn: async ({ id, approved }) => (await api.patch(`/admin/reviews/${id}`, { approved })).data.review,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
  const remove = useMutation({
    mutationFn: async (id) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });

  if (reviews.isLoading) return <p className="text-ink-soft">Loading reviews…</p>;
  if (reviews.isError) return <Retry message="Reviews could not be loaded." onRetry={() => reviews.refetch()} />;
  if (reviews.data.length === 0) return <p className="text-ink-soft">No reviews yet.</p>;

  return (
    <ul className="space-y-4">
      {reviews.data.map((review) => (
        <li key={review.id} className="rounded-[1.5rem] bg-paper p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl text-ink">{review.title || "Review"}</p>
              <p className="text-sm text-ink-soft">
                {review.name} · {review.rating} out of 5
                {review.product ? ` · ${review.product.name}` : ""}
              </p>
            </div>
            <p className="text-sm text-ink">{review.approved ? "Published" : "Waiting"}</p>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{review.comment}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => update.mutate({ id: review.id, approved: !review.approved })}
              className="rounded-full bg-ink px-4 py-2 text-sm text-paper"
            >
              {review.approved ? "Reject" : "Approve"}
            </button>
            {review.product?.slug && (
              <Link to={`/product/${review.product.slug}`} className="text-sm underline">
                View pack
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this review?")) remove.mutate(review.id);
              }}
              className="text-sm underline"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
      {(update.isError || remove.isError) && (
        <p className="text-sm text-rose">{apiErrorMessage(update.error || remove.error, "That review could not be updated.")}</p>
      )}
    </ul>
  );
}
