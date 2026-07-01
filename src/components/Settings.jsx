import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Moon, Sun, Weight, Bell, Brain,
  Shield, Download, Upload, Trash2, Info, ChevronRight,
  Dumbbell, Apple, Droplets, Beef, Clock, Zap,
} from "lucide-react";
import {  radius } from "../styles/designSystem";
import { useSettingsStore } from "../stores/settingsStore";
import Button from "./ui/Button";
import { getAllFitForceData, safeSet } from "../utils/storage";
import Card from "./ui/Card";
import Toast from "./Toast";

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const sectionStyle = {
  marginBottom: 20,
};

const rowStyle = () => ({
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "12px 0", borderBottom: `1px solid var(--border)`,
});

function Toggle({ checked, onChange, id }) {
  return (
    <motion.button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.95 }}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? "var(--accent)" : "var(--border2)",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: 20, height: 20, borderRadius: "50%",
          background: "var(--bg-card)", position: "absolute", top: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      />
    </motion.button>
  );
}

function SettingRow({ icon, label, desc, children }) {
  return (
    <div style={rowStyle()}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <div style={{
          width: 28, height: 28, borderRadius: radius.sm,
          background: `rgba(59,130,246,0.071)`, display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{label}</div>
          {desc && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const settings = useSettingsStore();
  const [toast, setToast] = useState({ visible: false, message: "", sub: "" });
  const [confirmReset, setConfirmReset] = useState(false);

  const showToast = (message, sub = "") => {
    setToast({ visible: true, message, sub });
    setTimeout(() => setToast({ visible: false, message: "", sub: "" }), 3000);
  };

  const handleExport = (format) => {
    try {
      const data = getAllFitForceData();
      const blob = new Blob(
        [format === "json" ? JSON.stringify(data, null, 2) : Object.entries(data).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n\n")],
        { type: format === "json" ? "application/json" : "text/plain" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitforce-backup.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Data exported as ${format.toUpperCase()}`);
    } catch (e) {
      showToast("Export failed", e.message);
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          Object.keys(data).forEach((k) => {
            if (k.startsWith("fitforce-")) {
              safeSet(k, data[k]);
            }
          });
          showToast("Data imported! Reloading...");
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          showToast("Import failed", "Invalid file format");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    settings.resetAll();
    showToast("All data reset. Reloading...");
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <motion.div variants={itemVariants} initial="initial" animate="animate">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 32, height: 32, borderRadius: radius.md,
          background: `rgba(59,130,246,0.094)`, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <SettingsIcon size={15} color={"var(--accent)"} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
          Settings
        </h2>
      </div>

      <div style={sectionStyle}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Appearance</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 12 }}>Theme preferences</div>
          <SettingRow icon={settings.theme === "dark" ? <Moon size={13} color={"var(--blue)"} /> : <Sun size={13} color={"var(--yellow)"} />} label="Dark Mode" desc="Toggle dark/light theme">
            <Toggle id="theme-toggle" checked={settings.theme === "dark"} onChange={() => settings.setTheme(settings.theme === "dark" ? "light" : "dark")} />
          </SettingRow>
          <SettingRow icon={<Weight size={13} color={"var(--green)"} />} label="Units" desc="kg or lbs">
            <div style={{ display: "flex", gap: 4 }}>
              {["kg", "lbs"].map((u) => (
                <motion.button
                  key={u}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => settings.setUnits(u)}
                  style={{
                    padding: "4px 12px", borderRadius: radius.sm, fontSize: 11,
                    background: settings.units === u ? "var(--accent)" : "var(--bg-card3)",
                    color: settings.units === u ? "#fff" : "var(--text-muted)",
                    border: "none", cursor: "pointer", fontWeight: 500,
                  }}
                >
                  {u}
                </motion.button>
              ))}
            </div>
          </SettingRow>
        </Card>
      </div>

      <div style={sectionStyle}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Notifications</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 12 }}>Enable or disable reminders</div>
          {[
            ["workout", "Workout Reminder", "Remind you to complete workouts", <Dumbbell key="w" size={13} color={"var(--accent)"} />],
            ["meal", "Meal Reminder", "Remind you to log meals", <Apple key="m" size={13} color={"var(--green)"} />],
            ["water", "Water Reminder", "Stay hydrated throughout the day", <Droplets key="wa" size={13} color={"var(--blue)"} />],
            ["protein", "Protein Reminder", "Hit your daily protein target", <Beef key="p" size={13} color={"var(--orange)"} />],
            ["rest", "Rest Reminder", "Take rest days for recovery", <Clock key="r" size={13} color={"var(--purple)"} />],
            ["streak", "Streak Reminder", "Keep your streak going", <Zap key="s" size={13} color={"var(--yellow)"} />],
          ].map(([k, label, desc, icon]) => (
            <SettingRow key={k} icon={icon} label={label} desc={desc}>
              <Toggle id={`notif-${k}`} checked={settings.notifications[k]} onChange={(v) => settings.setNotification(k, v)} />
            </SettingRow>
          ))}
        </Card>
      </div>

      <div style={sectionStyle}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>AI Preferences</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 12 }}>Control AI behavior</div>
          <SettingRow icon={<Brain size={13} color={"var(--purple)"} />} label="Auto Suggestions" desc="AI suggests workouts and meals">
            <Toggle id="ai-auto" checked={settings.ai.autoSuggest} onChange={(v) => settings.setAi("autoSuggest", v)} />
          </SettingRow>
          <SettingRow icon={<Info size={13} color={"var(--blue)"} />} label="Detailed Responses" desc="AI gives detailed coaching">
            <Toggle id="ai-detail" checked={settings.ai.detailedResponses} onChange={(v) => settings.setAi("detailedResponses", v)} />
          </SettingRow>
        </Card>
      </div>

      <div style={sectionStyle}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Privacy</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 12 }}>Data preferences</div>
          <SettingRow icon={<Shield size={13} color={"var(--green)"} />} label="Anonymous Analytics" desc="Help improve FitForce">
            <Toggle id="privacy-analytics" checked={settings.privacy.analytics} onChange={(v) => settings.setPrivacy("analytics", v)} />
          </SettingRow>
        </Card>
      </div>

      <div style={sectionStyle}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Data Management</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 12 }}>Export, import, or reset your data</div>
          <SettingRow icon={<Download size={13} color={"var(--blue)"} />} label="Export Data" desc="Download your data as JSON">
            <Button variant="secondary" onClick={() => handleExport("json")} style={{ fontSize: 11, padding: "6px 12px" }}>
              <Download size={12} /> Export
            </Button>
          </SettingRow>
          <SettingRow icon={<Upload size={13} color={"var(--green)"} />} label="Import Data" desc="Restore from a backup file">
            <Button variant="secondary" onClick={handleImport} style={{ fontSize: 11, padding: "6px 12px" }}>
              <Upload size={12} /> Import
            </Button>
          </SettingRow>
          <SettingRow icon={<Trash2 size={13} color={"var(--red)"} />} label="Reset All Data" desc="Permanently delete all data">
            {confirmReset ? (
              <div style={{ display: "flex", gap: 4 }}>
                <Button onClick={handleReset} style={{ fontSize: 11, padding: "6px 10px", background: "var(--red)" }}>
                  Confirm
                </Button>
                <Button variant="secondary" onClick={() => setConfirmReset(false)} style={{ fontSize: 11, padding: "6px 10px" }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setConfirmReset(true)} style={{ fontSize: 11, padding: "6px 12px", color: "var(--red)" }}>
                <Trash2 size={12} /> Reset
              </Button>
            )}
          </SettingRow>
        </Card>
      </div>

      <div style={sectionStyle}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>About</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 12 }}>FitForce version information</div>
          <div style={rowStyle()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: radius.sm,
                background: "var(--accent-gradient)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14, color: "#fff",
              }}>
                F
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>FitForce</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>AI Gym Companion</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>v1.0.0</div>
          </div>
        </Card>
      </div>

      <Toast
        message={toast.message}
        sub={toast.sub}
        visible={toast.visible}
        onClose={() => setToast({ visible: false, message: "", sub: "" })}
        duration={3000}
      />
    </motion.div>
  );
}


