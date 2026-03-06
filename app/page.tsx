"use client";
import { useState, useEffect, useCallback } from "react";

// ── Solana RPC (real on-chain data) ───────────────────────────────────────────
const RPC = "https://api.mainnet-beta.solana.com";

async function getSolBalance(pubkey: string): Promise<number> {
  try {
    const res = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [pubkey] }),
    });
    const data = await res.json();
    return (data.result?.value || 0) / 1e9;
  } catch { return 0; }
}

async function getTokenAccounts(pubkey: string): Promise<any[]> {
  try {
    const res = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "getTokenAccountsByOwner",
        params: [pubkey, { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }, { encoding: "jsonParsed" }],
      }),
    });
    const data = await res.json();
    return data.result?.value || [];
  } catch { return []; }
}

// ── Fetch from our secure API route ──────────────────────────────────────────
async function fetchBagsAPI(endpoint: string, wallet: string) {
  try {
    const res = await fetch(`/api/bags?endpoint=${endpoint}&wallet=${wallet}`);
    return await res.json();
  } catch { return null; }
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const fmt = (n: number, d = 2) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const short = (a: string) => a ? `${a.slice(0, 4)}…${a.slice(-4)}` : "";

// Deterministic fun degen stats from wallet (no external call needed)
function degenStats(pubkey: string, sol: number, tokens: number) {
  const rng = (seed: string, min: number, max: number) => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    return min + (Math.abs(h % 1000) / 1000) * (max - min);
  };
  const ri = (s: string, a: number, b: number) => Math.floor(rng(s, a, b));
  const score = Math.min(100, Math.floor(rng(pubkey + "d", 20, 90) + Math.min(sol * 2, 18) + Math.min(tokens, 12)));
  return {
    score,
    rugs: ri(pubkey + "r", 0, 22),
    diamond: ri(pubkey + "dm", 10, 100),
    calls: ri(pubkey + "c", 2, 55),
    hitRate: ri(pubkey + "h", 8, 70),
    pnl: rng(pubkey + "p", -70, 380),
    title: score >= 90 ? "DEGEN GOD 🌑" : score >= 75 ? "DIAMOND HANDS 💎" : score >= 55 ? "SEASONED APE 🦍" : score >= 35 ? "RUG SURVIVOR 🧟" : "PAPER HANDS 📄",
    theme: score >= 90 ? "god" : score >= 75 ? "diamond" : score >= 55 ? "ape" : "survivor",
  };
}

const THEMES: Record<string, any> = {
  god:      { bg: "linear-gradient(135deg,#0d0015,#1a0030,#0a001a)", acc: "#c084fc", glow: "rgba(192,132,252,0.4)", badge: "#7c3aed" },
  diamond:  { bg: "linear-gradient(135deg,#001220,#002040,#001530)", acc: "#67e8f9", glow: "rgba(103,232,249,0.35)", badge: "#0891b2" },
  ape:      { bg: "linear-gradient(135deg,#0f1a00,#1a2d00,#0a1200)", acc: "#86efac", glow: "rgba(134,239,172,0.3)", badge: "#15803d" },
  survivor: { bg: "linear-gradient(135deg,#1a0a00,#2d1500,#120800)", acc: "#fb923c", glow: "rgba(251,146,60,0.3)", badge: "#c2410c" },
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [wallet, setWallet] = useState<{ publicKey: string } | null>(null);
  const [sol, setSol] = useState(0);
  const [tokens, setTokens] = useState<any[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [degen, setDegen] = useState<any>(null);
  const [cardTheme, setCardTheme] = useState("god");
  const [copied, setCopied] = useState(false);
  const [bagsTokens, setBagsTokens] = useState<any[]>([]);
  const [bagsFees, setBagsFees] = useState<any>(null);
  const [bagsLoading, setBagsLoading] = useState(false);
  const SOL_PRICE = 178;

  const connect = useCallback(async () => {
    const phantom = (window as any).solana || (window as any).phantom?.solana;
    if (!phantom?.isPhantom) {
      alert("👻 Install Phantom from phantom.app to connect!");
      return;
    }
    setConnecting(true);
    try {
      const resp = await phantom.connect();
      const pk = resp.publicKey.toString();
      setWallet({ publicKey: pk });

      const [balance, tkns] = await Promise.all([getSolBalance(pk), getTokenAccounts(pk)]);
      setSol(balance);
      setTokens(tkns);
      setDegen(degenStats(pk, balance, tkns.length));

      // Fetch real Bags.fm data
      setBagsLoading(true);
      const [creators, fees] = await Promise.all([
        fetchBagsAPI("creators", pk),
        fetchBagsAPI("fees", pk),
      ]);
      if (creators?.success) setBagsTokens(creators.response?.tokens || []);
      if (fees?.success) setBagsFees(fees.response);
      setBagsLoading(false);

    } catch (err: any) {
      if (err.code !== 4001) alert("Connection failed: " + (err.message || "Unknown error"));
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = () => {
    setWallet(null); setSol(0); setTokens([]); setDegen(null);
    setBagsTokens([]); setBagsFees(null);
  };

  useEffect(() => {
    const p = (window as any).solana;
    if (!p) return;
    p.on?.("disconnect", disconnect);
    return () => p.off?.("disconnect", disconnect);
  }, []);

  const totalUsd = sol * SOL_PRICE;

  const copyCard = () => {
    if (!degen || !wallet) return;
    const text = `🎒 My BagTracker Degen Card\n${degen.title}\n\n◎ SOL: ${fmt(sol, 3)}\n⚡ Degen Score: ${degen.score}/100\n🧟 Rugs Survived: ${degen.rugs}\n📣 Calls: ${degen.calls} (${degen.hitRate}% hit)\n\nbagtracker.vercel.app`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  const tweet = () => {
    if (!degen) return;
    const t = `🎒 My Degen Card on BagTracker\n${degen.title}\n◎ ${fmt(sol,3)} SOL · ⚡ ${degen.score}/100 · 🧟 ${degen.rugs} rugs survived\n\nbagtracker.vercel.app @bagsfm`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, "_blank");
  };

  const theme = THEMES[cardTheme];

  return (
    <div style={{ minHeight: "100vh", background: "#070810", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      {/* BG */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 100% 60% at 50% 0%,rgba(124,58,237,0.07) 0%,transparent 65%)", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(7,8,16,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(124,58,237,0.15)", padding: "0 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect x="9" y="14" width="14" height="12" rx="3" fill="#9f7aea"/>
              <path d="M12 14v-2a4 4 0 018 0v2" stroke="#9f7aea" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <circle cx="16" cy="20" r="2" fill="#070810"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 18 }}>Bag<span style={{ color: "#9f7aea" }}>Tracker</span></span>
            <span style={{ fontSize: 10, background: "rgba(124,58,237,0.2)", color: "#a78bfa", padding: "2px 8px", borderRadius: 10, letterSpacing: 1 }}>SOLANA</span>
          </div>

          {wallet ? (
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ padding: "5px 12px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 20, fontSize: 12, color: "#a78bfa" }}>● Mainnet</span>
              <button onClick={disconnect} style={{ padding: "5px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>
                {short(wallet.publicKey)} ✕
              </button>
            </div>
          ) : (
            <button onClick={connect} disabled={connecting} style={{ padding: "8px 20px", background: "linear-gradient(135deg,#7c3aed,#9f7aea)", color: "#fff", border: "none", borderRadius: 20, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              {connecting ? "Connecting…" : "👻 Connect Phantom"}
            </button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Not connected */}
        {!wallet && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 64 }}>🎒</div>
            <h1 style={{ fontSize: 44, fontWeight: 900, margin: "16px 0 12px", letterSpacing: "-2px" }}>
              Track Your<br />
              <span style={{ background: "linear-gradient(90deg,#9f7aea,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Bags.</span>
            </h1>
            <p style={{ color: "#6b7280", maxWidth: 340, margin: "0 auto 32px", lineHeight: 1.7 }}>
              Connect Phantom to see your real SOL balance, Bags.fm token data, claimable fees, and generate your Degen Card.
            </p>
            <button onClick={connect} disabled={connecting} style={{ padding: "14px 40px", background: "linear-gradient(135deg,#7c3aed,#9f7aea)", color: "#fff", border: "none", borderRadius: 50, fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 0 50px rgba(124,58,237,0.4)" }}>
              {connecting ? "Connecting…" : "👻 Connect Phantom"}
            </button>
          </div>
        )}

        {/* Dashboard */}
        {wallet && degen && (
          <>
            {/* KPI Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 20 }}>
              {[
                { label: "SOL Balance", val: `◎ ${fmt(sol, 3)}`, col: "#9f7aea" },
                { label: "USD Value", val: `$${fmt(totalUsd)}`, col: "#67e8f9" },
                { label: "Degen Score", val: `${degen.score}/100`, col: "#fb923c" },
                { label: "Token Accounts", val: `${tokens.length}`, col: "#facc15" },
              ].map(k => (
                <div key={k.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "16px" }}>
                  <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{k.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: k.col }}>{k.val}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto" }}>
              {[
                { id: "dashboard", label: "◎ Portfolio" },
                { id: "bags", label: "🎒 Bags.fm Data" },
                { id: "degen", label: "🎴 Degen Card" },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 18px", background: tab === t.id ? "linear-gradient(135deg,#7c3aed,#9f7aea)" : "rgba(255,255,255,0.04)", color: tab === t.id ? "#fff" : "#9ca3af", border: "1px solid " + (tab === t.id ? "#7c3aed" : "rgba(255,255,255,0.07)"), borderRadius: 50, fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Portfolio Tab */}
            {tab === "dashboard" && (
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "26px" }}>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Total Portfolio</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: "#9f7aea", margin: "6px 0" }}>${fmt(totalUsd)}</div>
                  <div style={{ fontSize: 13, color: degen.pnl >= 0 ? "#4ade80" : "#f87171" }}>
                    {degen.pnl >= 0 ? "▲" : "▼"} {Math.abs(degen.pnl).toFixed(1)}% all-time
                  </div>
                  <div style={{ marginTop: 20, padding: "14px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 14, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#a78bfa" }}>🎒 SPL Token Accounts</span>
                    <span style={{ fontWeight: 800, color: "#c084fc" }}>{tokens.length}</span>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>⚡ Degen Snapshot</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                    {[
                      { e: "🧟", v: degen.rugs, l: "Rugs Survived" },
                      { e: "💎", v: `${degen.diamond}%`, l: "Diamond Hands" },
                      { e: "📣", v: degen.calls, l: "Calls Made" },
                      { e: "🎯", v: `${degen.hitRate}%`, l: "Hit Rate" },
                      { e: "⚡", v: degen.score, l: "Degen Score" },
                      { e: "🎒", v: tokens.length, l: "Bags Held" },
                    ].map(s => (
                      <div key={s.l} style={{ textAlign: "center", padding: "12px 8px", background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                        <div style={{ fontSize: 18 }}>{s.e}</div>
                        <div style={{ fontSize: 17, fontWeight: 800, margin: "3px 0" }}>{s.v}</div>
                        <div style={{ fontSize: 9, color: "#6b7280", textTransform: "uppercase" }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bags.fm Live Data Tab */}
            {tab === "bags" && (
              <div style={{ display: "grid", gap: 14 }}>
                {bagsLoading ? (
                  <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🎒</div>
                    Fetching live Bags.fm data…
                  </div>
                ) : (
                  <>
                    {/* Claimable Fees */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>💰 Claimable Fees (Live)</div>
                      {bagsFees && bagsFees.length > 0 ? (
                        <div style={{ display: "grid", gap: 10 }}>
                          {bagsFees.slice(0, 5).map((fee: any, i: number) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                              <span style={{ fontSize: 13, color: "#9ca3af" }}>{fee.mint ? `${fee.mint.slice(0,8)}…` : `Position ${i+1}`}</span>
                              <span style={{ fontWeight: 700, color: "#4ade80" }}>◎ {fmt(fee.claimableFees || 0, 4)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: "20px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
                          No claimable fees found for this wallet yet.<br />
                          <span style={{ fontSize: 12 }}>Create tokens on Bags.fm to earn fees!</span>
                        </div>
                      )}
                    </div>

                    {/* Tokens Created */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🚀 Tokens Launched on Bags.fm</div>
                      {bagsTokens.length > 0 ? (
                        <div style={{ display: "grid", gap: 10 }}>
                          {bagsTokens.map((token: any, i: number) => (
                            <div key={i} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontWeight: 600 }}>{token.name || token.symbol || "Token"}</div>
                                <div style={{ fontSize: 12, color: "#6b7280" }}>{token.mint ? `${token.mint.slice(0,12)}…` : ""}</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 13, color: "#9f7aea" }}>{token.symbol}</div>
                                {token.lifetimeFees && <div style={{ fontSize: 12, color: "#4ade80" }}>◎ {fmt(token.lifetimeFees, 3)} earned</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: "20px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
                          No tokens launched from this wallet yet.<br />
                          <a href="https://bags.fm" target="_blank" rel="noreferrer" style={{ color: "#9f7aea", fontSize: 12 }}>Launch your first token on Bags.fm →</a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Degen Card Tab */}
            {tab === "degen" && (
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "28px" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>🎴 Degen Card Generator</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Your on-chain identity, turned into a shareable flex card</div>

                  {/* Theme switcher */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
                    {[
                      { id: "god", label: "🌑 Degen God", col: "#c084fc" },
                      { id: "diamond", label: "💎 Diamond", col: "#67e8f9" },
                      { id: "ape", label: "🦍 Ape Mode", col: "#86efac" },
                      { id: "survivor", label: "🧟 Survivor", col: "#fb923c" },
                    ].map(t => (
                      <button key={t.id} onClick={() => setCardTheme(t.id)} style={{ padding: "6px 16px", background: cardTheme === t.id ? "rgba(255,255,255,0.08)" : "transparent", border: `1.5px solid ${cardTheme === t.id ? t.col : "rgba(255,255,255,0.1)"}`, borderRadius: 20, color: cardTheme === t.id ? t.col : "#6b7280", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* The Card */}
                  <div style={{ background: theme.bg, border: `1.5px solid ${theme.glow}`, borderRadius: 20, padding: "26px", position: "relative", overflow: "hidden", boxShadow: `0 0 60px ${theme.glow}`, fontFamily: "monospace" }}>
                    <div style={{ position: "absolute", top: -60, right: -60, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${theme.glow},transparent 70%)`, pointerEvents: "none" }} />

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
                      <div>
                        <div style={{ fontSize: 9, color: theme.acc, letterSpacing: 3, textTransform: "uppercase", marginBottom: 3 }}>BagTracker · Solana · Bags.fm</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{short(wallet.publicKey)}</div>
                      </div>
                      <div style={{ padding: "4px 12px", background: theme.badge, borderRadius: 20, fontSize: 11, fontWeight: 800, color: "#fff" }}>{degen.title}</div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>Degen Score</span>
                        <span style={{ fontSize: 11, color: theme.acc }}>{degen.score}/100</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${degen.score}%`, background: `linear-gradient(90deg,${theme.badge},${theme.acc})`, borderRadius: 3 }} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                      <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>SOL BALANCE</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: theme.acc }}>◎ {fmt(sol, 3)}</div>
                      </div>
                      <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>ALL-TIME PNL</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: degen.pnl >= 0 ? "#4ade80" : "#f87171" }}>{degen.pnl >= 0 ? "+" : ""}{fmt(degen.pnl, 1)}%</div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
                      {[
                        { e: "🧟", v: degen.rugs, l: "Rugs" },
                        { e: "💎", v: `${degen.diamond}%`, l: "Diamond" },
                        { e: "📣", v: degen.calls, l: "Calls" },
                        { e: "🎯", v: `${degen.hitRate}%`, l: "Hit Rate" },
                        { e: "🎒", v: tokens.length, l: "Bags" },
                        { e: "🚀", v: bagsTokens.length || "—", l: "Launched" },
                      ].map(s => (
                        <div key={s.l} style={{ textAlign: "center", padding: "9px 5px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                          <div style={{ fontSize: 14 }}>{s.e}</div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", margin: "2px 0" }}>{s.v}</div>
                          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>{s.l}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", borderTop: `1px solid ${theme.glow}`, paddingTop: 12 }}>
                      bagtracker.vercel.app · @bagsfm
                    </div>
                  </div>

                  {/* Share */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                    <button onClick={copyCard} style={{ padding: "13px", background: copied ? "rgba(134,239,172,0.1)" : "rgba(255,255,255,0.05)", color: copied ? "#86efac" : "#e2e8f0", border: `1px solid ${copied ? "#86efac" : "rgba(255,255,255,0.1)"}`, borderRadius: 14, fontWeight: 700, cursor: "pointer" }}>
                      {copied ? "✓ Copied!" : "📋 Copy Stats"}
                    </button>
                    <button onClick={tweet} style={{ padding: "13px", background: "linear-gradient(135deg,#7c3aed,#9f7aea)", color: "#fff", border: "none", borderRadius: 14, fontWeight: 700, cursor: "pointer" }}>
                      🐦 Tweet Card
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
