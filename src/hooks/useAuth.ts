import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    userEmail: null,
    loading: true,
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: never leave the UI stuck on the spinner
    const safety = setTimeout(() => {
      if (!mounted) return;
      setAuthState((s) => (s.loading ? { ...s, loading: false } : s));
    }, 5000);

    // 1) Synchronous-only auth listener (no awaits inside — avoids Supabase deadlock)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUserId(session.user.id);
        // Keep loading=true; admin-check effect will flip it off
        setAuthState((s) => ({
          ...s,
          isAuthenticated: true,
          userEmail: session.user.email || null,
          loading: true,
        }));
      } else {
        setUserId(null);
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          userEmail: null,
          loading: false,
        });
      }
    });

    // 2) Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUserId(session.user.id);
        setAuthState((s) => ({
          ...s,
          isAuthenticated: true,
          userEmail: session.user.email || null,
          loading: true,
        }));
      } else {
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          userEmail: null,
          loading: false,
        });
      }
    }).catch(() => {
      if (!mounted) return;
      setAuthState((s) => ({ ...s, loading: false }));
    });

    return () => {
      mounted = false;
      clearTimeout(safety);
      subscription.unsubscribe();
    };
  }, []);

  // Check admin role outside of the auth callback (avoids deadlock)
  useEffect(() => {
    if (!userId) {
      setAuthState((s) => ({ ...s, isAdmin: false }));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        if (cancelled) return;
        setAuthState((s) => ({ ...s, isAdmin: !!data, loading: false }));
      } catch {
        if (cancelled) return;
        setAuthState((s) => ({ ...s, loading: false }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { ...authState, signOut };
};
