import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";
import { radius, shadow } from "../../styles/designSystem";

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: radius.sm, padding: "6px 10px", fontSize: 11,
      fontWeight: 600, color: "var(--text)", boxShadow: shadow.dropdown,
    }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}{unit || ""}
        </div>
      ))}
    </div>
  );
}

export default function TrendChart({
  data, color = "var(--accent)", height = 160, area = true,
  unit = "", yLabel, xKey = "date", yKey = "value", name = "",
  showAxis = true,
}) {
  if (!data || data.length === 0) return null;
  if (data.length === 1) {
    return (
      <div style={{
        height, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, color: "var(--text-dim)",
      }}>
        {data[0][yKey]}{unit} — {data[0][xKey]}
      </div>
    );
  }

  const Chart = area ? AreaChart : LineChart;
  const dataKey = data.map(d => `${d[xKey]}|${d[yKey]}`).join(",");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height={height} key={dataKey}>
        <Chart data={data} margin={{ top: 8, right: 4, bottom: 4, left: -16 }}>
          <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeWidth={0.5} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 9, fill: "var(--text-muted)", fontWeight: 500 }}
            axisLine={false} tickLine={false} tickMargin={4}
            interval="preserveStartEnd"
            ticks={showAxis ? [data[0][xKey], data[data.length - 1][xKey]] : [data[data.length - 1][xKey]]}
          />
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            tick={{ fontSize: 9, fill: "var(--text-muted)", fontWeight: 500 }}
            axisLine={false} tickLine={false} tickMargin={4} width={30}
            tickFormatter={(v) => v.toFixed(0)}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={false} />
          {area ? (
            <>
              <defs>
                <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area
                type="monotone" dataKey={yKey} stroke={color} strokeWidth={1.5}
                fill={`url(#grad-${color.replace("#", "")})`}
                dot={false} activeDot={{ r: 4, fill: color, stroke: "white", strokeWidth: 1.5 }}
                isAnimationActive={true} animationDuration={1000} animationEasing="easeInOut"
                name={name}
              />
            </>
          ) : (
            <Line
              type="monotone" dataKey={yKey} stroke={color} strokeWidth={1.5}
              dot={false} activeDot={{ r: 4, fill: color, stroke: "white", strokeWidth: 1.5 }}
              isAnimationActive={true} animationDuration={1000} animationEasing="easeInOut"
              name={name}
            />
          )}
        </Chart>
      </ResponsiveContainer>
    </motion.div>
  );
}
