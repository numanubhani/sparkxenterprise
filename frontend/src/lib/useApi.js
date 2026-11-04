import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// Small data-fetching hook: const { data, error, loading, reload, setData } = useApi('/api/...')
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: '', loading: !!path });

  const load = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const data = await api(path);
      setState({ data, error: '', loading: false });
    } catch (err) {
      setState({ data: null, error: err.message, loading: false });
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load, setData: (data) => setState((s) => ({ ...s, data: typeof data === 'function' ? data(s.data) : data })) };
}
