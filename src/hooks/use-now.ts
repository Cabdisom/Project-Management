import { useEffect, useState } from 'react';

/** Current time in ms, refreshed on an interval so "today" and snooze checks stay correct. */
export function useNow(refreshMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);
  return now;
}
