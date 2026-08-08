import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    } catch (e) {
      console.error(`Failed to load key "${key}" from localStorage`, e);
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save key "${key}" to localStorage`, e);
    }
  }, [key, value]);

  return [value, setValue];
}
