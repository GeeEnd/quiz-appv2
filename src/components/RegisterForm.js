// // src/components/RegisterForm.js
// import React, { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// export default function RegisterForm() {
//   const { register, login } = useAuth();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     section: "",
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       await register(formData.name, formData.section, formData.email, formData.password);
//       // ✅ Auto-login after register
//       await login(formData.email, formData.password);
//       navigate("/quiz");
//     } catch (err) {
//       setError("❌ " + err.message);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Register</h2>
//       <input type="text" name="name" placeholder="Full Name" onChange={handleChange} value={formData.name} required />
//       <input type="text" name="section" placeholder="Section" onChange={handleChange} value={formData.section} required />
//       <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
//       <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} required />
//       <button type="submit">Register</button>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </form>
//   );
// }
// src/components/RegisterForm.js
import React, { useState } from "react";
import { registerUser } from "../services/sheetsdb";
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
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email) => {
    return email.endsWith("@student.buksu.edu.ph");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isValidEmail(formData.email)) {
      setMessage("❌ Only @student.buksu.edu.ph emails are allowed.");
      return;
    }

    try {
      await registerUser(formData);
      const user = await login(formData.email, formData.password);
      setMessage("✅ Registered & logged in successfully!");
      setFormData({ name: "", section: "", email: "", password: "" });
      navigate("/quiz");
    } catch (err) {
      setMessage("❌ Registration failed: " + err.message);
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
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
          Create an Account
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {message && (
          <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            sx={{ mb: 2 }}
            helperText="Use your @student.buksu.edu.ph email"
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>
            Register
          </Button>

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            Already have an account?{" "}
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate("/login")}
              sx={{ textTransform: "none", fontWeight: "bold", p: 0, minWidth: "auto" }}
            >
              Login
            </Button>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}
