"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type QueueResult = { position?: number; name: string; accepted: boolean };

export default function AdminPage() {
  const [capacity, setCapacity] = useState<string>("");
  const [results, setResults] = useState<QueueResult[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL ;

  useEffect(() => {
    setHasMounted(true);
    if (typeof window === "undefined") return;

    const t = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("is_admin") === "true";

    if (!t || !isAdmin) {
      router.push("/");
      return;
    }

    setToken(t);
    fetchResults(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function setCap(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/admin/set_capacity`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ capacity: Number(capacity) }),
      });

      if (!res.ok) throw new Error("Failed to set capacity");
      alert("Capacity set. You can now process the queue.");
    } catch {
      alert("Error setting capacity");
    }
  }

  async function processQueue() {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/admin/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) alert("Error processing queue");
      else setResults([...body.accepted, ...body.rejected]);
    } catch {
      alert("Network error while processing queue");
    }
  }

  async function fetchResults(tok?: string) {
    const authToken = tok || token;
    if (!authToken) return;

    try {
      const res = await fetch(`${API_URL}/admin/results`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) setResults(await res.json());
    } catch {}
  }

  if (!hasMounted) return null;

  return (
    <main style={{ padding: 20 }}>
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
          <button onClick={() => fetchResults()} style={{ padding: 10, marginLeft: 8 }}>
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
