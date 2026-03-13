import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// ─── Profile cache (sessionStorage, 10 min TTL) ───────────────────────────────
const CACHE_KEY = 'lugagy-profile-cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(userId) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { uid, data, ts } = JSON.parse(raw);
    if (uid !== userId || Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCached(userId, data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ uid: userId, data, ts: Date.now() }));
  } catch {}
}

function clearCache() {
  try { sessionStorage.removeItem(CACHE_KEY); } catch {}
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const mounted  = useRef(true);

  const fetchProfile = useCallback(async (userId, { force = false } = {}) => {
    // Return cached version unless forced
    if (!force) {
      const cached = getCached(userId);
      if (cached) {
        if (mounted.current) setProfile(cached);
        return;
      }
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('nombre, rol, activo')
        .eq('id', userId)
        .single();
      if (mounted.current) {
        setProfile(data ?? null);
        if (data) setCached(userId, data);
      }
    } catch {
      if (mounted.current) setProfile(null);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;

    // 1. Get current session (localStorage — no network)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted.current) return;
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user.id).finally(() => {
          if (mounted.current) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // 2. React to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted.current) return;

      if (event === 'SIGNED_IN') {
        setSession(s);
        if (s?.user) fetchProfile(s.user.id);
      }

      if (event === 'TOKEN_REFRESHED') {
        // Only update session — skip profile re-fetch to avoid reload spam
        setSession(s);
      }

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        clearCache();
        setLoading(false);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    try {
      localStorage.removeItem('lugagy-admin-session');
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-') && k.includes('auth-token'))
        .forEach(k => localStorage.removeItem(k));
    } catch (_) {}

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data?.user) {
      await fetchProfile(data.user.id, { force: true });
      setLoading(false);
    }

    return { data, error };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    setProfile(null);
    clearCache();
    await supabase.auth.signOut();
  }, []);

  const isSuperAdmin = profile?.rol === 'super_admin' && profile?.activo === true;
  const isAdmin      = (profile?.rol === 'super_admin' || profile?.rol === 'admin') && profile?.activo === true;
  const isWorker     = profile?.rol === 'worker' && profile?.activo === true;
  const canAccess    = isAdmin || isWorker;

  return (
    <AuthContext.Provider value={{ session, profile, loading, isSuperAdmin, isAdmin, isWorker, canAccess, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
