"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Jurisdiction = "US" | "UK";

type JurisdictionContextValue = {
  jurisdiction: Jurisdiction;
  setJurisdiction: (value: Jurisdiction) => void;
  hydrated: boolean;
};

const JurisdictionContext = createContext<JurisdictionContextValue | null>(null);

const STORAGE_KEY = "legal-ai:jurisdiction";

export function JurisdictionProvider({ children }: { children: ReactNode }) {
  const [jurisdiction, setJurisdictionState] = useState<Jurisdiction>("US");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "US" || stored === "UK") {
          setJurisdictionState(stored);
        }
      } catch {
        // 存储不可用时保持默认
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function setJurisdiction(value: Jurisdiction) {
    setJurisdictionState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // 存储不可用时仅保留内存态
    }
  }

  return (
    <JurisdictionContext.Provider
      value={{ jurisdiction, setJurisdiction, hydrated }}
    >
      {children}
    </JurisdictionContext.Provider>
  );
}

export function useJurisdiction(): JurisdictionContextValue {
  const context = useContext(JurisdictionContext);
  if (!context) {
    throw new Error("useJurisdiction 必须在 JurisdictionProvider 内使用");
  }
  return context;
}