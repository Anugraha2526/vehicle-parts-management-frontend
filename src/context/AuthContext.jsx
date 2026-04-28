import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("chitospare_token");
    if (!stored) {
      // temporary dev token so api calls pass through during testing
      localStorage.setItem("chitospare_token", "dev-bypass-token");
    }
    return { role: "Admin", fullName: "Sabin Devkota" };
  });
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
