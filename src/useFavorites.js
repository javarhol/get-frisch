import { useCallback, useEffect, useState } from "react";

const FAVS_KEY = "frisch.favorites";
const ACTIVE_KEY = "frisch.activeSite";
const MAX_FAVORITES = 3;

const DEFAULT_FAVORITE = {
  id: "02394000",
  name: "Lake Acworth · Georgia",
  state: "GA",
};

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVS_KEY);
    if (!raw) return [DEFAULT_FAVORITE];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [DEFAULT_FAVORITE];
    return parsed.slice(0, MAX_FAVORITES);
  } catch {
    return [DEFAULT_FAVORITE];
  }
}

function loadActive(favorites) {
  const stored = localStorage.getItem(ACTIVE_KEY);
  if (stored && favorites.some((f) => f.id === stored)) return stored;
  return favorites[0]?.id ?? DEFAULT_FAVORITE.id;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites);
  const [activeId, setActiveId] = useState(() => loadActive(loadFavorites()));

  useEffect(() => {
    try { localStorage.setItem(FAVS_KEY, JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  useEffect(() => {
    try { localStorage.setItem(ACTIVE_KEY, activeId); } catch {}
  }, [activeId]);

  const addFavorite = useCallback((site) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === site.id)) return prev;
      if (prev.length >= MAX_FAVORITES) return prev;
      return [...prev, { id: site.id, name: site.name, state: site.state }];
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (next.length === 0) return [DEFAULT_FAVORITE];
      return next;
    });
    setActiveId((curr) => {
      if (curr !== id) return curr;
      const remaining = favorites.filter((f) => f.id !== id);
      return remaining[0]?.id ?? DEFAULT_FAVORITE.id;
    });
  }, [favorites]);

  const activeFavorite = favorites.find((f) => f.id === activeId) ?? favorites[0];

  return {
    favorites,
    activeId,
    activeFavorite,
    setActiveId,
    addFavorite,
    removeFavorite,
    maxFavorites: MAX_FAVORITES,
  };
}
