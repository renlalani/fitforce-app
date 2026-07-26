import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { shadow } from "../styles/designSystem";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "6px 10px",
        fontSize: 11,
        fontWeight: 600,
        color: "var(--text)",
        whiteSpace: "nowrap",
        boxShadow: shadow.dropdown,
      }}
    >
      {label}: {payload[0]?.value?.toFixed(1) ?? "0"} kg
    </div>
  );
}

function Dot({ cx, cy, color }) {
  if (cx == null || cy == null) return null;
  return (
    <circle cx={cx} cy={cy} r={3} fill={color} stroke="white" strokeWidth={1} />
  );
}

function ActiveDot({ cx, cy, color }) {
  if (cx == null || cy == null) return null;
  return (
    <>
      <circle cx={cx} cy={cy} r={5} fill={color} opacity={0.12} />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke="white"
        strokeWidth={1.5}
      />
    </>
  );
}

function parseWeightDate(dateStr) {
  if (!dateStr) return new Date(NaN);
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const year = new Date().getFullYear();
  return new Date(dateStr.includes(",") ? dateStr : `${dateStr}, ${year}`);
}

function prepareChartData(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const seen = new Map();

  raw.forEach(d => {
    if (!d) return;
    const value = +(d.value ?? d.weight ?? 0);
    if (isNaN(value) || value <= 0) return;

    const parsed = parseWeightDate(d.date);
    if (isNaN(parsed.getTime())) return;

    const isoKey = parsed.toISOString().slice(0, 10);
    if (!seen.has(isoKey) || parsed.getTime() >= seen.get(isoKey)._sortKey) {
      seen.set(isoKey, { date: d.date || "", value, _sortKey: parsed.getTime() });
    }
  });

  return [...seen.values()]
    .sort((a, b) => a._sortKey - b._sortKey)
    .map(({ date, value }) => ({ date, value }));
}

export default function MiniChart({ data, color = "var(--accent)", label, height = 120 }) {
  const chartData = useMemo(() => prepareChartData(data), [data]);

  if (chartData.length < 2) return <div style={{ height, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--text-dim)" }}>Not enough data</div>;

  const dataKey = chartData.map(d => `${d.date}|${d.value}`).join(",");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ marginBottom: 16 }}
    >
      {label && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{label}</span>
          <span style={{ fontSize: 20, fontWeight: 700, color }}>
            {chartData[chartData.length - 1].value}
            <span
              style={{
                fontSize: 11,
                fontWeight: 400,
                color: "var(--text-muted)",
                marginLeft: 2,
              }}
            >
              kg
            </span>
          </span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height} key={dataKey}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 4, left: 8 }}
        >
          <CartesianGrid
            strokeDasharray=""
            stroke="var(--border)"
            strokeWidth={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            ticks={[chartData[0].date, chartData[chartData.length - 1].date]}
            tick={{
              fontSize: 9,
              fill: "var(--text-muted)",
              fontWeight: 500,
            }}
            axisLine={false}
            tickLine={false}
            tickMargin={4}
          />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{
              fontSize: 9,
              fill: "var(--text-muted)",
              fontWeight: 500,
            }}
            axisLine={false}
            tickLine={false}
            tickMargin={4}
            width={30}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={<Dot color={color} />}
            activeDot={<ActiveDot color={color} />}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="easeInOut"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
