// src/Login.jsx
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";

export default function Login() {
  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "10rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>🛰️ Sentry AI</h1>
      <p>Secure Review Access</p>
      <button onClick={login} style={{ fontSize: "1.2rem", padding: "0.5rem 1.2rem" }}>
        🔐 Sign in with Google
      </button>
    </div>
  );
}
