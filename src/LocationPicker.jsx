import { useEffect, useRef, useState } from "react";

export default function LocationPicker({
  open,
  onClose,
  textColor,
  favorites,
  activeId,
  onSelect,
  onAdd,
  onRemove,
  maxFavorites,
}) {
  const [state, setState] = useState("GA");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") onClose(); }
    function onClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function runSearch(e) {
    e?.preventDefault?.();
    const st = state.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(st)) {
      setSearchError("Enter a 2-letter state code (e.g. GA).");
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const params = new URLSearchParams({ state: st });
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/.netlify/functions/site-search?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data.sites ?? []);
    } catch (err) {
      setSearchError(err.message);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  const favIds = new Set(favorites.map((f) => f.id));
  const favFull = favorites.length >= maxFavorites;

  return (
    <div
      ref={panelRef}
      className="picker"
      style={{ color: textColor }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="picker-header">
        <span>Choose location</span>
        <button type="button" className="picker-close" onClick={onClose} aria-label="Close">×</button>
      </div>

      <div className="picker-section">
        <div className="picker-section-title">Favorites ({favorites.length}/{maxFavorites})</div>
        {favorites.map((f) => (
          <div key={f.id} className="picker-row">
            <button
              type="button"
              className={`picker-pick ${f.id === activeId ? "active" : ""}`}
              onClick={() => { onSelect(f.id); onClose(); }}
            >
              <span className="picker-name">{f.name}</span>
              <span className="picker-id">#{f.id}</span>
            </button>
            {favorites.length > 1 && (
              <button
                type="button"
                className="picker-remove"
                onClick={() => onRemove(f.id)}
                aria-label={`Remove ${f.name}`}
              >Remove</button>
            )}
          </div>
        ))}
      </div>

      <div className="picker-section">
        <div className="picker-section-title">Find a USGS station</div>
        <form className="picker-search" onSubmit={runSearch}>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            maxLength={2}
            placeholder="ST"
            aria-label="State code"
            className="picker-input picker-input-state"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or site #"
            aria-label="Search query"
            className="picker-input"
          />
          <button type="submit" className="picker-go" disabled={searching}>
            {searching ? "…" : "Search"}
          </button>
        </form>

        {searchError && <div className="picker-error">{searchError}</div>}

        <div className="picker-results">
          {results.length === 0 && !searching && !searchError && (
            <div className="picker-hint">
              Searches USGS stations that report water temperature. State required.
            </div>
          )}
          {results.map((r) => {
            const already = favIds.has(r.id);
            return (
              <div key={r.id} className="picker-row">
                <div className="picker-result">
                  <span className="picker-name">{r.name}</span>
                  <span className="picker-id">#{r.id}</span>
                </div>
                <button
                  type="button"
                  className="picker-add"
                  disabled={already || favFull}
                  onClick={() => onAdd({ id: r.id, name: r.name, state: r.state })}
                >
                  {already ? "Saved" : favFull ? "Full" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .picker {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: min(440px, 92vw);
          max-height: 80vh;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 14px;
          padding: 20px 22px 24px;
          z-index: 30;
          font-family: 'Barlow', sans-serif;
          box-shadow: 0 30px 80px rgba(0,0,0,0.45);
        }
        .picker-header {
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-size: 13px;
          margin-bottom: 14px;
          opacity: 0.85;
        }
        .picker-close {
          background: none; border: none; color: inherit;
          font-size: 22px; line-height: 1; cursor: pointer; opacity: 0.6;
        }
        .picker-close:hover { opacity: 1; }
        .picker-section { margin-bottom: 18px; }
        .picker-section-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 11px;
          opacity: 0.55;
          margin-bottom: 8px;
        }
        .picker-row {
          display: flex; gap: 8px; align-items: stretch;
          margin-bottom: 6px;
        }
        .picker-pick, .picker-result {
          flex: 1; text-align: left;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: inherit;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          display: flex; flex-direction: column; gap: 2px;
        }
        .picker-pick:hover { background: rgba(255,255,255,0.12); }
        .picker-pick.active {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.35);
        }
        .picker-name { font-size: 14px; font-weight: 400; }
        .picker-id {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px; letter-spacing: 0.15em; opacity: 0.5;
        }
        .picker-remove, .picker-add {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: inherit;
          padding: 0 14px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .picker-remove:hover, .picker-add:not(:disabled):hover {
          background: rgba(255,255,255,0.18);
        }
        .picker-add:disabled { opacity: 0.4; cursor: not-allowed; }
        .picker-search { display: flex; gap: 8px; margin-bottom: 10px; }
        .picker-input {
          flex: 1;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          color: inherit;
          padding: 10px 12px;
          font-family: inherit;
          font-size: 14px;
        }
        .picker-input:focus { outline: 1px solid rgba(255,255,255,0.4); }
        .picker-input-state {
          flex: 0 0 60px;
          text-transform: uppercase;
          text-align: center;
          letter-spacing: 0.2em;
        }
        .picker-go {
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.2);
          color: inherit;
          padding: 0 16px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .picker-go:not(:disabled):hover { background: rgba(255,255,255,0.26); }
        .picker-results { display: flex; flex-direction: column; gap: 6px; }
        .picker-error {
          font-size: 12px; opacity: 0.8;
          background: rgba(255, 80, 80, 0.18);
          padding: 8px 10px; border-radius: 6px; margin-bottom: 8px;
        }
        .picker-hint {
          font-size: 12px; opacity: 0.55;
          font-family: 'Barlow', sans-serif;
        }
      `}</style>
    </div>
  );
}
