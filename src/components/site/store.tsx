"use client";
/* Site-wide state: the customer's cart (saved in localStorage), live dish availability from the
   server, toasts, the cart drawer and dialogs. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { dishById, menu } from "@/lib/data";
import { computeTotals, type DishOptions, type OrderMode } from "@/lib/pricing";
import { api, storage } from "@/lib/client";

export type CartLine = { key: string; id: string; qty: number; opts: DishOptions | null };
export type CartState = { items: CartLine[]; coupon: string | null; mode: OrderMode; pincode: string; when: string; note: string };
export type LastOrder = { id: string; token: string; mode: OrderMode; done: boolean } | null;

export type DialogState =
  | null
  | { kind: "dish"; id: string }
  | { kind: "checkout" }
  | { kind: "track"; id: string; token: string; mode: OrderMode; fresh?: boolean }
  | { kind: "custom"; label: string; wide?: boolean; render: () => ReactNode };

export type Toast = { id: number; msg: string; error?: boolean; action?: string; onAction?: () => void };

const EMPTY_CART: CartState = { items: [], coupon: null, mode: "delivery", pincode: "", when: "asap", note: "" };
const CART_KEY = "es-cart-v2";
const LAST_ORDER_KEY = "es-last-order";

/* ------------------------------------------------------------------ UI context */
type UI = {
  toast: (msg: string, o?: Omit<Toast, "id" | "msg"> & { duration?: number }) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  dialog: DialogState;
  openDialog: (d: DialogState) => void;
  closeDialog: () => void;
};
const UIContext = createContext<UI | null>(null);
export const useUI = () => {
  const c = useContext(UIContext);
  if (!c) throw new Error("useUI must be used inside <SiteProviders>");
  return c;
};

/* ------------------------------------------------------------------ shop context */
type Shop = {
  hydrated: boolean;
  cart: CartState;
  soldOut: Set<string>;
  isSoldOut: (id: string) => boolean;
  qtyOf: (id: string) => number;
  count: number;
  totals: ReturnType<typeof computeTotals>;
  addToCart: (id: string, qty?: number, opts?: DishOptions | null, silent?: boolean) => void;
  changeQty: (key: string, delta: number) => void;
  changeQtyById: (id: string, delta: number) => void;
  update: (patch: Partial<CartState>) => void;
  clearCart: () => void;
  lastOrder: LastOrder;
  setLastOrder: (o: LastOrder) => void;
};
const ShopContext = createContext<Shop | null>(null);
export const useShop = () => {
  const c = useContext(ShopContext);
  if (!c) throw new Error("useShop must be used inside <SiteProviders>");
  return c;
};

export function SiteProviders({ children }: { children: ReactNode }) {
  /* ---------------- UI */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback<UI["toast"]>((msg, o = {}) => {
    const id = ++toastId.current;
    const { duration = 3600, ...rest } = o;
    setToasts((t) => [...t.slice(-2), { id, msg, ...rest }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);
  const [cartOpen, setCartOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openDialog = useCallback((d: DialogState) => {
    setCartOpen(false);
    setDialog(d);
  }, []);
  const closeDialog = useCallback(() => setDialog(null), []);

  /* ---------------- cart (hydrated from localStorage after mount) */
  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [hydrated, setHydrated] = useState(false);
  const [soldOut, setSoldOut] = useState<Set<string>>(() => new Set(menuDefaultsSoldOut()));
  const [lastOrder, setLastOrderState] = useState<LastOrder>(null);

  useEffect(() => {
    // Restoring browser-only state after hydration (localStorage isn't available during server rendering).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart({ ...EMPTY_CART, ...storage.get<Partial<CartState>>(CART_KEY, {}) });
    setLastOrderState(storage.get<LastOrder>(LAST_ORDER_KEY, null));
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setCart({ ...EMPTY_CART, ...storage.get<Partial<CartState>>(CART_KEY, {}) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    if (hydrated) storage.set(CART_KEY, cart);
  }, [cart, hydrated]);

  // Live availability: the manager can switch dishes off from the dashboard.
  useEffect(() => {
    let alive = true;
    api<{ soldOut: string[] }>("GET", "/api/availability")
      .then((r) => alive && setSoldOut(new Set(r.soldOut)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  // Drop anything in a saved cart that has since sold out.
  useEffect(() => {
    if (!hydrated) return;
    const gone = cart.items.filter((i) => soldOut.has(i.id) || !dishById(i.id));
    if (gone.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart((c) => ({ ...c, items: c.items.filter((i) => !gone.includes(i)) }));
      toast(`${gone.map((g) => dishById(g.id)?.name ?? "An item").join(", ")} sold out and was removed from your order`, { error: true });
    }
  }, [soldOut, hydrated, cart.items, toast]);

  const isSoldOut = useCallback((id: string) => soldOut.has(id), [soldOut]);
  const qtyOf = useCallback((id: string) => cart.items.filter((i) => i.id === id).reduce((a, i) => a + i.qty, 0), [cart.items]);
  const count = cart.items.reduce((a, i) => a + i.qty, 0);
  const totals = useMemo(() => computeTotals(cart.items, cart.coupon, cart.mode), [cart.items, cart.coupon, cart.mode]);

  const addToCart = useCallback<Shop["addToCart"]>(
    (id, qty = 1, opts = null, silent = false) => {
      const dish = dishById(id);
      if (!dish || soldOut.has(id)) return;
      const key = id + (opts ? "|" + JSON.stringify(opts) : "");
      setCart((c) => {
        const ex = c.items.find((i) => i.key === key);
        const items = ex ? c.items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i)) : [...c.items, { key, id, qty, opts }];
        return { ...c, items };
      });
      if (!silent) toast(`${dish.name} added`, { action: "View order", onAction: () => setCartOpen(true) });
    },
    [soldOut, toast],
  );

  const changeQty = useCallback<Shop["changeQty"]>(
    (key, delta) => {
      setCart((c) => {
        const idx = c.items.findIndex((i) => i.key === key);
        if (idx < 0) return c;
        const line = c.items[idx];
        const qty = line.qty + delta;
        if (qty <= 0) {
          const name = dishById(line.id)?.name ?? "Item";
          setTimeout(() =>
            toast(`${name} removed`, {
              action: "Undo",
              onAction: () => setCart((cc) => ({ ...cc, items: [...cc.items.slice(0, idx), { ...line, qty: 1 }, ...cc.items.slice(idx)] })),
            }),
          );
          return { ...c, items: c.items.filter((_, i) => i !== idx) };
        }
        return { ...c, items: c.items.map((i, n) => (n === idx ? { ...i, qty } : i)) };
      });
    },
    [toast],
  );

  const changeQtyById = useCallback<Shop["changeQtyById"]>(
    (id, delta) => {
      const line = [...cart.items].reverse().find((i) => i.id === id);
      if (line) changeQty(line.key, delta);
      else if (delta > 0) addToCart(id, 1);
    },
    [cart.items, changeQty, addToCart],
  );

  const update = useCallback((patch: Partial<CartState>) => setCart((c) => ({ ...c, ...patch })), []);
  const clearCart = useCallback(() => setCart((c) => ({ ...c, items: [], coupon: null, note: "" })), []);
  const setLastOrder = useCallback((o: LastOrder) => {
    setLastOrderState(o);
    storage.set(LAST_ORDER_KEY, o);
  }, []);

  const ui = useMemo<UI>(
    () => ({ toast, toasts, dismissToast, cartOpen, openCart, closeCart, dialog, openDialog, closeDialog }),
    [toast, toasts, dismissToast, cartOpen, openCart, closeCart, dialog, openDialog, closeDialog],
  );
  const shop = useMemo<Shop>(
    () => ({ hydrated, cart, soldOut, isSoldOut, qtyOf, count, totals, addToCart, changeQty, changeQtyById, update, clearCart, lastOrder, setLastOrder }),
    [hydrated, cart, soldOut, isSoldOut, qtyOf, count, totals, addToCart, changeQty, changeQtyById, update, clearCart, lastOrder, setLastOrder],
  );

  return (
    <UIContext.Provider value={ui}>
      <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>
    </UIContext.Provider>
  );
}

/** Until the server answers, use the defaults from data.ts. */
function menuDefaultsSoldOut(): string[] {
  return menu.filter((d) => d.soldOut).map((d) => d.id);
}
