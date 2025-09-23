"use client";
import { useEffect, useState } from "react";

type Me = { name: string; occupation: string; description: string; priority: number };
type Status = { status: "accepted" | "rejected" | "pending"; position?: number; message: string };

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [msg, setMsg] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setHasMounted(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/students/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setMe);

    fetchStatus(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fetchStatus(token: string) {
    fetch(`${API_URL}/queue/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setStatus);
  }

  async function enterQueue() {
    const token = localStorage.getItem("token");
    if (!token) return;

    setMsg("Submitting...");
    const res = await fetch(`${API_URL}/queue/enter`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    setMsg(body.message || body.detail);
    setTimeout(() => fetchStatus(token), 1000);
  }

  if (!hasMounted) return null;

  return (
    <main className="flex flex-col gap-6 px-4">
      <h1 className="text-2xl font-bold text-bunker-glow">Survivor Dashboard</h1>

      {me && (
        <div className="bg-bunker-card p-4 rounded-xl">
          <h2 className="text-xl font-semibold">{me.name}</h2>
          <p className="text-sm text-gray-400">{me.occupation}</p>
          <p className="mt-2">{me.description}</p>
          <p className="text-sm mt-2">
            Priority: <span className="font-bold">{me.priority}</span>
          </p>
        </div>
      )}

      <button
        onClick={enterQueue}
        className="bg-bunker-accent hover:bg-bunker-glow transition p-4 rounded-xl font-bold"
      >
        Enter the Queue to Save Yourself
      </button>

      {status && (
        <div className="bg-bunker-card p-4 rounded-xl">
          <h3 className="font-semibold">Status</h3>
          <p
            className={`mt-2 text-lg ${
              status.status === "accepted"
                ? "text-green-400"
                : status.status === "rejected"
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {status.message}
          </p>
          {status.position && <p className="text-sm mt-1">Position: {status.position}</p>}
        </div>
      )}

      {msg && <p className="text-gray-400 text-sm">{msg}</p>}
    </main>
  );
}
