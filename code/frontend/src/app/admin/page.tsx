"use client";
import { useEffect, useState } from "react";

interface QueueResult {
  position?: number;
  name: string;
  accepted: boolean;
}

export default function AdminPage() {
  const [capacity, setCapacity] = useState<string>("");
  const [results, setResults] = useState<QueueResult[]>([]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token || localStorage.getItem("is_admin") !== "true") {
      window.location.href = "/";
      return;
    }
    fetchResults();
  }, []);

  async function setCap(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await fetch("http://localhost:8000/admin/set_capacity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ capacity: Number(capacity) }),
    });
    alert("Capacity set. You can now process the queue.");
  }

  async function processQueue() {
    const res = await fetch("http://localhost:8000/admin/process", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (!res.ok) {
      alert("Error processing queue");
      return;
    }
    setResults([...body.accepted, ...body.rejected]);
  }

  async function fetchResults() {
    const res = await fetch("http://localhost:8000/admin/results", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setResults(await res.json());
    }
  }

  return (
    <main>
      <h1 style={{ fontSize: 22 }}>Admin Dashboard</h1>

      <section style={{ marginTop: 12 }}>
        <form onSubmit={setCap}>
          <label>Set bunker capacity (N)</label>
          <br />
          <input
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            style={{ padding: 8 }}
          />
          <button type="submit" style={{ marginLeft: 8, padding: 8 }}>
            Set
          </button>
        </form>
        <div style={{ marginTop: 12 }}>
          <button onClick={processQueue} style={{ padding: 10 }}>
            Process Queue Now
          </button>
          <button
            onClick={fetchResults}
            style={{ padding: 10, marginLeft: 8 }}
          >
            Refresh Results
          </button>
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Last Results</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Pos</th>
              <th>Name</th>
              <th>Accepted</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
                <td>{r.position ?? "-"}</td>
                <td>{r.name}</td>
                <td>{r.accepted ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
