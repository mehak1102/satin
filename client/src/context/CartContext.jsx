import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";

const CartContext = createContext(null);
const STORAGE_KEY = "satin-cart";
const OWNER_KEY = "satin-cart-owner";

function readLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function mergeCarts(localItems, accountItems) {
  const map = new Map();
  for (const item of [...accountItems, ...localItems]) {
    if (!item?.id) continue;
    const stock = Number(item.stock) || 0;
    const previous = map.get(item.id);
    const quantity = Math.min(stock, 20, (previous?.quantity || 0) + Number(item.quantity || 0));
    if (quantity < 1) continue;
    map.set(item.id, { ...(previous || item), ...item, quantity });
  }
  return [...map.values()];
}

export function CartProvider({ children }) {
  const auth = useAuth();
  const [items, setItems] = useState(readLocalCart);
  const [hydrated, setHydrated] = useState(false);
  const [note, setNote] = useState("");
  const [catalogTick, setCatalogTick] = useState(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((value) => !value), []);
  const previousUser = useRef(undefined);
  const syncing = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (auth.loading) return undefined;
    const userId = auth.user?._id || null;
    const previous = previousUser.current;
    previousUser.current = userId;
    let cancelled = false;

    if (!userId) {
      if (previous) {
        setItems([]);
        localStorage.removeItem(OWNER_KEY);
      }
      setHydrated(true);
      setCatalogTick((value) => value + 1);
      return undefined;
    }

    async function sync() {
      syncing.current = true;
      try {
        const remote = await api.get("/cart");
        if (cancelled) return;
        const accountItems = remote.data.items || [];
        const owner = localStorage.getItem(OWNER_KEY);
        if (owner === userId) {
          setItems(accountItems);
          return;
        }
        const merged = mergeCarts(readLocalCart(), accountItems);
        const saved = await api.put("/cart", {
          items: merged.map((item) => ({ productId: item.id, quantity: item.quantity })),
        });
        if (cancelled) return;
        setItems(saved.data.items || []);
        localStorage.setItem(OWNER_KEY, userId);
      } catch {
        /* keep the bag already on this browser */
      } finally {
        syncing.current = false;
        if (!cancelled) {
          setHydrated(true);
          setCatalogTick((value) => value + 1);
        }
      }
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, [auth.loading, auth.user?._id]);

  useEffect(() => {
    if (!hydrated || !catalogTick) return undefined;
    const current = itemsRef.current;
    if (!current.length) return undefined;
    const requested = current.map((item) => String(item.id)).join("|");
    let cancelled = false;

    api
      .post("/products/availability", { ids: current.map((item) => item.id) })
      .then(({ data }) => {
        if (cancelled) return;
        const now = itemsRef.current;
        if (now.map((item) => String(item.id)).join("|") !== requested) return;
        const live = new Map((data.items || []).map((item) => [String(item.id), item]));
        const removed = [];
        const adjusted = [];
        let priceChanged = false;
        const next = [];
        for (const line of now) {
          const product = live.get(String(line.id));
          if (!product || product.stock < 1) {
            removed.push(line.name);
            continue;
          }
          const quantity = Math.min(line.quantity, product.stock, 20);
          if (quantity !== line.quantity) adjusted.push(line.name);
          if (product.price !== line.price) priceChanged = true;
          next.push({
            ...line,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: product.image || "",
            stock: product.stock,
            quantity,
            packSize: product.packSize ?? line.packSize,
            category: product.category ?? line.category,
            size: product.size ?? line.size,
            specifications: product.specifications ?? line.specifications,
          });
        }
        const parts = [];
        if (removed.length === 1) parts.push(`${removed[0]} is no longer available and was taken out of the cart.`);
        if (removed.length > 1) parts.push(`${removed.join(", ")} are no longer available and were taken out of the cart.`);
        if (adjusted.length) parts.push("Quantity was lowered to the stock now available.");
        if (priceChanged) parts.push("Prices were updated from the current packs.");
        if (parts.length) setNote(parts.join(" "));
        if (removed.length || adjusted.length || priceChanged) setItems(next);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [hydrated, catalogTick]);

  useEffect(() => {
    if (!hydrated || !auth.user || syncing.current) return undefined;
    const timer = setTimeout(() => {
      api
        .put("/cart", {
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [items, hydrated, auth.user?._id]);

  const cart = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addItem(product, quantity = 1) {
        const existing = items.find((item) => item.id === product._id);
        const nextQty = Math.min(product.stock, 20, (existing?.quantity || 0) + quantity);
        if (nextQty < 1) return { added: false };
        const added = !existing || existing.quantity !== nextQty;
        setDrawerOpen(true);
        setItems((current) => {
          const currentItem = current.find((item) => item.id === product._id);
          const quantityNow = Math.min(product.stock, 20, (currentItem?.quantity || 0) + quantity);
          if (quantityNow < 1) return current;
          if (currentItem) {
            return current.map((item) =>
              item.id === product._id ? { ...item, quantity: quantityNow, stock: product.stock, price: product.price } : item,
            );
          }
          return [
            ...current,
            {
              id: product._id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images?.[0]?.url || "",
              stock: product.stock,
              quantity: Math.min(product.stock, 20, quantity),
              packSize: product.packSize,
              category: product.category,
              size: product.size,
              specifications: product.specifications,
            },
          ];
        });
        return { added };
      },
      setQuantity(id, quantity) {
        setItems((current) =>
          current
            .map((item) =>
              item.id === id ? { ...item, quantity: Math.min(item.stock, 20, Math.max(1, quantity)) } : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      removeItem(id) {
        setItems((current) => current.filter((item) => item.id !== id));
      },
      clear() {
        setItems([]);
      },
      note,
      drawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [items, note, drawerOpen, openDrawer, closeDrawer, toggleDrawer],
  );

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
