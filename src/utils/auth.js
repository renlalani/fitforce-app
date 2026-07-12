import {
  auth,
  googleProvider,
  isFirebaseReady,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
} from "./firebase";

const FirebaseNotConfigured = "Firebase is not configured. Set VITE_FIREBASE_* environment variables.";

function getFirebaseErrorCode(error) {
  if (!error?.code) return "An unexpected error occurred. Please try again.";
  const map = {
    "auth/invalid-credential": "Invalid email or password. Please try again.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email using a different sign-in method.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/popup-blocked": "Popup was blocked. Please allow popups for this site.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Please check your connection.",
  };
  return map[error.code] || error.message || "An unexpected error occurred.";
}

export async function signInWithGoogle() {
  if (!isFirebaseReady()) throw new Error(FirebaseNotConfigured);
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      uid: user.uid,
      name: user.displayName || "User",
      email: user.email,
      photo: user.photoURL,
      provider: "google",
    };
  } catch (error) {
    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      return null;
    }
    throw new Error(getFirebaseErrorCode(error));
  }
}

export async function signUpWithEmail(email, password) {
  if (!isFirebaseReady()) throw new Error(FirebaseNotConfigured);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await sendEmailVerification(result.user).catch(() => {});
    }
    return {
      uid: result.user.uid,
      name: email.split("@")[0] || "User",
      email: result.user.email,
      photo: null,
      provider: "email",
      emailVerified: result.user.emailVerified,
    };
  } catch (error) {
    throw new Error(getFirebaseErrorCode(error));
  }
}

export async function signInWithEmail(email, password) {
  if (!isFirebaseReady()) throw new Error(FirebaseNotConfigured);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      uid: result.user.uid,
      name: result.user.displayName || email.split("@")[0] || "User",
      email: result.user.email,
      photo: result.user.photoURL,
      provider: "email",
      emailVerified: result.user.emailVerified,
    };
  } catch (error) {
    throw new Error(getFirebaseErrorCode(error));
  }
}

export async function resetPassword(email) {
  if (!isFirebaseReady()) throw new Error(FirebaseNotConfigured);
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(getFirebaseErrorCode(error));
  }
}

export async function signOut() {
  if (!isFirebaseReady()) throw new Error(FirebaseNotConfigured);
  await firebaseSignOut(auth);
}
