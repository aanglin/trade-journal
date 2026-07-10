// src/lib/storage.js

export function getTrades() {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem("trades");
  return saved ? JSON.parse(saved) : [];
}

export function saveTrades(trades) {
  localStorage.setItem("trades", JSON.stringify(trades));
}

export function getSettings() {
  if (typeof window === "undefined") {
    return {
      startingBalance: "",
      accountInitialized: false,
    };
  }

  const saved = localStorage.getItem("settings");

  return saved
    ? JSON.parse(saved)
    : {
        startingBalance: "",
        accountInitialized: false,
      };
}

export function saveSettings(settings) {
  localStorage.setItem("settings", JSON.stringify(settings));
}