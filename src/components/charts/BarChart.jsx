import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
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
          {p.value}{unit || ""}
        </div>
      ))}
    </div>
  );
}

export default function BarChart({
  data, color = "var(--accent)", height = 140, unit = "", xKey = "name", yKey = "value",
  colors, barSize = 20, radius: barRadius = [4, 4, 0, 0],
}) {
  if (!data || data.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 8, right: 4, bottom: 4, left: -16 }}>
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 9, fill: "var(--text-muted)", fontWeight: 500 }}
            axisLine={false} tickLine={false} tickMargin={4}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={false} />
          <Bar dataKey={yKey} radius={barRadius} barSize={barSize} isAnimationActive={true} animationDuration={800}>
            {data.map((entry, i) => (
              <Cell key={i} fill={colors ? colors[i % colors.length] : color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
