"use client";
import { useEffect, useState } from "react";

type Me = {
  name: string;
  occupation: string;
  description: string;
  priority: number;
};

type Status = {
  status: "accepted" | "rejected" | "pending";
  position?: number;
  message: string;
};

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [msg, setMsg] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetch("http://localhost:8000/students/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: Me) => setMe(data));

    fetchStatus();
  }, []);

  function fetchStatus() {
    fetch("http://localhost:8000/queue/status", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: Status) => setStatus(data));
  }

  async function enterQueue() {
    setMsg("Submitting...");
    const res = await fetch("http://localhost:8000/queue/enter", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    setMsg(body.message || body.detail);
    setTimeout(fetchStatus, 1000);
  }

  return (
    <main className="flex flex-col gap-6">
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
          {status.position && (
            <p className="text-sm mt-1">Position: {status.position}</p>
          )}
        </div>
      )}

      {msg && <p className="text-gray-400 text-sm">{msg}</p>}
    </main>
  );
}
