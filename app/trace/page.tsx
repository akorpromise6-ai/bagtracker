"use client";

import { FormEvent, useMemo, useState } from "react";
import type { FlowGraph, TraceRequest } from "@/lib/flow/contracts";

const initialRequest: TraceRequest = {
  wallet: "WalletA111",
  signature: "sig-1-seed",
  token: "SOL",
  amountThreshold: 1,
  hopLimit: 6,
  chain: "solana",
};

function fmtAmount(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function TracePage() {
  const [form, setForm] = useState<TraceRequest>(initialRequest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<FlowGraph | null>(null);

  const summary = useMemo(() => {
    if (!flow) return null;
    return {
      nodes: flow.nodes.length,
      edges: flow.edges.length,
      cycles: flow.cyclesDetected,
      merges: flow.mergesDetected,
    };
  }, [flow]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/trace", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`Trace request failed with status ${response.status}`);
      }

      const data = (await response.json()) as FlowGraph;
      setFlow(data);
    } catch (traceError) {
      setError(traceError instanceof Error ? traceError.message : "Trace request failed");
      setFlow(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 20px", display: "grid", gap: 20 }}>
      <section style={{ display: "grid", gap: 8 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700 }}>Money Flow Trace (MVP)</h1>
        <p style={{ opacity: 0.78 }}>
          Solana-only trace prototype answering: <strong>Where did the money go?</strong>
        </p>
      </section>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, padding: 16, border: "1px solid #2f2f2f", borderRadius: 12 }}>
        <label>
          Wallet
          <input value={form.wallet} onChange={(e) => setForm((prev) => ({ ...prev, wallet: e.target.value }))} style={{ width: "100%" }} />
        </label>
        <label>
          Transaction Signature
          <input value={form.signature} onChange={(e) => setForm((prev) => ({ ...prev, signature: e.target.value }))} style={{ width: "100%" }} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          <label>
            Token
            <input value={form.token} onChange={(e) => setForm((prev) => ({ ...prev, token: e.target.value.toUpperCase() }))} style={{ width: "100%" }} />
          </label>
          <label>
            Amount Threshold
            <input
              type="number"
              min={0}
              value={form.amountThreshold}
              onChange={(e) => setForm((prev) => ({ ...prev, amountThreshold: Number(e.target.value || 0) }))}
              style={{ width: "100%" }}
            />
          </label>
          <label>
            Hop Limit
            <input
              type="number"
              min={1}
              value={form.hopLimit}
              onChange={(e) => setForm((prev) => ({ ...prev, hopLimit: Number(e.target.value || 1) }))}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <button type="submit" disabled={loading} style={{ width: "fit-content", padding: "8px 14px" }}>
          {loading ? "Tracing..." : "Run Trace"}
        </button>
      </form>

      {error ? (
        <section style={{ padding: 12, borderRadius: 10, border: "1px solid #f66", color: "#f66" }}>{error}</section>
      ) : null}

      {summary ? (
        <section style={{ display: "grid", gap: 8, padding: 16, border: "1px solid #2f2f2f", borderRadius: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Flow Summary</h2>
          <p>
            {flow?.flowId} · Nodes: {summary.nodes} · Edges: {summary.edges} · Merges: {summary.merges} · Cycles: {summary.cycles}
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {flow?.edges.map((edge) => (
              <div key={edge.id} style={{ padding: 10, border: "1px solid #2f2f2f", borderRadius: 10 }}>
                <strong>{edge.from}</strong> → <strong>{edge.to}</strong> · {fmtAmount(edge.amount)} {edge.token} · hop {edge.hop}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
