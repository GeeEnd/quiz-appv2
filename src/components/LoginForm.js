// src/components/LoginForm.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Divider,
} from "@mui/material";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password);
      alert(`✅ Welcome ${user.name}!`);

      if (user.email.endsWith("@student.buksu.edu.ph")) {
        navigate("/quiz");
      } else if (user.email.endsWith("@buksu.edu.ph")) {
        navigate("/teacher");
      } else {
        setError("❌ Unauthorized email domain.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h5" component="h2" sx={{ mb: 2, textAlign: "center" }}>
          Login to Your Account
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            variant="outlined"
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1.5, textTransform: "none" }}
          >
            Login
          </Button>

          <Typography variant="body2" sx={{ mt: 3 }}>
  Don’t have an account?{" "}
  <Button
    variant="text"
    color="primary"
    onClick={() => navigate("/register")}
    sx={{ textTransform: "none", fontWeight: "bold", p: 0, minWidth: "auto" }}
  >
    Register here
  </Button>
</Typography>

        </form>
      </Paper>
    </Box>
  );
}
