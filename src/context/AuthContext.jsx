import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return null;
      const parsed = JSON.parse(storedUser);
      // reject anything that isn't a real JWT (dev bypass tokens, stale test data)
      if (!parsed?.token?.startsWith("eyJ")) {
        localStorage.removeItem("user");
        localStorage.removeItem("chitospare_token");
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(user) && Boolean(localStorage.getItem("chitospare_token"));

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login: (nextUser) => {
        localStorage.setItem("user", JSON.stringify(nextUser));
        if (nextUser?.token) {
          localStorage.setItem("chitospare_token", nextUser.token);
        }
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem("user");
        localStorage.removeItem("chitospare_token");
        setUser(null);
      },
    }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
