import { useState, useEffect } from 'react';

// ============================================================
// useDebounce — delays value updates to avoid excessive re-renders
// Used for the search bar (300ms delay)
// ============================================================

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
