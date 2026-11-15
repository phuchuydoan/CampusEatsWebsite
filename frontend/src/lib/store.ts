"use client";

import { useSyncExternalStore } from "react";

// A tiny external store. With `persist`, the value is read from web storage on
// first use in the browser and written back on every change. The server (and
// the first client render during hydration) always sees `initial`.
export function createStore<T>(initial: T, persist?: { key: string; storage: "local" | "session" }) {
  let value = initial;
  let loaded = !persist;
  const listeners = new Set<() => void>();
  const storage = () => (persist?.storage === "session" ? window.sessionStorage : window.localStorage);

  function get() {
    if (!loaded && persist) {
      loaded = true;
      try {
        const raw = storage().getItem(persist.key);
        if (raw !== null) value = JSON.parse(raw) as T;
      } catch {
        // Storage is blocked or holds something unreadable: start from `initial`.
      }
    }
    return value;
  }

  function set(next: T | ((current: T) => T)) {
    value = typeof next === "function" ? (next as (current: T) => T)(get()) : next;
    loaded = true;
    if (persist) {
      try {
        storage().setItem(persist.key, JSON.stringify(value));
      } catch {
        // Keep working in memory if storage is unavailable.
      }
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return { get, set, subscribe, getServer: () => initial };
}

export function useStore<T>(store: ReturnType<typeof createStore<T>>) {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}

const noop = () => () => {};

// False on the server and during hydration, true afterwards. Lets a component
// hold back UI that depends on browser-only state instead of flashing a wrong one.
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
