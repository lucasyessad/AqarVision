"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "aqar_compare";
const MAX_COMPARE = 3;

export interface CompareItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  surface_m2: number | null;
  rooms: number | null;
  cover_url: string | null;
}

export function useCompare() {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored) as CompareItem[]);
      }
    } catch {
      // ignore
    }
  }, []);

  const save = useCallback((next: CompareItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(
    (item: CompareItem) => {
      setItems((prev) => {
        const exists = prev.find((i) => i.id === item.id);
        let next: CompareItem[];
        if (exists) {
          next = prev.filter((i) => i.id !== item.id);
        } else if (prev.length >= MAX_COMPARE) {
          // Replace oldest
          next = [...prev.slice(1), item];
        } else {
          next = [...prev, item];
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const remove = useCallback(
    (id: string) => {
      save(items.filter((i) => i.id !== id));
    },
    [items, save]
  );

  const clear = useCallback(() => {
    save([]);
  }, [save]);

  const isSelected = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const compareUrl = `/comparer?ids=${items.map((i) => i.id).join(",")}`;

  return { items, toggle, remove, clear, isSelected, compareUrl, max: MAX_COMPARE };
}
