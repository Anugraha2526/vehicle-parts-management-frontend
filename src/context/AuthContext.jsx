import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ role: "Admin", name: "Aarav Sharma" });
  const isAuthenticated = Boolean(user);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login: (nextUser) => setUser(nextUser),
      logout: () => setUser(null),
    }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
