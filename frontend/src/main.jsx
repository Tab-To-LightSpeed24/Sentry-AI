// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Analytics from "./Analytics";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./Login";
import './index.css';


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={{ color: "#fff", textAlign: "center" }}>🔒 Checking login...</p>;
  }

  return user ? children : <Login />;
}


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
