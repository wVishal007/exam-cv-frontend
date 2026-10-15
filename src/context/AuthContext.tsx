import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProfile } from "../api/auth";
import { purgeAccountData } from "../lib/accountData";
import type { User } from "../types";

interface AuthContextValue {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [hasToken, setHasToken] = useState<boolean>(
    !!localStorage.getItem("access_token")
  );

  // Set once the first 401 has been processed so parallel failed requests
  // (profile + history + templates all firing at once on app load) don't each
  // trigger a navigation. Reset on the next successful sign-in.
  const expiredRef = useRef(false);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: hasToken,
    staleTime: Infinity,
    retry: false,
  });

  // The axios interceptor clears localStorage on a 401 but cannot reach React
  // state, which used to leave `hasToken` true while the profile query failed.
  // The result was a user stranded on a protected page with no way to sign out.
  // Derive auth from the 401 instead of syncing it into state.
  const isUnauthorized =
    !!error &&
    typeof error === "object" &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 401;

  const isAuthenticated = hasToken && !isUnauthorized;

  useEffect(() => {
    if (!isUnauthorized) return;
    // Tokens are already gone (cleared by the interceptor); drop the cached
    // profile so it cannot be served on the next sign-in.
    queryClient.removeQueries({ queryKey: ["profile"] });
  }, [isUnauthorized, queryClient]);

  useEffect(() => {
    if (!isAuthenticated) return;

    function handleUnauthorized() {
      if (expiredRef.current) return;
      expiredRef.current = true;

      purgeAccountData(queryClient);
      setHasToken(false);

      // No refresh endpoint exists (deliberately — this is a single-token
      // design). The session is simply over; tell the login page why.
      navigate("/login", { replace: true, state: { reason: "expired" } });
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [isAuthenticated, queryClient, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading: hasToken && isLoading && !isUnauthorized,
      setTokens: (access, refresh) => {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        setHasToken(true);
        expiredRef.current = false;
      },
      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setHasToken(false);
        // Drop cached rows, otherwise signing in as a different account in the
        // same tab serves the previous user's data.
        purgeAccountData(queryClient);
      },
    }),
    [user, isAuthenticated, hasToken, isLoading, isUnauthorized, queryClient]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}