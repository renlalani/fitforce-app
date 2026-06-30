import { motion } from "framer-motion";
import { forwardRef, useState } from "react";
import {  radius, transition } from "../../styles/designSystem";

const Input = forwardRef(({ style, label, ...props }, ref) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {label && (
        <motion.label
          htmlFor={props.id || props.name}
          animate={{
            color: focused ? "var(--accent)" : "var(--text-muted)",
            y: focused ? -2 : 0,
          }}
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            display: "block",
            marginBottom: 6,
            transition: transition.fast,
          }}
        >
          {label}
        </motion.label>
      )}
      <div style={{ position: "relative" }}>
        <input
          ref={ref}
          id={props.id || props.name}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: "var(--bg-card2)",
            border: `1px solid ${focused ? "rgba(59,130,246,0.376)" : "var(--border2)"}`,
            borderRadius: radius.md,
            padding: "10px 14px",
            color: "var(--text)",
            fontSize: 13,
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
            transition: transition.fast,
            boxShadow: focused ? `0 0 0 3px rgba(59,130,246,0.082)` : "none",
            ...style,
          }}
          {...props}
        />
        <motion.div
          animate={{
            scaleX: focused ? 1 : 0,
            opacity: focused ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, var(--accent), var(--accent-light))`,
            borderRadius: "0 0 8px 8px",
            transformOrigin: "left",
          }}
        />
      </div>
    </div>
  );
});

Input.displayName = "Input";
export default Input;


