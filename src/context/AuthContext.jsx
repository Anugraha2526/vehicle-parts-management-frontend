import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = Boolean(user) && Boolean(localStorage.getItem("chitospare_token"));

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login: (nextUser) => {
        localStorage.setItem("user", JSON.stringify(nextUser));
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
