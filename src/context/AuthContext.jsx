import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { getProfile } from "../services/auth";
import { isAdminEmail } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const safetyTimer = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 2000);

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        const session = data?.session || null;

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const fallbackProf = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
            role: isAdminEmail(session.user.email) ? "admin" : "customer"
          };
          try {
            const p = await getProfile(session.user.id);
            if (isMounted) setProfile(p || fallbackProf);
          } catch {
            if (isMounted) setProfile(fallbackProf);
          }
        } else {
          // Check local demo session fallback
          const localDemoUser = JSON.parse(localStorage.getItem("nkeys-demo-user") || "null");
          if (localDemoUser && isMounted) {
            setUser(localDemoUser);
            setProfile({
              id: localDemoUser.id,
              email: localDemoUser.email,
              name: localDemoUser.user_metadata?.name || localDemoUser.email.split("@")[0],
              role: isAdminEmail(localDemoUser.email) ? "admin" : "customer"
            });
          } else if (isMounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("Auth session init error:", err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      }
    }

    initSession();

    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        const fallbackProf = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          role: isAdminEmail(session.user.email) ? "admin" : "customer"
        };
        try {
          const p = await getProfile(session.user.id);
          if (isMounted) setProfile(p || fallbackProf);
        } catch {
          if (isMounted) setProfile(fallbackProf);
        }
      } else {
        const localDemoUser = JSON.parse(localStorage.getItem("nkeys-demo-user") || "null");
        if (localDemoUser && isMounted) {
          setUser(localDemoUser);
          setProfile({
            id: localDemoUser.id,
            email: localDemoUser.email,
            name: localDemoUser.user_metadata?.name || localDemoUser.email.split("@")[0],
            role: isAdminEmail(localDemoUser.email) ? "admin" : "customer"
          });
        } else if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      }
      if (isMounted) setLoading(false);
    });

    const subscription = authListener?.data?.subscription;

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription?.unsubscribe?.();
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    try {
      localStorage.clear();
    } catch (e) {
      console.error("localStorage clear error:", e);
    }
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    profile,
    loading,
    logout,
    isAdmin: Boolean(user && isAdminEmail(user.email)),
    isCustomer: Boolean(user && !isAdminEmail(user.email))
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
