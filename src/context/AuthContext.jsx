import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase.js";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

// status: "loading" | "anonymous" | "admin" | "forbidden" | "error"
export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Asks the API whether this Supabase session belongs to an admin.
  // Uses the session's token directly (calling other supabase.auth methods from inside an
  // onAuthStateChange callback can deadlock). Returns { status, message } for callers.
  const verify = useCallback(async (session) => {
    const done = (s, message = "") => {
      setStatus(s);
      setError(message);
      return { status: s, message };
    };
    if (!session) {
      setUser(null);
      return done("anonymous");
    }
    try {
      const me = await api.get("/admin/me", { token: session.access_token });
      if (!me?.id) throw new Error("Unexpected response from the server.");
      setUser(me);
      return done("admin");
    } catch (e) {
      setUser(null);
      if (e.status === 403) return done("forbidden", "This account is not an administrator.");
      if (e.status === 401) return done("anonymous", "The server did not accept this session. Please sign in again.");
      return done("error", `Could not reach the API to verify your account: ${e.message}`);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => verify(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Deferred so the callback returns immediately (see note above).
      if (event === "SIGNED_OUT") setTimeout(() => verify(null), 0);
      else if (event === "TOKEN_REFRESHED") setTimeout(() => verify(session), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [verify]);

  const login = async (email, password) => {
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data?.session) throw new Error("Invalid email or password");
    const result = await verify(data.session);
    if (result.status !== "admin") {
      await supabase.auth.signOut();
      throw new Error(result.message || "Sign-in failed.");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return <AuthContext.Provider value={{ status, user, error, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);