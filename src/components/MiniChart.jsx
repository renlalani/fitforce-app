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
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
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

export default function MiniChart({ data, color = "var(--accent)", label, height = 120 }) {
  if (!data || data.length < 2) return <div style={{ height, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--text-dim)" }}>Not enough data</div>;

  const chartData = data.map((d) => ({
    date: d.date || "",
    value: +(d.value || d.weight || 0),
  }));

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

      <ResponsiveContainer width="100%" height={height}>
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
