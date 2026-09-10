import { useCallback, useEffect, useRef, useState } from 'react';
import { useLiveRefresh } from '@/lib/realtime';

export function useAsyncData<T>(fn: () => Promise<T>, deps: React.DependencyList = [], live = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useLiveRefresh(live ? reload : null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fnRef.current()
      .then((d) => {
        if (active) {
          setData(d);
          setError(null);
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  return { data, error, loading, reload };
}