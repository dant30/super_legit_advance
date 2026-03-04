import { useCallback, useEffect, useRef, useState } from "react";

function parseValue(raw, fallback) {
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function useLocalStorage(key, initialValue) {
  const initialRef = useRef(initialValue);

  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    return parseValue(window.localStorage.getItem(key), initialRef.current);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const next = parseValue(window.localStorage.getItem(key), initialRef.current);
    setValue((prev) => {
      if (Object.is(prev, next)) return prev;
      return next;
    });
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore storage quota/security errors; keep in-memory state
    }
  }, [key, value])

  useEffect(() => {
    if (typeof window === "undefined") return
    const onStorage = (event) => {
      if (event.key !== key) return
      setValue(parseValue(event.newValue, initialRef.current))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  const remove = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    setValue(initialRef.current);
  }, [key]);

  const update = useCallback((nextValueOrUpdater) => {
    setValue((prev) =>
      typeof nextValueOrUpdater === 'function' ? nextValueOrUpdater(prev) : nextValueOrUpdater
    )
  }, [])

  return [value, update, remove];
}

export default useLocalStorage;
