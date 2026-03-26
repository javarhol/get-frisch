import { useState, useRef, useCallback } from "react";

function cToF(c) {
  return (c * 9) / 5 + 32;
}

const W = 600;
const H = 200;
const PAD = { top: 50, bottom: 20, left: 15, right: 15 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

export default function TemperatureGraph({ readings, unit }) {
  const [activeIndex, setActiveIndex] = useState(readings.length - 1);
  const dragging = useRef(false);
  const svgRef = useRef(null);

  const temps = readings.map((r) =>
    unit === "F" ? cToF(r.tempC) : r.tempC
  );
  const minT = Math.min(...temps) - 1;
  const maxT = Math.max(...temps) + 1;
  const rangeT = maxT - minT || 1;

  const xFor = (i) => PAD.left + (i / (readings.length - 1)) * CHART_W;
  const yFor = (t) => PAD.top + CHART_H - ((t - minT) / rangeT) * CHART_H;

  const points = temps.map((t, i) => `${xFor(i)},${yFor(t)}`).join(" ");

  const indexFromPointer = useCallback(
    (e) => {
      const svg = svgRef.current;
      if (!svg) return activeIndex;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
      const ratio = (svgPt.x - PAD.left) / CHART_W;
      const idx = Math.round(ratio * (readings.length - 1));
      return Math.max(0, Math.min(readings.length - 1, idx));
    },
    [readings.length, activeIndex]
  );

  const onPointerDown = (e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveIndex(indexFromPointer(e));
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    setActiveIndex(indexFromPointer(e));
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const ax = xFor(activeIndex);
  const ay = yFor(temps[activeIndex]);
  const activeReading = readings[activeIndex];
  const activeTemp = temps[activeIndex];

  const timeLabel = new Date(activeReading.dateTime).toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    hour12: true,
  });

  // Clamp label horizontally
  const labelX = Math.max(PAD.left + 30, Math.min(W - PAD.right - 30, ax));

  return (
    <div
      style={{
        width: "min(90vw, 560px)",
        margin: "0 auto 12px",
        touchAction: "none",
        cursor: "grab",
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <polyline
          points={points}
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />

        {/* Active dot */}
        <circle cx={ax} cy={ay} r="6" fill="white" />

        {/* Label */}
        <text
          x={labelX}
          y={ay - 22}
          textAnchor="middle"
          fill="white"
          fontFamily="'Barlow Condensed', sans-serif"
          fontWeight="700"
          fontSize="16"
        >
          {activeTemp.toFixed(1)}°{unit}
        </text>
        <text
          x={labelX}
          y={ay - 8}
          textAnchor="middle"
          fill="white"
          fontFamily="'Barlow Condensed', sans-serif"
          fontWeight="300"
          fontSize="11"
          opacity="0.7"
        >
          {timeLabel}
        </text>

        {/* Interaction overlay */}
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          fill="transparent"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{ cursor: "grab" }}
        />
      </svg>
    </div>
  );
}
