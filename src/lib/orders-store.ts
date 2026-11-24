"use client";
import type { Order } from "@/lib/schemas";

const KEY = "smart_menu_demo_orders";
const CH = "smart_menu_demo_orders_ch";

// Demo storage: localStorage + BroadcastChannel (same browser only).
export function loadOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Order[]; } catch { return []; }
}
export function saveOrders(orders: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(orders));
  new BroadcastChannel(CH).postMessage("changed");
}
export function addOrder(o: Order) { saveOrders([o, ...loadOrders()]); }
export function subscribe(cb: () => void) {
  const bc = new BroadcastChannel(CH);
  bc.onmessage = cb;
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) cb(); };
  window.addEventListener("storage", onStorage);
  return () => { bc.close(); window.removeEventListener("storage", onStorage); };
}
