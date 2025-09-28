import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/sheetsdb";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ new

  useEffect(() => {
    const storedUser = localStorage.getItem("quizUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // ✅ done loading
  }, []);

  const login = async (email, password) => {
    const foundUser = await loginUser({ email, password });
    if (!foundUser) throw new Error("❌ Invalid email or password");

    const normalizedUser = {
      name: foundUser.Name || foundUser.name,
      email: foundUser.Email || foundUser.email,
      section: foundUser.Section || foundUser.section,
    };

    setUser(normalizedUser);
    localStorage.setItem("quizUser", JSON.stringify(normalizedUser));
    return normalizedUser;

    
  };
console.log("Stored user:", localStorage.getItem("quizUser"));

  const register = async (name, section, email, password) => {
    await registerUser({ name, section, email, password });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("quizUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
