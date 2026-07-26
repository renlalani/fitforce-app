import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { radius, shadow } from "../../styles/designSystem";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: radius.sm, padding: "6px 10px", fontSize: 11,
      fontWeight: 600, color: "var(--text)", boxShadow: shadow.dropdown,
    }}>
      <div style={{ color: d.color || payload[0].color }}>{d.name}</div>
      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.pct}% ({d.value})</div>
    </div>
  );
}

export default function PieChart({
  data, height = 160, innerRadius = 35, outerRadius = 60, colors,
}) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data} dataKey="value" nameKey="name"
            cx="50%" cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            strokeWidth={0}
            isAnimationActive={true}
            animationDuration={800}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={colors ? colors[i % colors.length] : "var(--accent)"} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
