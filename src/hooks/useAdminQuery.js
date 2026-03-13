import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AUTH_ERRORS = ['JWT expired', 'invalid claim', 'not authenticated', 'PGRST301', '401'];

function isAuthError(error) {
  if (!error) return false;
  const msg = (error.message ?? error.code ?? String(error)).toLowerCase();
  return AUTH_ERRORS.some(e => msg.includes(e.toLowerCase()));
}

/**
 * Wraps an async fetch function with:
 * - loading state
 * - error state
 * - automatic redirect to /admin/login on auth errors
 *
 * Usage:
 *   const { data, loading, error, run } = useAdminQuery(fetchFn, { runOnMount: true });
 */
export function useAdminQuery(fetchFn, { runOnMount = false } = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(runOnMount);
  const [error,   setError]   = useState(null);
  const navigate  = useNavigate();
  const mounted   = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const run = useCallback(async (...args) => {
    if (!mounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      if (!mounted.current) return;

      // Check if the result contains an auth error
      const err = result?.error ?? null;
      if (isAuthError(err)) {
        navigate('/admin/login', { replace: true, state: { error: 'Sesión expirada. Iniciá sesión nuevamente.' } });
        return;
      }
      if (err) {
        setError(err.message ?? 'Error desconocido');
      } else {
        setData(result?.data ?? result);
      }
    } catch (e) {
      if (!mounted.current) return;
      if (isAuthError(e)) {
        navigate('/admin/login', { replace: true, state: { error: 'Sesión expirada. Iniciá sesión nuevamente.' } });
      } else {
        setError(e.message ?? 'Error desconocido');
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [fetchFn, navigate]);

  useEffect(() => {
    if (runOnMount) run();
  }, []); // eslint-disable-line

  return { data, loading, error, run };
}
