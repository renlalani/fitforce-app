import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Droplets, Apple, Moon, Scale,
  Bell, BellOff, Clock, ChevronDown, History,
  Trash2, X,
} from "lucide-react";
import { useReminderStore, DAYS } from "../stores/reminderStore";
import {  radius } from "../styles/designSystem";
import Card from "./ui/Card";
import useScrollLock from "../hooks/useScrollLock";

const REMINDER_CONFIG = {
  workout: {
    label: "Workout Reminder",
    desc: "Remind you to complete your daily workout",
    icon: Dumbbell,
    color: "var(--accent)",
  },
  water: {
    label: "Water Reminder",
    desc: "Stay hydrated throughout the day",
    icon: Droplets,
    color: "var(--blue)",
  },
  meal: {
    label: "Meal Reminder",
    desc: "Remind you to log meals on time",
    icon: Apple,
    color: "var(--green)",
  },
  sleep: {
    label: "Sleep Reminder",
    desc: "Get proper rest for recovery",
    icon: Moon,
    color: "var(--purple)",
  },
  weight: {
    label: "Weight Check Reminder",
    desc: "Track your weight regularly",
    icon: Scale,
    color: "var(--orange)",
  },
};

const TIMES = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIMES.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
  }
}

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatLastNotified(iso) {
  if (!iso) return "Never";
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

function HistoryModal({ open, onClose, reminders }) {
  useScrollLock(open);
  const clearHistory = useReminderStore((s) => s.clearHistory);
  const allHistory = Object.entries(reminders)
    .flatMap(([key, r]) =>
      r.history.map((e) => ({ ...e, key, reminderLabel: REMINDER_CONFIG[key].label }))
    )
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <AnimatePresence>
      {open && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "var(--overlay, rgba(0,0,0,0.06))",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border2)",
              borderRadius: radius.xl,
              width: "100%",
              maxWidth: 440,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow:
                "0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.04), 0 24px 64px rgba(0,0,0,0.02)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Reminder history"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 20px 12px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
                Reminder History
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {allHistory.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => { Object.keys(reminders).forEach(k => clearHistory(k)); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--red)",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: radius.sm,
                      fontSize: 11,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Trash2 size={13} /> Clear
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  style={{
                    background: "var(--bg-card2)",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 6,
                    borderRadius: radius.sm,
                    display: "flex",
                  }}
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "8px 0",
              }}
            >
              {allHistory.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "var(--text-muted)",
                    fontSize: 13,
                  }}
                >
                  No reminders sent yet
                </div>
              ) : (
                allHistory.map((entry, i) => (
                  <div
                    key={`${entry.key}-${entry.time}-${i}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 20px",
                      borderBottom: "1px solid var(--border2)",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: radius.sm,
                        background: "rgba(59,130,246,0.071)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Bell size={12} color="var(--accent)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "var(--text)",
                        }}
                      >
                    {entry.reminderLabel}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginTop: 1,
                    }}
                  >
                    {entry.date} at {entry.label}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 10,
color: "var(--text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      {formatLastNotified(entry.time)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>,
      document.body
    )}
    </AnimatePresence>
  );
}

function ReminderCard({ reminderKey }) {
  const reminder = useReminderStore((s) => s.reminders[reminderKey]);
  const toggleReminder = useReminderStore((s) => s.toggleReminder);
  const setReminderTime = useReminderStore((s) => s.setReminderTime);
  const setReminderRepeat = useReminderStore((s) => s.setReminderRepeat);
  const toggleReminderDay = useReminderStore((s) => s.toggleReminderDay);
  const [expanded, setExpanded] = useState(false);
  const config = REMINDER_CONFIG[reminderKey];
  const Icon = config.icon;

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "14px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: radius.sm,
            background: `${config.color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={14} color={config.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text)",
            }}
          >
            {config.label}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              marginTop: 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {reminder.enabled ? (
              <>
                <span>{formatTime(reminder.time)}</span>
                <span>·</span>
                <span style={{ textTransform: "capitalize" }}>
                  {reminder.repeat}
                </span>
              </>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>Disabled</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 6,
              borderRadius: radius.sm,
              display: "flex",
            }}
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={15} />
            </motion.div>
          </motion.button>
          <motion.button
            role="switch"
            aria-checked={reminder.enabled}
            onClick={() => toggleReminder(reminderKey)}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              background: reminder.enabled
                ? config.color
                : "var(--border2)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <motion.div
              animate={{ x: reminder.enabled ? 20 : 2 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "var(--bg-card)",
                position: "absolute",
                top: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                paddingTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Time picker */}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Time
                </div>
                <select
                  value={reminder.time}
                  onChange={(e) => setReminderTime(reminderKey, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: radius.sm,
                    background: "var(--bg-card2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    fontSize: 12,
                    fontWeight: 500,
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                  }}
                >
                  {TIMES.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Repeat */}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Repeat
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["daily", "weekly"].map((r) => (
                    <motion.button
                      key={r}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setReminderRepeat(reminderKey, r)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: radius.sm,
                        fontSize: 11,
                        fontWeight: 500,
                        background:
                          reminder.repeat === r
                            ? config.color
                            : "var(--bg-card2)",
                        color:
                          reminder.repeat === r
                            ? "#fff"
                            : "var(--text-muted)",
                        border:
                          reminder.repeat === r
                            ? "none"
                            : "1px solid var(--border)",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {r}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Day picker for weekly */}
              {reminder.repeat === "weekly" && (
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: "var(--text-muted)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Days
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    {DAYS.map((day, i) => {
                      const active = reminder.repeatDays.includes(i);
                      return (
                        <motion.button
                          key={day}
                          whileTap={{ scale: 0.92 }}
                          onClick={() =>
                            toggleReminderDay(reminderKey, i)
                          }
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: radius.sm,
                            fontSize: 10,
                            fontWeight: 600,
                            background: active
                              ? config.color
                              : "var(--bg-card2)",
                            color: active ? "#fff" : "var(--text-muted)",
                            border: active
                              ? "none"
                              : "1px solid var(--border)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {day}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Last notified */}
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  textAlign: "right",
                }}
              >
                Last notified: {formatLastNotified(reminder.lastNotified)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReminderSettings() {
  const reminders = useReminderStore((s) => s.reminders);
  const [showHistory, setShowHistory] = useState(false);
  const enabledCount = Object.values(reminders).filter((r) => r.enabled).length;

  return (
    <>
      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: radius.sm,
                background: "rgba(59,130,246,0.094)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={13} color="var(--accent)" />
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              Reminders
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowHistory(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: radius.sm,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            <History size={13} />
            History
          </motion.button>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            marginBottom: 4,
          }}
        >
          {enabledCount > 0
            ? `${enabledCount} of ${Object.keys(reminders).length} reminders active`
            : "No active reminders"}
        </div>
        {Object.keys(reminders).map((key) => (
          <ReminderCard key={key} reminderKey={key} />
        ))}
      </Card>

      <HistoryModal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        reminders={reminders}
      />
    </>
  );
}
