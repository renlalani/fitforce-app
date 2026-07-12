import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { Mail, Loader2, CheckCircle, Eye, EyeOff, ArrowLeft, AlertCircle, ChevronLeft } from "lucide-react";
import logo from "../../images/logo.png";
import { radius, shadow } from "../styles/designSystem";
import { useAuthStore } from "../stores/authStore";
import {
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
} from "../utils/auth";

function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function SuccessOverlay({ userName, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: radius.full,
          background: "rgba(37,99,235,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24,
        }}>
          <CheckCircle size={44} color="#2563EB" strokeWidth={1.5} />
        </div>
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{
          fontSize: 24, fontWeight: 700, color: "var(--text)",
          margin: 0, textAlign: "center",
        }}
      >
        Welcome{userName ? `, ${userName}` : ""}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        style={{
          fontSize: 14, color: "var(--text-muted)", marginTop: 8,
          textAlign: "center",
        }}
      >
        Let's get started
      </motion.p>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.6, ease: "easeInOut" }}
        style={{
          marginTop: 32, width: 120, height: 3,
          background: "linear-gradient(90deg, #2563EB, #38BDF8)",
          borderRadius: 2,
          transformOrigin: "left",
        }}
      />
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.25 },
  },
};

const fadeSlideUp = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "var(--bg-card2)", border: "1px solid var(--border)",
  borderRadius: radius.sm, padding: "13px 14px",
  color: "var(--text)", fontSize: 14, outline: "none",
  transition: "border-color 0.2s",
};

function AuthScreenInner({ onDone }) {
  const login = useAuthStore((s) => s.login);
  const [mode, setMode] = useState("welcome");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Email form
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [emailMode, setEmailMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [forgotSent, setForgotSent] = useState(false);

  const isDisabled = authLoading;

  const completeAuth = useCallback((userData, method) => {
    setAuthLoading(false);
    setSuccessData({ user: userData, method });
    setTimeout(() => {
      login(userData, method);
    }, 1300);
  }, [login]);

  // Google
  const handleGoogle = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const userData = await signInWithGoogle();
      if (!userData) {
        setAuthLoading(false);
        return;
      }
      completeAuth(userData, "google");
    } catch (err) {
      setAuthError(err.message);
      setAuthLoading(false);
    }
  }, [completeAuth]);

  // Guest
  const handleGuest = useCallback(() => {
    const guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    completeAuth(
      { uid: guestId, name: "Guest", email: null, photo: null, provider: "guest" },
      "guest"
    );
  }, [completeAuth]);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // Email submit
  const handleEmailSubmit = useCallback(async (e) => {
    e?.preventDefault();
    setEmailError(null);
    setAuthError(null);
    const { email, password } = emailForm;
    if (!email.trim()) { setEmailError("Enter your email address"); return; }
    if (!validateEmail(email.trim())) { setEmailError("Enter a valid email address"); return; }
    if (!password) { setEmailError("Enter your password"); return; }
    if (emailMode === "signup" && password.length < 6) {
      setEmailError("Password must be at least 6 characters"); return;
    }
    setAuthLoading(true);
    try {
      let userData;
      if (emailMode === "signup") {
        userData = await signUpWithEmail(email.trim(), password);
      } else {
        userData = await signInWithEmail(email.trim(), password);
      }
      completeAuth(userData, "email");
    } catch (err) {
      setEmailError(err.message);
      setAuthLoading(false);
    }
  }, [emailForm, emailMode, completeAuth]);

  // Forgot password
  const handleForgotPassword = useCallback(async () => {
    const email = emailForm.email.trim();
    if (!email || !validateEmail(email)) {
      setEmailError("Enter a valid email address first");
      return;
    }
    setAuthLoading(true);
    setEmailError(null);
    try {
      await resetPassword(email);
      setForgotSent(true);
      setAuthLoading(false);
    } catch (err) {
      setEmailError(err.message);
      setAuthLoading(false);
    }
  }, [emailForm.email]);

  if (successData) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <SuccessOverlay userName={successData.user.name} onDone={() => {}} />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {mode === "welcome" ? (
        <motion.div
          key="welcome"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "32px 24px", maxWidth: 400, margin: "0 auto",
            width: "100%", boxSizing: "border-box",
          }}
        >
          <motion.div variants={fadeSlideUp} style={{ marginBottom: 32 }}>
            <motion.img
              src={logo} alt="FitForce"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                width: 76, height: 76, display: "block",
                filter: "drop-shadow(0 4px 20px rgba(37,99,235,0.15))",
                borderRadius: radius.lg,
              }}
            />
          </motion.div>

          <motion.h1
            variants={fadeSlideUp}
            style={{
              fontSize: 28, fontWeight: 700, color: "var(--text)",
              margin: 0, textAlign: "center", lineHeight: 1.2,
            }}
          >
            Welcome to FitForce
          </motion.h1>

          <motion.p
            variants={fadeSlideUp}
            style={{
              fontSize: 15, color: "var(--text-muted)",
              marginTop: 10, textAlign: "center", lineHeight: 1.4,
            }}
          >
            Train Smarter. Progress Faster.
          </motion.p>

          <motion.div
            variants={containerVariants}
            style={{
              width: "100%", marginTop: 44,
              display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <motion.button
              variants={fadeSlideUp}
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.985 }}
              disabled={isDisabled}
              onClick={handleGoogle}
              style={{
                width: "100%", padding: "14px 20px",
                background: isDisabled ? "var(--bg-card3)" : "#FFFFFF",
                border: "1px solid",
                borderColor: isDisabled ? "var(--border)" : "rgba(0,0,0,0.08)",
                borderRadius: radius.md, cursor: isDisabled ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                fontSize: 14, fontWeight: 600, color: "var(--text)",
                transition: "all 0.2s",
                boxShadow: isDisabled ? "none" : shadow.card,
                opacity: isDisabled ? 0.6 : 1,
                position: "relative",
              }}
            >
              {isDisabled ? (
                <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} />
              ) : (
                <GoogleIcon size={20} />
              )}
              <span>Sign in with Google</span>
            </motion.button>

            <motion.button
              variants={fadeSlideUp}
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.985 }}
              disabled={isDisabled}
              onClick={() => { setMode("email"); setEmailError(null); setForgotSent(false); }}
              style={{
                width: "100%", padding: "14px 20px",
                background: "transparent",
                border: "1.5px solid var(--accent)",
                borderRadius: radius.md, cursor: isDisabled ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                fontSize: 14, fontWeight: 600, color: "var(--accent)",
                transition: "all 0.2s",
                opacity: isDisabled ? 0.6 : 1,
              }}
            >
              <Mail size={18} />
              <span>Continue with Email</span>
            </motion.button>
          </motion.div>

          <motion.button
            variants={fadeSlideUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isDisabled}
            onClick={handleGuest}
            style={{
              background: "transparent", border: "none",
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 500, color: "var(--text-muted)",
              marginTop: 20, padding: "8px 16px",
              transition: "color 0.2s",
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            Continue as Guest
          </motion.button>

          <motion.p
            variants={fadeSlideUp}
            style={{
              fontSize: 10, color: "var(--text-dim)",
              textAlign: "center", marginTop: 36, lineHeight: 1.5,
              maxWidth: 280,
            }}
          >
            By continuing, you agree to our{" "}
            <span style={{ color: "var(--accent)", cursor: "pointer" }}>Terms of Service</span>{" "}
            and{" "}
            <span style={{ color: "var(--accent)", cursor: "pointer" }}>Privacy Policy</span>
          </motion.p>

          {authError && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: 12, color: "var(--red)", textAlign: "center",
                marginTop: 12, maxWidth: 320,
              }}
            >
              {authError}
            </motion.p>
          )}
        </motion.div>
      ) : mode === "email" ? (
        <motion.div
          key="email"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            maxWidth: 400, margin: "0 auto", width: "100%",
            padding: "32px 24px", boxSizing: "border-box",
          }}
        >
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            disabled={isDisabled}
            onClick={() => { setMode("welcome"); setEmailError(null); setForgotSent(false); }}
            style={{
              background: "transparent", border: "none",
              cursor: isDisabled ? "not-allowed" : "pointer",
              color: "var(--text-muted)",
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, padding: "4px 0", marginBottom: 28,
            }}
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>

          <motion.h2
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}
          >
            {emailMode === "login" ? "Sign In" : "Create Account"}
          </motion.h2>
          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{
              fontSize: 14, color: "var(--text-muted)",
              marginTop: 6, marginBottom: 28,
            }}
          >
            {emailMode === "login"
              ? "Welcome back! Sign in to your account."
              : "Create an account to save your progress."}
          </motion.p>

          {forgotSent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(37,99,235,0.08)",
                borderRadius: radius.sm,
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              <CheckCircle size={28} color="#2563EB" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                Check your email
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                We've sent a password reset link to{" "}
                <span style={{ fontWeight: 600 }}>{emailForm.email}</span>
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setForgotSent(false); setMode("welcome"); }}
                style={{
                  background: "transparent", border: "none",
                  cursor: "pointer", fontSize: 13, fontWeight: 500,
                  color: "var(--accent)", marginTop: 16, padding: "6px 12px",
                }}
              >
                Back to Sign In
              </motion.button>
            </motion.div>
          ) : (
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm((p) => ({ ...p, email: e.target.value }))}
                  style={inputStyle}
                  autoFocus
                  disabled={isDisabled}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={emailMode === "signup" ? "At least 6 characters" : "Enter your password"}
                    value={emailForm.password}
                    onChange={(e) => setEmailForm((p) => ({ ...p, password: e.target.value }))}
                    style={{ ...inputStyle, paddingRight: 44 }}
                    disabled={isDisabled}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent", border: "none",
                      cursor: "pointer", color: "var(--text-muted)", padding: 4,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {emailMode === "login" && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isDisabled}
                  onClick={handleForgotPassword}
                  style={{
                    background: "transparent", border: "none",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    fontSize: 12, fontWeight: 500,
                    color: "var(--accent)", padding: 0,
                    textAlign: "left", marginTop: -4,
                  }}
                >
                  Forgot password?
                </motion.button>
              )}

              {emailError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 6,
                    fontSize: 12, color: "var(--red)", margin: 0,
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{emailError}</span>
                </motion.div>
              )}

              <motion.button
                whileHover={isDisabled ? {} : { scale: 1.015, y: -1 }}
                whileTap={isDisabled ? {} : { scale: 0.985 }}
                type="submit"
                disabled={isDisabled}
                style={{
                  width: "100%", padding: "14px 20px",
                  background: isDisabled ? "var(--bg-card3)" : "#2563EB",
                  border: "none",
                  borderRadius: radius.md, cursor: isDisabled ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  fontSize: 14, fontWeight: 600, color: "#FFFFFF",
                  transition: "all 0.2s",
                  marginTop: 4,
                }}
              >
                {isDisabled ? (
                  <>
                    <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} />
                    <span>{emailMode === "login" ? "Signing in..." : "Creating account..."}</span>
                  </>
                ) : emailMode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </form>
          )}

          {!forgotSent && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isDisabled}
              onClick={() => {
                setEmailMode((p) => (p === "login" ? "signup" : "login"));
                setEmailError(null);
                setForgotSent(false);
              }}
              style={{
                background: "transparent", border: "none",
                cursor: isDisabled ? "not-allowed" : "pointer",
                fontSize: 13, fontWeight: 500,
                color: "var(--accent)", marginTop: 20,
                padding: "8px 0",
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              {emailMode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </motion.button>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function AuthScreen() {
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      <AuthScreenInner />
    </div>
  );
}
