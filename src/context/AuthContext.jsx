import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    role: "Admin",
    fullName: "Sabin Devkota",
  });

  if (!localStorage.getItem("chitospare_token")) {
    localStorage.setItem("chitospare_token", "dev-bypass-token");
  }
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
