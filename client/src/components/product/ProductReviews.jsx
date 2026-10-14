import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage, inputClass } from "../form/Field";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Title } from "../motion/Title";

function Stars({ value }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((score) => (
        <Star key={score} size={16} className={score <= value ? "fill-rose text-rose" : "text-line"} />
      ))}
    </span>
  );
}

export function ProductReviews({ productId, slug }) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");
  const reviews = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => (await api.get(`/reviews/${productId}`)).data.reviews,
  });
  const mine = useQuery({
    queryKey: ["review-mine", productId],
    enabled: Boolean(auth.user),
    queryFn: async () => (await api.get(`/reviews/mine/${productId}`)).data,
  });
  const save = useMutation({
    mutationFn: async (body) => (await api.post("/reviews", body)).data.review,
    onSuccess: () => {
      setError("");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["review-mine", productId] });
    },
    onError: (err) => setError(apiErrorMessage(err, "The note could not be saved.")),
  });

  function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    save.mutate({
      productId,
      rating,
      title: String(form.get("title") || ""),
      comment: String(form.get("comment") || ""),
    });
  }

  const own = mine.data?.review;

  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <Title as="h2" className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none font-medium text-ink">Notes from buyers</Title>
      {reviews.isLoading && <p className="mt-4 text-ink-soft">Loading notes…</p>}
      {reviews.isError && (
        <p className="mt-4 text-plum">
          Notes could not be loaded.{" "}
          <button type="button" className="underline" onClick={() => reviews.refetch()}>
            Try again
          </button>
        </p>
      )}
      {reviews.data?.length === 0 && <p className="mt-6 rounded-[24px] border border-dashed border-line bg-white/50 px-6 py-8 text-ink-soft">No published notes yet.</p>}
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {(reviews.data || []).map((review) => (
          <li key={review.id} className="rounded-[24px] border border-line bg-white/60 p-6">
            <Stars value={review.rating} />
            <p className="mt-2 text-sm text-ink">{review.name}</p>
            {review.title && <p className="mt-2 font-display text-2xl text-ink">{review.title}</p>}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{review.comment}</p>
          </li>
        ))}
      </ul>

      {!auth.user && (
        <p className="mt-8 text-sm text-ink-soft">
          <Link to={`/account?next=/product/${slug}`} className="underline">
            Sign in
          </Link>{" "}
          to write about a pack you have bought.
        </p>
      )}

      {auth.user && mine.data && !mine.data.canReview && !own && (
        <p className="mt-8 text-sm text-ink-soft">A note can be added after a paid order of this pack.</p>
      )}

      {own && !own.approved && <p className="mt-8 text-sm text-ink-soft">Your note is waiting to be published.</p>}

      {auth.user && mine.data?.canReview && !own && (
        <form onSubmit={onSubmit} className="mt-8 grid max-w-xl gap-4">
          <fieldset>
            <legend className="text-sm">Rating</legend>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  aria-label={`${score} out of 5`}
                  aria-pressed={rating === score}
                  onClick={() => setRating(score)}
                  className="rounded-full p-1"
                >
                  <Star size={20} className={score <= rating ? "fill-rose text-rose" : "text-line"} />
                </button>
              ))}
            </div>
          </fieldset>
          <label className="text-sm">
            Title
            <input name="title" maxLength={120} className={inputClass} />
          </label>
          <label className="text-sm">
            Note
            <textarea name="comment" required minLength={10} maxLength={2000} rows={4} className={inputClass} />
          </label>
          {error && <p className="text-sm text-rose">{error}</p>}
          <button type="submit" disabled={save.isPending} className="w-fit rounded-full bg-ink px-6 py-3 text-sm text-paper disabled:opacity-40">
            {save.isPending ? "Saving…" : "Submit note"}
          </button>
        </form>
      )}
    </section>
  );
}
