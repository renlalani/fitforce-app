export function safeGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    try {
      const raw = localStorage.getItem(key);
      return raw;
    } catch {
      return fallback;
    }
  }
}

export function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function clearAllFitForceData() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("fitforce-")) keys.push(k);
  }
  keys.forEach((k) => safeRemove(k));
}

export function getAllFitForceData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("fitforce-")) {
      data[k] = safeGet(k);
    }
  }
  return data;
}
