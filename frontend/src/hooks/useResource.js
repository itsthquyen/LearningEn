import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export default function useResource(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    api(path, { signal: controller.signal }).then(setData).catch((err) => { if (err.name !== 'AbortError') setError(err); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, revision]);
  return { data, error, loading, reload };
}
