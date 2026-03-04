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
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  const remove = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    setValue(initialRef.current);
  }, [key]);

  return [value, setValue, remove];
}

export default useLocalStorage;
