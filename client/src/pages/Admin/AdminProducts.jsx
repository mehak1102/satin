import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Retry } from "../../components/admin/Retry";
import { apiErrorMessage, inputClass } from "../../components/form/Field";
import { api } from "../../services/api";
import { Title } from "../../components/motion/Title";

export function AdminProducts() {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const products = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => (await api.get("/admin/products")).data.products,
  });

  const save = useMutation({
    mutationFn: async (product) =>
      (
        await api.patch(`/admin/products/${product._id}`, {
          stock: Number(product.stock),
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice === "" || product.compareAtPrice == null ? null : Number(product.compareAtPrice),
          lowStockThreshold: Number(product.lowStockThreshold),
          active: product.active,
          featured: product.featured,
        })
      ).data.product,
    onSuccess: () => {
      setError("");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: (err) => setError(apiErrorMessage(err, "Could not save that product.")),
  });

  if (products.isLoading) return <p className="text-ink-soft">Loading products…</p>;
  if (products.isError) {
    return (
      <div className="space-y-4">
        <Link to="/admin/products/new" className="inline-block rounded-full bg-ink px-5 py-2.5 text-sm text-paper">
          New pack
        </Link>
        <Retry message="Products could not be loaded." onRetry={() => products.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link to="/admin/products/new" className="inline-block rounded-full bg-ink px-5 py-2.5 text-sm text-paper">
        New pack
      </Link>
      <p className="text-sm text-ink-soft">A new pack stays off the shop until you turn Active on. Turn Active off to hide one. Delete is only available when the pack is not on an order.</p>
      {error && <p className="text-sm text-rose">{error}</p>}
      {products.data.map((product) => (
        <ProductRow key={product._id} product={product} onSave={(next) => save.mutate(next)} saving={save.isPending} />
      ))}
    </div>
  );
}

function ProductRow({ product, onSave, saving }) {
  const [draft, setDraft] = useState(product);

  function setField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="grid items-end gap-3 rounded-[1.5rem] bg-paper p-4 md:grid-cols-[1.4fr_repeat(4,0.6fr)_auto_auto_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <div>
        <p className="font-display text-2xl text-ink">{draft.name}</p>
        <p className="text-xs text-ink-soft">{draft.sku}</p>
        <Link to={`/admin/products/${product._id}`} className="mt-1 inline-block text-sm underline">
          Details
        </Link>
      </div>
      <label className="text-xs text-ink-soft">
        Price ₹
        <input className={inputClass} type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setField("price", event.target.value)} />
      </label>
      <label className="text-xs text-ink-soft">
        Compare at ₹
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={draft.compareAtPrice ?? ""}
          onChange={(event) => setField("compareAtPrice", event.target.value)}
        />
      </label>
      <label className="text-xs text-ink-soft">
        Stock
        <input className={inputClass} type="number" min="0" step="1" value={draft.stock} onChange={(event) => setField("stock", event.target.value)} />
      </label>
      <label className="text-xs text-ink-soft">
        Low at
        <input
          className={inputClass}
          type="number"
          min="0"
          step="1"
          value={draft.lowStockThreshold}
          onChange={(event) => setField("lowStockThreshold", event.target.value)}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={draft.active} onChange={(event) => setField("active", event.target.checked)} />
        Active
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={draft.featured} onChange={(event) => setField("featured", event.target.checked)} />
        Featured
      </label>
      <button type="submit" disabled={saving} className="rounded-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-40">
        Save
      </button>
    </form>
  );
}

export function AdminProduct() {
  const { id } = useParams();
  const product = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: async () => (await api.get(`/admin/products/${id}`)).data.product,
  });

  if (product.isLoading) return <p className="text-ink-soft">Loading product…</p>;
  if (product.isError) return <p className="text-rose">{apiErrorMessage(product.error, "Product not found.")}</p>;

  return <ProductEditor product={product.data} />;
}

export function AdminProductNew() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const create = useMutation({
    mutationFn: async (payload) => (await api.post("/admin/products", payload)).data.product,
    onSuccess: (product) => navigate(`/admin/products/${product._id}`, { replace: true }),
    onError: (err) => setError(apiErrorMessage(err, "That pack could not be created.")),
  });

  function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const packSize = String(form.get("packSize") || "").trim();
    create.mutate({
      name: String(form.get("name") || ""),
      sku: String(form.get("sku") || ""),
      price: Number(form.get("price")),
      category: String(form.get("category") || ""),
      size: String(form.get("size") || ""),
      packSize: packSize === "" ? null : Number(packSize),
      stock: Number(form.get("stock") || 0),
      shortDescription: String(form.get("shortDescription") || ""),
      description: String(form.get("description") || ""),
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-4" noValidate>
      <div>
        <Link to="/admin/products" className="text-sm underline">
          All products
        </Link>
        <Title as="h2" className="mt-3 font-display text-4xl text-ink">New pack</Title>
        <p className="mt-2 text-sm text-ink-soft">Enter only details you have. Nothing is filled in for you. Stock starts at 0 until you set it.</p>
      </div>
      <label className="text-sm">
        Name
        <input name="name" required className={inputClass} />
      </label>
      <label className="text-sm">
        SKU
        <input name="sku" required className={inputClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Price ₹
          <input name="price" type="number" min="0" step="0.01" required className={inputClass} />
        </label>
        <label className="text-sm">
          Stock
          <input name="stock" type="number" min="0" step="1" defaultValue="0" className={inputClass} />
        </label>
      </div>
      <label className="text-sm">
        Category
        <input name="category" required className={inputClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Size
          <input name="size" className={inputClass} />
        </label>
        <label className="text-sm">
          Pads in pack
          <input name="packSize" type="number" min="1" step="1" className={inputClass} />
        </label>
      </div>
      <label className="text-sm">
        Short description
        <input name="shortDescription" className={inputClass} />
      </label>
      <label className="text-sm">
        Description
        <textarea name="description" rows={4} className={inputClass} />
      </label>
      {error && <p className="text-sm text-rose">{error}</p>}
      <button type="submit" disabled={create.isPending} className="w-fit rounded-full bg-ink px-5 py-2.5 text-sm text-paper disabled:opacity-40">
        {create.isPending ? "Saving…" : "Create pack"}
      </button>
    </form>
  );
}

function ProductEditor({ product }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({
    name: product.name || "",
    category: product.category || "",
    size: product.size || "",
    packSize: product.packSize ?? "",
    shortDescription: product.shortDescription || "",
    description: product.description || "",
    features: (product.features || []).join("\n"),
    specifications: (product.specifications || []).map((spec) => ({ label: spec.label, value: spec.value })),
  });

  function setField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function setSpec(index, key, value) {
    setDraft((current) => ({
      ...current,
      specifications: current.specifications.map((spec, specIndex) => (specIndex === index ? { ...spec, [key]: value } : spec)),
    }));
  }

  const save = useMutation({
    mutationFn: async (payload) => (await api.patch(`/admin/products/${product._id}`, payload)).data.product,
    onSuccess: (next) => {
      setError("");
      setSaved(true);
      queryClient.setQueryData(["admin", "product", product._id], next);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", next.slug] });
    },
    onError: (err) => setError(apiErrorMessage(err, "Could not save that product.")),
  });

  const remove = useMutation({
    mutationFn: async () => api.delete(`/admin/products/${product._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/admin/products", { replace: true });
    },
    onError: (err) => setError(apiErrorMessage(err, "That pack could not be deleted.")),
  });

  function onSubmit(event) {
    event.preventDefault();
    setSaved(false);
    const specifications = draft.specifications.filter((spec) => spec.label.trim() || spec.value.trim());
    if (specifications.some((spec) => !spec.label.trim() || !spec.value.trim())) {
      setError("Each specification needs a label and a value.");
      return;
    }
    const packSize = String(draft.packSize).trim();
    if (packSize !== "" && !Number.isInteger(Number(packSize))) {
      setError("Pads in pack must be a whole number.");
      return;
    }
    save.mutate({
      name: draft.name,
      category: draft.category,
      size: draft.size,
      packSize: packSize === "" ? null : Number(packSize),
      shortDescription: draft.shortDescription,
      description: draft.description,
      features: draft.features
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      specifications: specifications.map((spec) => ({ label: spec.label.trim(), value: spec.value.trim() })),
    });
  }

  return (
    <div className="grid max-w-3xl gap-8">
      <div>
        <Link to="/admin/products" className="text-sm underline">
          All products
        </Link>
        <Title as="h2" className="mt-3 font-display text-4xl text-ink">{product.name}</Title>
        <p className="mt-1 text-sm text-ink-soft">
          {product.sku} · {product.slug}
        </p>
        {product.slug && (
          <Link to={`/product/${product.slug}`} className="mt-1 inline-block text-sm underline">
            View pack
          </Link>
        )}
        <button
          type="button"
          disabled={remove.isPending}
          onClick={() => {
            if (!window.confirm("Delete this pack? A pack that is already on an order cannot be deleted.")) return;
            remove.mutate();
          }}
          className="mt-3 block text-sm text-rose underline disabled:opacity-40"
        >
          {remove.isPending ? "Deleting…" : "Delete pack"}
        </button>
      </div>
      <ProductImageForm product={product} />
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {product.dataNotes ? (
        <p className="rounded-[1.5rem] bg-blush/40 p-4 text-sm leading-6 text-ink-soft">Pack note, not shown on the shop: {product.dataNotes}</p>
      ) : null}
      <label className="text-sm">
        Name
        <input className={inputClass} value={draft.name} onChange={(event) => setField("name", event.target.value)} />
      </label>
      <label className="text-sm">
        Category
        <input className={inputClass} value={draft.category} onChange={(event) => setField("category", event.target.value)} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Size
          <input className={inputClass} value={draft.size} onChange={(event) => setField("size", event.target.value)} />
        </label>
        <label className="text-sm">
          Pads in pack
          <input
            className={inputClass}
            type="number"
            min="1"
            value={draft.packSize}
            onChange={(event) => setField("packSize", event.target.value)}
          />
        </label>
      </div>
      <label className="text-sm">
        Short description
        <textarea className={inputClass} rows={2} value={draft.shortDescription} onChange={(event) => setField("shortDescription", event.target.value)} />
      </label>
      <label className="text-sm">
        Description
        <textarea className={inputClass} rows={5} value={draft.description} onChange={(event) => setField("description", event.target.value)} />
      </label>
      <label className="text-sm">
        Features, one per line
        <textarea className={inputClass} rows={4} value={draft.features} onChange={(event) => setField("features", event.target.value)} />
      </label>
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm">Specifications</p>
          <button
            type="button"
            className="text-sm underline"
            onClick={() => setDraft((current) => ({ ...current, specifications: [...current.specifications, { label: "", value: "" }] }))}
          >
            Add row
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {draft.specifications.map((spec, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                aria-label={`Specification label ${index + 1}`}
                className={inputClass}
                value={spec.label}
                onChange={(event) => setSpec(index, "label", event.target.value)}
              />
              <input
                aria-label={`Specification value ${index + 1}`}
                className={inputClass}
                value={spec.value}
                onChange={(event) => setSpec(index, "value", event.target.value)}
              />
              <button
                type="button"
                className="text-sm underline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    specifications: current.specifications.filter((_, specIndex) => specIndex !== index),
                  }))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-rose">{error}</p>}
      {saved && <p className="text-sm text-teal">Saved.</p>}
      <button type="submit" disabled={save.isPending} className="w-fit rounded-full bg-ink px-5 py-2.5 text-sm text-paper disabled:opacity-40">
        {save.isPending ? "Saving…" : "Save details"}
      </button>
    </form>
    </div>
  );
}

function ProductImageForm({ product }) {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const images = product.images || [];

  function storeProduct(next) {
    queryClient.setQueryData(["admin", "product", product._id], next);
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product", next.slug] });
  }

  const upload = useMutation({
    mutationFn: async (mode) => {
      const body = new FormData();
      body.append("image", file);
      body.append("alt", alt);
      body.append("mode", mode);
      return (await api.post(`/admin/products/${product._id}/image`, body)).data.product;
    },
    onSuccess: (next, mode) => {
      setError("");
      setSaved(mode === "add" ? "Photo added." : "Main photo replaced.");
      setFile(null);
      setAlt("");
      if (inputRef.current) inputRef.current.value = "";
      storeProduct(next);
    },
    onError: (err) => setError(apiErrorMessage(err, "Could not upload that image.")),
  });

  const remove = useMutation({
    mutationFn: async (url) => (await api.delete(`/admin/products/${product._id}/image`, { data: { url } })).data.product,
    onSuccess: (next) => {
      setError("");
      setSaved("Photo removed.");
      storeProduct(next);
    },
    onError: (err) => setError(apiErrorMessage(err, "Could not remove that photo.")),
  });

  function send(mode) {
    setSaved("");
    if (!file) {
      setError("Choose an image.");
      return;
    }
    upload.mutate(mode);
  }

  return (
    <form
      className="grid gap-4 rounded-[1.5rem] bg-paper p-5"
      onSubmit={(event) => {
        event.preventDefault();
        send("replace");
      }}
    >
      <div>
        <Title as="h3" className="font-display text-2xl text-ink">Pack photos</Title>
        <p className="mt-1 text-sm text-ink-soft">
          PNG, JPEG, or WebP, up to 4 MB. Replace the main photo or add another. The shop shows every photo stored here. At least one stays.
        </p>
      </div>
      {images.length > 0 && (
        <ul className="flex flex-wrap gap-4">
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`} className="w-32">
              <img src={image.url} alt={image.alt || ""} className="h-40 w-32 rounded-xl bg-blush object-contain" />
              <p className="mt-1 text-xs text-ink-soft">{index === 0 ? "Main photo" : `Photo ${index + 1}`}</p>
              {images.length > 1 && (
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(image.url)}
                  className="mt-1 text-sm underline disabled:opacity-40"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
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
        <input className={inputClass} value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={160} />
      </label>
      {error && <p className="text-sm text-rose">{error}</p>}
      {saved && <p className="text-sm text-teal">{saved}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={upload.isPending} className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper disabled:opacity-40">
          {upload.isPending ? "Uploading…" : "Replace main photo"}
        </button>
        <button
          type="button"
          disabled={upload.isPending || images.length >= 6}
          onClick={() => send("add")}
          className="rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink disabled:opacity-40"
        >
          Add photo
        </button>
      </div>
    </form>
  );
}
