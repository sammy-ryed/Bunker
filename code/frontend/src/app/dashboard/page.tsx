"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Student {
  name: string;
  occupation: string;
  priority: number;
  description?: string;
}

interface QueueStatus {
  status: string;
  message?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [me, setMe] = useState<Student | null>(null);
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [msg, setMsg] = useState<string>("");

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }

    async function fetchData() {
      try {
        // Fetch user info
        
        const meRes = await fetch("http://localhost:8000/students/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meRes.ok) throw new Error("Failed to fetch user data");
        const meData = await meRes.json();
        setMe(meData);

        // Fetch queue status
        await fetchStatus();
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        router.push("/");
      }
    }

    fetchData();
  }, [token, router]);

  async function fetchStatus() {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/queue/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch queue status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
      setStatus({ status: "unknown", message: "Network error" });
    }
  }

  async function enterQueue() {
    if (!token) return;
    setMsg("Submitting...");
    try {
      const res = await fetch("http://localhost:8000/queue/enter", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) setMsg(body.detail || JSON.stringify(body));
      else {
        setMsg(body.message);
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
      setMsg("Network error");
    }
  }

  useEffect(() => {
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (!token) return <p>Loading...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ fontSize: 22 }}>Student Dashboard</h1>

      {me && (
        <div style={{ marginTop: 10, padding: 12, border: "1px solid #ccc", borderRadius: 8 }}>
          <strong>{me.name}</strong> — {me.occupation} <br />
          Priority: <strong>{me.priority}</strong>
          {me.description && <p style={{ marginTop: 8 }}>{me.description}</p>}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button
          onClick={enterQueue}
          style={{
            padding: 12,
            width: "100%",
            fontSize: 16,
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Enter the Queue to Save Yourself
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Status</h3>
        <pre style={{ background: "#f5f5f5", padding: 10, borderRadius: 6 }}>
          {status ? JSON.stringify(status, null, 2) : "No status yet"}
        </pre>
        <button
          onClick={fetchStatus}
          style={{ marginTop: 8, padding: 8, borderRadius: 4, cursor: "pointer" }}
        >
          Refresh Status
        </button>
      </div>

      {msg && <p style={{ color: "gray", marginTop: 16 }}>{msg}</p>}
    </main>
  );
}
