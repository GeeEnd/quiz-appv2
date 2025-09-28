import React from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginButton() {
  const { user, login, logout } = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <img src={user.image} alt="profile" style={{ width: 40, borderRadius: "50%" }} />
          <span style={{ marginLeft: "8px" }}>{user.name}</span>
          <button onClick={logout} style={{ marginLeft: "10px" }}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login with Google</button>
      )}
    </div>
  );
}
