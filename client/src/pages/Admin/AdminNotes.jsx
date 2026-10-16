import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Retry } from "../../components/admin/Retry";
import { apiErrorMessage, inputClass } from "../../components/form/Field";
import { periodBasicsTopics } from "../../content/periodBasics";
import { api } from "../../services/api";
import { Title } from "../../components/motion/Title";

const noteCategories = ["Journal", ...periodBasicsTopics];


export function AdminNotes() {
  const notes = useQuery({
    queryKey: ["admin", "notes"],
    queryFn: async () => (await api.get("/admin/notes")).data.notes,
  });

  if (notes.isLoading) return <p className="text-ink-soft">Loading notes…</p>;
  if (notes.isError) return <Retry message="Notes could not be loaded." onRetry={() => notes.refetch()} />;

  return (
    <div>
      <Link to="/admin/notes/new" className="inline-block rounded-full bg-ink px-5 py-2.5 text-sm text-paper">
        New note
      </Link>
      {notes.data.length === 0 && <p className="mt-6 text-ink-soft">No notes yet. Drafts stay off the journal until you publish them.</p>}
      <ul className="mt-6 divide-y divide-line">
        {notes.data.map((note) => (
          <li key={note._id} className="flex items-baseline justify-between gap-4 py-4">
            <div>
              <Link to={`/admin/notes/${note._id}`} className="font-display text-2xl text-ink">
                {note.title}
              </Link>
              <p className="text-sm text-ink-soft">{note.published ? "Published" : "Draft"}</p>
            </div>
            {note.published && (
              <Link to={`/blogs/${note.slug}`} className="text-sm underline">
                View
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminNoteEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const note = useQuery({
    queryKey: ["admin", "note", id],
    enabled: !isNew,
    queryFn: async () => (await api.get(`/admin/notes/${id}`)).data.note,
  });

  const save = useMutation({
    mutationFn: async (body) => {
      if (isNew) return (await api.post("/admin/notes", body)).data.note;
      return (await api.patch(`/admin/notes/${id}`, body)).data.note;
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notes"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", saved.slug] });
      navigate(`/admin/notes/${saved._id}`, { replace: true });
    },
    onError: (err) => setError(apiErrorMessage(err, "The note could not be saved.")),
  });

  const remove = useMutation({
    mutationFn: async () => api.delete(`/admin/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notes"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      navigate("/admin/notes");
    },
    onError: (err) => setError(apiErrorMessage(err, "The note could not be deleted.")),
  });

  const current = note.data;
  const [coverUrl, setCoverUrl] = useState(current?.coverImage?.url || "");
  const [coverAlt, setCoverAlt] = useState(current?.coverImage?.alt || "");

  useEffect(() => {
    setCoverUrl(current?.coverImage?.url || "");
    setCoverAlt(current?.coverImage?.alt || "");
  }, [current?._id]);

  if (!isNew && note.isLoading) return <p className="text-ink-soft">Loading note…</p>;
  if (!isNew && note.isError) return <p className="text-rose">{apiErrorMessage(note.error, "Note not found.")}</p>;

  function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const tags = String(form.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setError("");
    save.mutate({
      title: String(form.get("title") || ""),
      slug: String(form.get("slug") || ""),
      excerpt: String(form.get("excerpt") || ""),
      content: String(form.get("content") || ""),
      category: String(form.get("category") || "Journal"),
      tags,
      coverUrl,
      coverAlt,
      featured: form.get("featured") === "on",
      published: form.get("published") === "on",
    });
  }

  return (
    <div className="grid max-w-3xl gap-8">
    <form onSubmit={onSubmit} className="grid gap-4" key={current?._id || "new"}>
      <Link to="/admin/notes" className="text-sm underline">
        All notes
      </Link>
      <label className="text-sm">
        Title
        <input name="title" required defaultValue={current?.title || ""} className={inputClass} />
      </label>
      <label className="text-sm">
        Slug
        <input name="slug" defaultValue={current?.slug || ""} placeholder="Leave blank to use the title" className={inputClass} />
      </label>
      <label className="text-sm">
        Category
        <select name="category" defaultValue={current?.category || "Journal"} className={inputClass}>
          {[...new Set([...noteCategories, current?.category].filter(Boolean))].map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Excerpt
        <textarea name="excerpt" rows={2} defaultValue={current?.excerpt || ""} className={inputClass} />
      </label>
      <label className="text-sm">
        Note
        <textarea name="content" rows={12} defaultValue={current?.content || ""} className={inputClass} />
      </label>
      <label className="text-sm">
        Tags
        <input name="tags" defaultValue={(current?.tags || []).join(", ")} placeholder="Comma separated" className={inputClass} />
      </label>
      <label className="text-sm">
        Cover image URL
        <input name="coverUrl" value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} className={inputClass} />
      </label>
      <label className="text-sm">
        Cover alt text
        <input name="coverAlt" value={coverAlt} onChange={(event) => setCoverAlt(event.target.value)} className={inputClass} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="featured" type="checkbox" defaultChecked={Boolean(current?.featured)} />
        Featured
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="published" type="checkbox" defaultChecked={Boolean(current?.published)} />
        Published on the journal
      </label>
      {error && <p className="text-sm text-rose">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={save.isPending} className="rounded-full bg-ink px-6 py-3 text-sm text-paper disabled:opacity-40">
          {save.isPending ? "Saving…" : "Save note"}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Delete this note?")) remove.mutate();
            }}
            className="text-sm underline"
          >
            Delete
          </button>
        )}
      </div>
    </form>
    {current?._id ? (
      <NoteCoverForm
        note={current}
        alt={coverAlt}
        onAlt={setCoverAlt}
        onUploaded={(saved) => {
          setCoverUrl(saved.coverImage?.url || "");
          setCoverAlt(saved.coverImage?.alt || "");
          queryClient.setQueryData(["admin", "note", saved._id], saved);
          queryClient.invalidateQueries({ queryKey: ["blogs"] });
          queryClient.invalidateQueries({ queryKey: ["blog", saved.slug] });
        }}
      />
    ) : (
      <p className="text-sm text-ink-soft">Save the note, then upload a cover image.</p>
    )}
    </div>
  );
}

function NoteCoverForm({ note, alt, onAlt, onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const upload = useMutation({
    mutationFn: async () => {
      const body = new FormData();
      body.append("image", file);
      body.append("alt", alt);
      return (await api.post(`/admin/notes/${note._id}/cover`, body)).data.note;
    },
    onSuccess: (next) => {
      setError("");
      setSaved(true);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded(next);
    },
    onError: (err) => setError(apiErrorMessage(err, "Could not upload that cover.")),
  });

  return (
    <form
      className="grid gap-4 rounded-[1.5rem] bg-paper p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(false);
        if (!file) {
          setError("Choose an image.");
          return;
        }
        upload.mutate();
      }}
    >
      <div>
        <Title as="h3" className="font-display text-2xl text-ink">Cover photo</Title>
        <p className="mt-1 text-sm text-ink-soft">PNG, JPEG, or WebP, up to 4 MB. This replaces the current cover.</p>
      </div>
      {note.coverImage?.url ? (
        <img src={note.coverImage.url} alt={note.coverImage.alt || ""} className="h-40 w-full object-contain" />
      ) : null}
      <label className="text-sm">
        Image
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="mt-1 block w-full text-sm"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
      </label>
      <label className="text-sm">
        Alt text
        <input className={inputClass} value={alt} onChange={(event) => onAlt(event.target.value)} maxLength={160} />
      </label>
      {error && <p className="text-sm text-rose">{error}</p>}
      {saved && <p className="text-sm text-teal">Cover updated.</p>}
      <button type="submit" disabled={upload.isPending} className="w-fit rounded-full bg-ink px-5 py-2.5 text-sm text-paper disabled:opacity-40">
        {upload.isPending ? "Uploading…" : "Upload cover"}
      </button>
    </form>
  );
}
