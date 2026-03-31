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

  useEffect(() => {
    const checkAdminRole = async (userId: string): Promise<boolean> => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          setAuthState({
            isAuthenticated: true,
            isAdmin,
            userEmail: session.user.email || null,
            loading: false,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            userEmail: null,
            loading: false,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user.id);
        setAuthState({
          isAuthenticated: true,
          isAdmin,
          userEmail: session.user.email || null,
          loading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          userEmail: null,
          loading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { ...authState, signOut };
};
