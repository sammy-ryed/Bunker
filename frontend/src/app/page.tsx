"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [msg,setMsg] = useState("");
  const router = useRouter();

  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("Logging in...");
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const err = await res.json();
        setMsg(err.detail || "Login failed");
        return;
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("is_admin", data.is_admin);
      if (data.is_admin) router.push("/admin");
      else router.push("/dashboard");
    } catch (e) {
      setMsg("Network error");
    }
  }

  return (
    <main className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-bunker-glow">☣ Apocalypse Bunker Queue ☣</h1>
      <form onSubmit={submit} className="bg-bunker-card p-6 rounded-2xl shadow-lg w-full flex flex-col gap-4">
        <input
          placeholder="Username"
          value={username}
          onChange={e=>setUsername(e.target.value)}
          className="p-3 rounded bg-bunker-bg border border-gray-700 focus:ring-2 focus:ring-bunker-accent outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          className="p-3 rounded bg-bunker-bg border border-gray-700 focus:ring-2 focus:ring-bunker-accent outline-none"
        />
        <button type="submit" className="bg-bunker-accent hover:bg-bunker-glow transition text-white p-3 rounded font-semibold">
          Enter the Bunker
        </button>
      </form>
      {msg && <p className="text-sm text-gray-400">{msg}</p>}
    </main>
  );
}
