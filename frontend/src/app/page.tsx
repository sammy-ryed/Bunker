"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL ;

  // Helper to store auth
  function setAuth(token: string, isAdmin: boolean) {
    localStorage.setItem("token", token);
    localStorage.setItem("is_admin", isAdmin ? "true" : "false");
  }

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null; // prevent hydration mismatch

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    // Inline field validation
    if (!username || !password) {
      setMsg("Please enter both username and password");
      return;
    }

    setMsg("Logging in...");
    setLoading(true);

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
        } catch {}
        setMsg(errMsg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setAuth(data.access_token, data.is_admin);

      router.push(data.is_admin ? "/admin" : "/dashboard");
    } catch {
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center gap-6 min-h-screen justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <h1 className="text-4xl font-bold text-white text-center shadow-md mb-8">
        ☣ Apocalypse Bunker Queue ☣
      </h1>

      <form
        onSubmit={submit}
        className="bg-gray-900 p-8 rounded-3xl shadow-xl w-full max-w-sm flex flex-col gap-6 border border-gray-700"
      >
        <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
        <p className="text-sm text-gray-400 mb-4">Login to your Dashboard</p>

        {/* Instagram-style inputs */}
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-4 rounded-full bg-gray-800 border border-gray-600 placeholder-gray-500 focus:ring-4 focus:ring-pink-500 outline-none transition text-white"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-4 rounded-full bg-gray-800 border border-gray-600 placeholder-gray-500 focus:ring-4 focus:ring-pink-500 outline-none transition text-white"
          disabled={loading}
        />

        <button
          type="submit"
          className={`bg-pink-500 hover:bg-pink-600 transition text-white p-4 rounded-full font-semibold ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Enter the Bunker"}
        </button>

        {msg && <p className="text-sm text-red-400 mt-2">{msg}</p>}
      </form>
    </main>
  );
}
