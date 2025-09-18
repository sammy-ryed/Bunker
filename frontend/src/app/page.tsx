"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // fallback for dev

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("Logging in...");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        let errMsg = "Login failed";
        try {
          const err = await res.json();
          errMsg = err.detail || errMsg;
        } catch {
          /* ignore parsing errors */
        }
        setMsg(errMsg);
        return;
      }

      const data = await res.json();

      // Save token + admin flag (safe for client)
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("is_admin", JSON.stringify(data.is_admin));
      }

      setMsg("Login successful! Redirecting...");

      // Redirect after token is saved
      setTimeout(() => {
        if (data.is_admin) router.push("/admin");
        else router.push("/dashboard");
      }, 100);
    } catch (err) {
      console.error("Login error:", err);
      setMsg("Network error. Please try again.");
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: "50px auto", padding: 20 }}>
      <h1 style={{ fontSize: 24 }}>Apocalypse Bunker Queue — Login</h1>
      <form onSubmit={submit} style={{ marginTop: 20 }}>
        <label>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: 8, width: "100%", marginTop: 4 }}
        />
        <br />
        <label style={{ marginTop: 12 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 8, width: "100%", marginTop: 4 }}
        />
        <br />
        <button
          type="submit"
          style={{
            padding: 10,
            width: "100%",
            marginTop: 16,
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
      <p style={{ marginTop: 12, color: "gray" }}>{msg}</p>
      <p style={{ marginTop: 16, fontSize: 12, color: "gray" }}>
        Students and Admin use the same login endpoint. Admin accounts have{" "}
        <code>is_admin=true</code>.
      </p>
    </main>
  );
}
