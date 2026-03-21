import { useState, useEffect } from "react";

function cToF(c) {
  return (c * 9) / 5 + 32;
}

function getTempTheme(f) {
  if (f === null) return { bg: "#1a2744", text: "#ffffff", label: "—",         advice: "" };
  if (f < 50)    return { bg: "#0c2d5e", text: "#ffffff", label: "Cold",       advice: "Too cold to swim." };
  if (f < 58)    return { bg: "#0e4d8a", text: "#ffffff", label: "Cool",       advice: "Brave swimmers only." };
  if (f < 65)    return { bg: "#0b6e72", text: "#ffffff", label: "Refreshing", advice: "Good for a quick dip." };
  if (f < 72)    return { bg: "#1a7a4a", text: "#ffffff", label: "Perfect",    advice: "Great conditions. Get in." };
  if (f < 78)    return { bg: "#c9a800", text: "#1a1200", label: "Warm",       advice: "Comfortable and inviting." };
  if (f < 84)    return { bg: "#d4580a", text: "#ffffff", label: "Hot",        advice: "Very warm. Refreshing dip." };
  return                { bg: "#b5200e", text: "#ffffff", label: "Very Hot",   advice: "Seek shade. Stay hydrated." };
}

export default function App() {
  const [tempC, setTempC]       = useState(null);
  const [tempTime, setTempTime] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [unit, setUnit]         = useState("F");

  useEffect(() => { document.title = "Swim Acworth"; }, []);

  useEffect(() => {
    async function fetchTemp() {
      try {
        // Call the Netlify function directly — no CORS, no redirect needed
        const res = await fetch("/.netlify/functions/temp");
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTempC(data.tempC);
        setTempTime(data.dateTime);
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTemp();
    const iv = setInterval(fetchTemp, 15 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const tempF   = tempC !== null ? cToF(tempC) : null;
  const theme   = getTempTheme(tempF);
  const display = tempC !== null
    ? (unit === "F" ? tempF.toFixed(1) : tempC.toFixed(1))
    : "—";

  const timeStr = tempTime
    ? new Date(tempTime).toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      })
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@200;300;700;900&family=Barlow:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; }

        body {
          font-family: 'Barlow', sans-serif;
          background: ${theme.bg};
          transition: background 1.4s ease;
        }

        .page {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 32px 80px;
          position: relative;
          overflow: hidden;
          background: ${theme.bg};
          color: ${theme.text};
          transition: background 1.4s ease, color 0.8s ease;
        }

        .page::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          z-index: 10;
        }

        .site-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: clamp(13px, 1.8vw, 17px);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          opacity: 0;
          animation: slideDown 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s forwards;
          margin-bottom: 4px;
        }

        .location {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 200;
          font-size: clamp(11px, 1.4vw, 14px);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          opacity: 0;
          animation: slideDown 0.6s cubic-bezier(0.16,1,0.3,1) 0.12s forwards;
          margin-bottom: 8px;
        }

        .temp-row {
          display: flex;
          align-items: flex-start;
          line-height: 1;
          cursor: pointer;
          user-select: none;
          opacity: 0;
          animation: slideDown 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s forwards;
        }

        .temp-number {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: clamp(130px, 26vw, 280px);
          line-height: 0.85;
          letter-spacing: -0.02em;
          color: inherit;
        }

        .temp-sup {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 200;
          font-size: clamp(28px, 5vw, 60px);
          margin-top: 0.14em;
          margin-left: 6px;
          opacity: 0.5;
        }

        .label {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: clamp(22px, 4vw, 46px);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-top: 2px;
          opacity: 0;
          animation: slideDown 0.6s cubic-bezier(0.16,1,0.3,1) 0.32s forwards;
        }

        .advice {
          font-family: 'Barlow', sans-serif;
          font-weight: 300;
          font-size: clamp(14px, 2vw, 20px);
          letter-spacing: 0.06em;
          opacity: 0;
          animation: slideDown 0.6s cubic-bezier(0.16,1,0.3,1) 0.42s forwards;
          margin-top: 6px;
        }

        .bottom {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 20px 28px 24px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-size: clamp(10px, 1.3vw, 13px);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0;
          animation: fadeIn 0.8s ease 0.58s forwards;
          z-index: 5;
        }

        .bottom a {
          color: inherit;
          text-decoration: none;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .bottom a:hover { opacity: 1; }

        .live {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0.55;
        }

        .dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2.5s ease infinite;
          flex-shrink: 0;
        }

        .hint {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 200;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          opacity: 0.25;
          pointer-events: none;
          white-space: nowrap;
        }

        .loading {
          position: fixed; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: #0c2d5e;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 200;
          font-size: 13px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.15; }
        }
      `}</style>

      {loading && <div className="loading">Swim Acworth · Loading…</div>}

      {!loading && (
        <div className="page" style={{ background: theme.bg, color: theme.text }}>
          <div className="site-name">Swim Acworth</div>
          <div className="location">Lake Acworth · Georgia</div>

          <div
            className="temp-row"
            onClick={() => setUnit(u => u === "F" ? "C" : "F")}
            title="Tap to switch °F / °C"
          >
            <div className="temp-number">{display}</div>
            <div className="temp-sup">°{unit}</div>
          </div>

          <div className="label">{error ? "No Signal" : theme.label}</div>
          <div className="advice" style={{ opacity: error ? 0.4 : 0.72 }}>
            {error ? error : theme.advice}
          </div>

          <div className="bottom" style={{ color: theme.text }}>
            <div className="live">
              <div className="dot" />
              {timeStr ?? "—"}
            </div>
            <a
              href="https://waterdata.usgs.gov/monitoring-location/USGS-02393500/"
              target="_blank"
              rel="noopener"
            >
              USGS · Station 02393500
            </a>
          </div>

          <div className="hint" style={{ color: theme.text }}>
            Tap temperature to toggle °F / °C
          </div>
        </div>
      )}
    </>
  );
}
