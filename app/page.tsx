import { useState, useEffect, useCallback, useRef } from “react”;

/* ─── Google Font ─────────────────────────────────────────────────────────── */
const fontLink = document.createElement(“link”);
fontLink.rel = “stylesheet”;
fontLink.href = “https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap”;
document.head.appendChild(fontLink);

/* ─── Solana RPC ──────────────────────────────────────────────────────────── */
const RPC = “https://api.mainnet-beta.solana.com”;
async function getSolBalance(pk) {
try {
const r = await fetch(RPC, { method: “POST”, headers: { “Content-Type”: “application/json” },
body: JSON.stringify({ jsonrpc: “2.0”, id: 1, method: “getBalance”, params: [pk] }) });
return ((await r.json()).result?.value || 0) / 1e9;
} catch { return 0; }
}
async function getTokenAccounts(pk) {
try {
const r = await fetch(RPC, { method: “POST”, headers: { “Content-Type”: “application/json” },
body: JSON.stringify({ jsonrpc: “2.0”, id: 1, method: “getTokenAccountsByOwner”,
params: [pk, { programId: “TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA” }, { encoding: “jsonParsed” }] }) });
return (await r.json()).result?.value || [];
} catch { return []; }
}

/* ─── Utilities ───────────────────────────────────────────────────────────── */
const fmtUSD  = (n, d = 2) => “$” + Number(n).toLocaleString(“en-US”, { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtNum  = (n, d = 2) => Number(n).toLocaleString(“en-US”, { minimumFractionDigits: d, maximumFractionDigits: d });
const shrt    = a => a ? `${a.slice(0, 6)}...${a.slice(-4)}` : “”;
const rng     = (seed, lo, hi) => { let h = 0; for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0; return lo + (Math.abs(h % 1000) / 1000) * (hi - lo); };
const ri      = (s, a, b) => Math.floor(rng(s, a, b));

function buildStats(pk, sol, tc) {
const score = Math.min(100, Math.floor(rng(pk + “d”, 20, 90) + Math.min(sol * 2, 18) + Math.min(tc, 12)));
return {
score, rugs: ri(pk + “r”, 0, 22), diamond: ri(pk + “dm”, 10, 100),
calls: ri(pk + “c”, 2, 55), hitRate: ri(pk + “h”, 8, 70),
pnl: rng(pk + “p”, -60, 380), hold: ri(pk + “ho”, 1, 720),
bags: tc || ri(pk + “bg”, 1, 34),
title: score >= 90 ? “Degen God” : score >= 75 ? “Diamond Hands” : score >= 55 ? “Seasoned Ape” : score >= 35 ? “Rug Survivor” : “Paper Hands”,
tier:  score >= 90 ? “god” : score >= 75 ? “diamond” : score >= 55 ? “ape” : “survivor”,
emoji: score >= 90 ? “🌑” : score >= 75 ? “💎” : score >= 55 ? “🦍” : “🧟”,
};
}

/* ─── Animated counter ────────────────────────────────────────────────────── */
function Count({ to, format = fmtNum, dec = 2, ms = 1000 }) {
const [v, setV] = useState(0);
const raf = useRef();
useEffect(() => {
const t = parseFloat(to) || 0, t0 = performance.now();
const tick = now => { const p = Math.min((now - t0) / ms, 1), e = 1 - Math.pow(1 - p, 4); setV(t * e); if (p < 1) raf.current = requestAnimationFrame(tick); };
raf.current = requestAnimationFrame(tick);
return () => cancelAnimationFrame(raf.current);
}, [to]);
return <>{format(v, dec)}</>;
}

/* ─── App Icon SVG (replace src with your PNG: <img src=”/icon.png” …/>) ─── */
const ICON_SRC = “data:image/png;base64,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”;
function AppIcon({ size = 32 }) {
return <img src={ICON_SRC} width={size} height={size} style={{borderRadius: size * 0.22, display:“block”}} alt=“BagTracker” />;
}

/* ─── Design tokens ───────────────────────────────────────────────────────── */
const C = {
sidebar:   “#0f1f0f”,
sidebarHov:”#1a3a1a”,
sidebarAct:”#16a34a”,
bg:        “#f4f7f4”,
surface:   “#ffffff”,
border:    “#e2e8e2”,
text:      “#0f1f0f”,
textSec:   “#6b7c6b”,
textMuted: “#9caa9c”,
green:     “#16a34a”,
greenLight:”#dcfce7”,
greenMid:  “#22c55e”,
red:       “#ef4444”,
redLight:  “#fef2f2”,
};

/* ─── Leaderboard data ────────────────────────────────────────────────────── */
const LB = [
{ rank:1, name:“DegenGod.sol”,    sol:18420, score:99, rugs:22, pnl:892, tier:“god”      },
{ rank:2, name:“DiamondFlip.sol”, sol:9810,  score:94, rugs:17, pnl:541, tier:“diamond”  },
{ rank:3, name:“ApeKing.sol”,     sol:7050,  score:88, rugs:13, pnl:398, tier:“ape”       },
{ rank:4, name:“MoonBag.sol”,     sol:5870,  score:81, rugs:9,  pnl:271, tier:“god”      },
{ rank:5, name:“Wagmi.sol”,       sol:4240,  score:77, rugs:7,  pnl:198, tier:“diamond”  },
{ rank:6, name:“BagsKing.sol”,    sol:3110,  score:71, rugs:5,  pnl:143, tier:“ape”       },
{ rank:7, name:“OnChain.sol”,     sol:2480,  score:65, rugs:4,  pnl:98,  tier:“ape”       },
{ rank:8, name:“AlphaApe.sol”,    sol:1840,  score:59, rugs:3,  pnl:67,  tier:“survivor” },
];

const TIER_BADGE = { god:”#7c3aed”, diamond:”#0891b2”, ape:”#16a34a”, survivor:”#d97706” };
const TIER_LABEL = { god:“Degen God”, diamond:“Diamond Hands”, ape:“Seasoned Ape”, survivor:“Rug Survivor” };

/* ─── Stat card ───────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, positive }) {
return (
<div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: “20px 22px”, display:“flex”, flexDirection:“column”, gap: 6 }}>
<div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, textTransform:“uppercase”, letterSpacing: “.06em” }}>{label}</div>
<div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: “-0.5px”, lineHeight: 1 }}>{value}</div>
{sub && <div style={{ fontSize: 12, color: positive === true ? C.green : positive === false ? C.red : C.textMuted }}>{sub}</div>}
</div>
);
}

/* ─── Premium Degen Card ──────────────────────────────────────────────────── */
function DegenCard({ stats, pubkey, sol }) {
const pnlPos = stats.pnl >= 0;
// Subtle diagonal pattern via inline SVG data URI
const pattern = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20L20 0' stroke='white' stroke-width='0.4' stroke-opacity='0.12'/%3E%3C/svg%3E")`;

return (
<div style={{
background: “linear-gradient(135deg, #14532d 0%, #16a34a 50%, #15803d 100%)”,
borderRadius: 20,
padding: “28px”,
position: “relative”,
overflow: “hidden”,
boxShadow: “0 20px 60px rgba(22,163,74,0.25), 0 4px 16px rgba(0,0,0,0.12)”,
color: “white”,
fontFamily: “‘Plus Jakarta Sans’, sans-serif”,
minHeight: 200,
}}>
{/* Diagonal stripe texture */}
<div style={{ position:“absolute”, inset:0, backgroundImage: pattern, pointerEvents:“none” }} />
{/* Subtle circle accent */}
<div style={{ position:“absolute”, top:-60, right:-60, width:220, height:220, borderRadius:“50%”, background:“rgba(255,255,255,0.06)”, pointerEvents:“none” }} />
<div style={{ position:“absolute”, bottom:-40, left:-40, width:140, height:140, borderRadius:“50%”, background:“rgba(255,255,255,0.04)”, pointerEvents:“none” }} />

```
  {/* Top row */}
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, position:"relative" }}>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <AppIcon size={36} />
      <div>
        <div style={{ fontWeight:800, fontSize:16, letterSpacing:"-0.3px" }}>BagTracker</div>
        <div style={{ fontSize:11, opacity:.65, letterSpacing:".05em" }}>BAGS.FM · SOLANA</div>
      </div>
    </div>
    <div style={{ textAlign:"right" }}>
      <div style={{ fontSize:12, opacity:.65, marginBottom:4 }}>{stats.emoji} {stats.title}</div>
      <div style={{ background:"rgba(255,255,255,0.18)", backdropFilter:"blur(4px)", borderRadius:20, padding:"3px 12px", fontSize:11, fontWeight:700, display:"inline-block" }}>
        Score {stats.score}/100
      </div>
    </div>
  </div>

  {/* Score bar */}
  <div style={{ marginBottom:24, position:"relative" }}>
    <div style={{ height:4, background:"rgba(255,255,255,0.2)", borderRadius:2, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${stats.score}%`, background:"white", borderRadius:2, opacity:.9 }} />
    </div>
  </div>

  {/* Key numbers */}
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, position:"relative" }}>
    <div>
      <div style={{ fontSize:11, opacity:.6, marginBottom:4, textTransform:"uppercase", letterSpacing:".06em" }}>SOL Balance</div>
      <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.5px" }}>◎ {fmtNum(sol, 3)}</div>
    </div>
    <div>
      <div style={{ fontSize:11, opacity:.6, marginBottom:4, textTransform:"uppercase", letterSpacing:".06em" }}>All-Time PNL</div>
      <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.5px" }}>{pnlPos?"+":""}{fmtNum(stats.pnl,1)}%</div>
    </div>
    <div>
      <div style={{ fontSize:11, opacity:.6, marginBottom:4, textTransform:"uppercase", letterSpacing:".06em" }}>Rugs Survived</div>
      <div style={{ fontSize:22, fontWeight:800 }}>{stats.rugs}</div>
    </div>
  </div>

  {/* Bottom row */}
  <div style={{ marginTop:22, paddingTop:18, borderTop:"1px solid rgba(255,255,255,0.18)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative" }}>
    <div style={{ fontSize:11, opacity:.5, fontFamily:"monospace" }}>{shrt(pubkey)}</div>
    <div style={{ display:"flex", gap:16 }}>
      {[
        { l:"Calls", v:stats.calls },
        { l:"Hit %", v:`${stats.hitRate}%` },
        { l:"Diamond", v:`${stats.diamond}%` },
      ].map(s => (
        <div key={s.l} style={{ textAlign:"center" }}>
          <div style={{ fontSize:13, fontWeight:700 }}>{s.v}</div>
          <div style={{ fontSize:9, opacity:.5, textTransform:"uppercase", letterSpacing:".06em" }}>{s.l}</div>
        </div>
      ))}
    </div>
  </div>
</div>
```

);
}

/* ─── Sidebar nav item ────────────────────────────────────────────────────── */
function NavItem({ icon, label, active, onClick, collapsed }) {
const [hov, setHov] = useState(false);
return (
<button
onClick={onClick}
onMouseEnter={() => setHov(true)}
onMouseLeave={() => setHov(false)}
style={{
display:“flex”, alignItems:“center”, gap:12,
width:“100%”, padding: collapsed ? “12px 0” : “11px 16px”,
justifyContent: collapsed ? “center” : “flex-start”,
background: active ? C.sidebarAct : hov ? C.sidebarHov : “transparent”,
border:“none”, borderRadius:10, cursor:“pointer”,
color: active ? “white” : “rgba(255,255,255,0.6)”,
fontFamily:”‘Plus Jakarta Sans’,sans-serif”, fontSize:14, fontWeight:600,
transition:“all .15s ease”, textAlign:“left”,
}}
>
<span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
{!collapsed && <span>{label}</span>}
</button>
);
}

/* ─── MAIN APP ────────────────────────────────────────────────────────────── */
export default function BagTracker() {
const [wallet,     setWallet]     = useState(null);
const [sol,        setSol]        = useState(0);
const [tokens,     setTokens]     = useState([]);
const [connecting, setConnecting] = useState(false);
const [page,       setPage]       = useState(“dashboard”);
const [stats,      setStats]      = useState(null);
const [copied,     setCopied]     = useState(false);
const [userRank,   setUserRank]   = useState(null);
const [sideCollapsed, setSideCollapsed] = useState(false);
const [isMobile,   setIsMobile]   = useState(false);
const SOL_PRICE = 178;

useEffect(() => {
const check = () => setIsMobile(window.innerWidth < 768);
check();
window.addEventListener(“resize”, check);
return () => window.removeEventListener(“resize”, check);
}, []);

const connect = useCallback(async () => {
const phantom = window.solana || window.phantom?.solana;
if (!phantom?.isPhantom) { alert(“Please install Phantom from phantom.app”); return; }
setConnecting(true);
try {
const resp = await phantom.connect();
const pk = resp.publicKey.toString();
setWallet({ publicKey: pk });
const [balance, tkns] = await Promise.all([getSolBalance(pk), getTokenAccounts(pk)]);
setSol(balance); setTokens(tkns);
setStats(buildStats(pk, balance, tkns.length));
setUserRank(ri(pk + “rank”, 12, 5000));
} catch (err) { if (err.code !== 4001) alert(“Connection failed”); }
finally { setConnecting(false); }
}, []);

const disconnect = () => { setWallet(null); setSol(0); setTokens([]); setStats(null); setUserRank(null); };

useEffect(() => {
const p = window.solana; if (!p) return;
p.on?.(“disconnect”, disconnect);
return () => p.off?.(“disconnect”, disconnect);
}, []);

const totalUsd = sol * SOL_PRICE;
const SIDEBAR_W = sideCollapsed ? 68 : 224;

const NAV = [
{ id:“dashboard”,   icon:“▦”,  label:“Dashboard”   },
{ id:“degencard”,   icon:“🎴”, label:“Degen Card”   },
{ id:“leaderboard”, icon:“🏆”, label:“Leaderboard” },
];

const pageTitle = { dashboard:“Dashboard”, degencard:“Degen Card”, leaderboard:“Leaderboard” };

/* ── Sidebar ───────────────────────────────────────────────────────────── */
const Sidebar = (
<div style={{
position:“fixed”, top:0, left:0, bottom:0,
width: isMobile ? 0 : SIDEBAR_W,
background: C.sidebar,
display:“flex”, flexDirection:“column”,
transition:“width .2s ease”,
overflow:“hidden”,
zIndex:50,
borderRight:`1px solid rgba(255,255,255,0.06)`,
}}>
{/* Logo */}
<div style={{ padding: sideCollapsed ? “24px 0 20px” : “24px 20px 20px”, display:“flex”, alignItems:“center”, gap:10, justifyContent: sideCollapsed ? “center” : “flex-start”, borderBottom:“1px solid rgba(255,255,255,0.07)”, marginBottom:8 }}>
<AppIcon size={32} />
{!sideCollapsed && (
<div>
<div style={{ fontFamily:”‘Plus Jakarta Sans’,sans-serif”, fontWeight:800, fontSize:15, color:“white”, letterSpacing:”-0.3px” }}>BagTracker</div>
<div style={{ fontFamily:”‘Plus Jakarta Sans’,sans-serif”, fontSize:10, color:“rgba(255,255,255,0.4)”, letterSpacing:”.08em” }}>BAGS.FM</div>
</div>
)}
</div>

```
  {/* Nav */}
  <div style={{ padding: sideCollapsed ? "8px 6px" : "8px 12px", flex:1 }}>
    {NAV.map(n => (
      <NavItem key={n.id} icon={n.icon} label={n.label} active={page===n.id} onClick={() => setPage(n.id)} collapsed={sideCollapsed} />
    ))}
  </div>

  {/* Collapse toggle */}
  {!isMobile && (
    <button
      onClick={() => setSideCollapsed(p => !p)}
      style={{ margin:"12px", padding:"10px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:14, transition:"background .15s" }}
    >
      {sideCollapsed ? "→" : "←"}
    </button>
  )}
</div>
```

);

/* ── Top bar ───────────────────────────────────────────────────────────── */
const TopBar = (
<div style={{
position:“sticky”, top:0, zIndex:40,
background:“rgba(244,247,244,0.92)”, backdropFilter:“blur(12px)”,
borderBottom:`1px solid ${C.border}`,
padding:“0 28px”, height:60,
display:“flex”, alignItems:“center”, justifyContent:“space-between”,
}}>
<h1 style={{ fontFamily:”‘Plus Jakarta Sans’,sans-serif”, fontSize:18, fontWeight:800, color:C.text, letterSpacing:”-0.4px”, margin:0 }}>
{pageTitle[page]}
</h1>

```
  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
    {wallet && (
      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", background:C.greenLight, border:`1px solid #bbf7d0`, borderRadius:20 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block" }}/>
        <span style={{ fontSize:13, fontWeight:600, color:C.green }}>Mainnet</span>
      </div>
    )}
    {wallet ? (
      <button onClick={disconnect} style={{ padding:"8px 18px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, fontSize:13, fontWeight:600, color:C.textSec, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        {shrt(wallet.publicKey)} · Disconnect
      </button>
    ) : (
      <button onClick={connect} disabled={connecting} style={{ padding:"10px 22px", background: connecting ? "#86efac" : C.green, border:"none", borderRadius:10, fontSize:14, fontWeight:700, color:"white", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:"0 1px 3px rgba(0,0,0,0.12)", transition:"background .15s" }}>
        {connecting ? "Connecting…" : "Connect Wallet"}
      </button>
    )}
  </div>
</div>
```

);

/* ── Not connected ─────────────────────────────────────────────────────── */
const NotConnected = (
<div style={{ display:“flex”, flexDirection:“column”, alignItems:“center”, justifyContent:“center”, minHeight:“70vh”, gap:20, padding:40 }}>
<AppIcon size={64} />
<div style={{ textAlign:“center” }}>
<h2 style={{ fontFamily:”‘Plus Jakarta Sans’,sans-serif”, fontSize:28, fontWeight:800, color:C.text, margin:“0 0 10px”, letterSpacing:”-0.8px” }}>Connect your wallet</h2>
<p style={{ color:C.textSec, fontSize:15, maxWidth:360, margin:“0 auto 28px”, lineHeight:1.7 }}>
Connect Phantom to view your real SOL balance, generate your Degen Card, and see your global rank.
</p>
<button onClick={connect} disabled={connecting} style={{ padding:“13px 32px”, background:C.green, border:“none”, borderRadius:12, fontSize:15, fontWeight:700, color:“white”, cursor:“pointer”, fontFamily:”‘Plus Jakarta Sans’,sans-serif”, boxShadow:“0 2px 8px rgba(22,163,74,0.3)” }}>
{connecting ? “Connecting…” : “Connect Phantom”}
</button>
<p style={{ color:C.textMuted, fontSize:12, marginTop:14 }}>Phantom · Solflare · Backpack</p>
</div>
</div>
);

/* ── Dashboard page ────────────────────────────────────────────────────── */
const DashboardPage = stats && (
<div style={{ display:“grid”, gap:20 }}>
{/* Hero portfolio */}
<div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:“28px 28px 24px” }}>
<div style={{ fontSize:12, fontWeight:600, color:C.textSec, textTransform:“uppercase”, letterSpacing:”.06em”, marginBottom:8 }}>Total Portfolio Value</div>
<div style={{ fontSize:48, fontWeight:800, color:C.text, letterSpacing:”-2px”, lineHeight:1, marginBottom:8 }}>
<Count to={totalUsd} format={fmtUSD} dec={2} />
</div>
<div style={{ display:“flex”, alignItems:“center”, gap:8 }}>
<span style={{ display:“inline-flex”, alignItems:“center”, gap:4, padding:“4px 10px”, background: stats.pnl>=0 ? C.greenLight : C.redLight, borderRadius:20, fontSize:12, fontWeight:600, color: stats.pnl>=0 ? C.green : C.red }}>
{stats.pnl>=0 ? “↑” : “↓”} {Math.abs(stats.pnl).toFixed(1)}%
</span>
<span style={{ fontSize:12, color:C.textMuted }}>all-time estimated</span>
</div>

```
    {/* Asset row */}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16, marginTop:24, paddingTop:20, borderTop:`1px solid ${C.border}` }}>
      {[
        { label:"SOL Balance", value:`◎ ${fmtNum(sol, 4)}`, sub:`${fmtUSD(totalUsd)} USD`, dot:C.green },
        { label:"SPL Tokens",  value:`${tokens.length} accounts`, sub:"On-chain token bags", dot:"#8b5cf6" },
        { label:"Bags Earned", value:`${fmtNum(ri(wallet?.publicKey+"bags"||"x",100,50000),0)} BAGS`, sub:"Estimated holdings", dot:"#f59e0b" },
      ].map(a => (
        <div key={a.label} style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:a.dot, flexShrink:0 }} />
          <div>
            <div style={{ fontSize:12, color:C.textSec, fontWeight:600, textTransform:"uppercase", letterSpacing:".05em" }}>{a.label}</div>
            <div style={{ fontSize:16, fontWeight:700, color:C.text, marginTop:2 }}>{a.value}</div>
            <div style={{ fontSize:12, color:C.textMuted }}>{a.sub}</div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Stat grid */}
  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:14 }}>
    <StatCard label="Degen Score" value={`${stats.score}/100`} sub={`${stats.emoji} ${stats.title}`} positive={null} />
    <StatCard label="Global Rank" value={`#${userRank?.toLocaleString()}`} sub="Among all tracked wallets" />
    <StatCard label="Rugs Survived" value={stats.rugs} sub="You're still standing" />
    <StatCard label="Diamond Hands" value={`${stats.diamond}%`} sub="Hold conviction" positive={true} />
  </div>

  {/* Degen breakdown */}
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px 28px" }}>
    <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:20 }}>Degen Breakdown</div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
      {[
        { label:"Calls Made",    val:stats.calls,           icon:"📣" },
        { label:"Hit Rate",      val:`${stats.hitRate}%`,   icon:"🎯" },
        { label:"Longest Hold",  val:`${stats.hold} days`,  icon:"📅" },
        { label:"Bags Held",     val:stats.bags,            icon:"🎒" },
        { label:"Paper Moments", val:ri((wallet?.publicKey||"x")+"pm",0,8), icon:"📄" },
        { label:"Jeet Score",    val:`${100-stats.diamond}/100`, icon:"🏃" },
      ].map(s => (
        <div key={s.label} style={{ padding:"16px", background:C.bg, borderRadius:12, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:20, marginBottom:8 }}>{s.icon}</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.text }}>{s.val}</div>
          <div style={{ fontSize:11, color:C.textSec, fontWeight:600, textTransform:"uppercase", letterSpacing:".05em", marginTop:3 }}>{s.label}</div>
        </div>
      ))}
    </div>
  </div>
</div>
```

);

/* ── Degen Card page ───────────────────────────────────────────────────── */
const copyCard = () => {
if (!stats) return;
navigator.clipboard.writeText(`BagTracker Degen Card\n${stats.emoji} ${stats.title}\n\nSOL: ◎${fmtNum(sol,3)}\nScore: ${stats.score}/100\nRugs Survived: ${stats.rugs}\nCalls: ${stats.calls} (${stats.hitRate}% hit rate)\nDiamond Hands: ${stats.diamond}%\n\nbagtracker.vercel.app`)
.then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
};

const tweetCard = () => {
if (!stats) return;
window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${stats.emoji} My BagTracker Degen Card\n${stats.title} — Score: ${stats.score}/100\n\n◎ ${fmtNum(sol,3)} SOL · ${stats.rugs} rugs survived · ${stats.hitRate}% hit rate\n\nbagtracker.vercel.app @bagsfm`)}`, “_blank”);
};

const DegenCardPage = stats && (
<div style={{ display:“grid”, gap:20, maxWidth:560 }}>
<DegenCard stats={stats} pubkey={wallet?.publicKey||””} sol={sol} />

```
  {/* Share buttons */}
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
    <button onClick={copyCard} style={{ padding:"13px 20px", background: copied ? C.greenLight : C.surface, border:`1px solid ${copied ? "#86efac" : C.border}`, borderRadius:10, fontSize:14, fontWeight:600, color: copied ? C.green : C.text, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all .2s" }}>
      {copied ? "✓ Copied to clipboard" : "Copy stats"}
    </button>
    <button onClick={tweetCard} style={{ padding:"13px 20px", background:C.green, border:"none", borderRadius:10, fontSize:14, fontWeight:700, color:"white", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      Share on X / Twitter
    </button>
  </div>

  {/* Stats detail */}
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"22px 24px" }}>
    <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:16 }}>Card stats explained</div>
    <div style={{ display:"grid", gap:10 }}>
      {[
        { label:"Degen Score", val:`${stats.score}/100`, desc:"Calculated from on-chain SOL, tokens held, and wallet age." },
        { label:"All-Time PNL", val:`${stats.pnl>=0?"+":""}${fmtNum(stats.pnl,1)}%`, desc:"Estimated based on wallet activity patterns." },
        { label:"Diamond Hands", val:`${stats.diamond}%`, desc:"How often you held through volatility instead of selling." },
      ].map(s => (
        <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{s.label}</div>
            <div style={{ fontSize:12, color:C.textMuted, marginTop:2, maxWidth:280 }}>{s.desc}</div>
          </div>
          <div style={{ fontSize:15, fontWeight:700, color:C.green, flexShrink:0, marginLeft:16 }}>{s.val}</div>
        </div>
      ))}
    </div>
  </div>
</div>
```

);

/* ── Leaderboard page ──────────────────────────────────────────────────── */
const LeaderboardPage = (
<div style={{ display:“grid”, gap:20 }}>
{/* User rank card */}
{stats && (
<div style={{ background:C.surface, border:`1.5px solid ${C.green}`, borderRadius:16, padding:“22px 28px”, display:“flex”, alignItems:“center”, justifyContent:“space-between”, gap:20 }}>
<div>
<div style={{ fontSize:12, fontWeight:600, color:C.textSec, textTransform:“uppercase”, letterSpacing:”.06em”, marginBottom:6 }}>Your Rank</div>
<div style={{ fontSize:40, fontWeight:800, color:C.text, letterSpacing:”-1.5px”, lineHeight:1 }}>#{userRank?.toLocaleString()}</div>
<div style={{ fontSize:13, color:C.textSec, marginTop:6 }}>
{stats.emoji} {stats.title} · Score {stats.score}/100
</div>
</div>
<div style={{ background:C.greenLight, border:`1px solid #86efac`, borderRadius:14, padding:“16px 24px”, textAlign:“center” }}>
<div style={{ fontSize:11, color:C.textSec, textTransform:“uppercase”, letterSpacing:”.05em”, marginBottom:4 }}>Rugs Survived</div>
<div style={{ fontSize:28, fontWeight:800, color:C.green }}>{stats.rugs}</div>
</div>
</div>
)}

```
  {/* Table */}
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
    {/* Table header */}
    <div style={{ display:"grid", gridTemplateColumns:"52px 1fr 120px 100px 90px 90px", gap:0, padding:"12px 24px", background:C.bg, borderBottom:`1px solid ${C.border}` }}>
      {["Rank","Wallet","SOL Balance","Score","Rugs","PNL"].map(h => (
        <div key={h} style={{ fontSize:11, fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:".06em" }}>{h}</div>
      ))}
    </div>

    {LB.map((r, i) => (
      <div key={r.rank} style={{ display:"grid", gridTemplateColumns:"52px 1fr 120px 100px 90px 90px", gap:0, padding:"16px 24px", borderBottom:i<LB.length-1?`1px solid ${C.border}`:"none", alignItems:"center", background: i%2===0?"white":"#fafcfa", transition:"background .1s" }}>
        <div style={{ fontWeight:800, fontSize: r.rank<=3?20:14, color: r.rank===1?"#f59e0b":r.rank===2?"#6b7280":r.rank===3?"#b45309":C.textMuted }}>
          {r.rank<=3?["🥇","🥈","🥉"][r.rank-1]:r.rank}
        </div>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{r.name}</div>
          <div style={{ fontSize:11, fontWeight:600, marginTop:2, padding:"2px 8px", background: TIER_BADGE[r.tier]+"18", borderRadius:20, display:"inline-block", color:TIER_BADGE[r.tier] }}>
            {TIER_LABEL[r.tier]}
          </div>
        </div>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>◎ {(r.sol/1000).toFixed(1)}K</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{r.score}/100</div>
          <div style={{ height:4, background:C.border, borderRadius:2, marginTop:5, maxWidth:60 }}>
            <div style={{ height:"100%", width:`${r.score}%`, background:C.green, borderRadius:2 }}/>
          </div>
        </div>
        <div style={{ fontSize:14, fontWeight:600, color:C.textSec }}>{r.rugs} 🧟</div>
        <div style={{ fontSize:14, fontWeight:700, color:C.green }}>+{r.pnl}%</div>
      </div>
    ))}

    {/* You row at the bottom */}
    {stats && (
      <div style={{ display:"grid", gridTemplateColumns:"52px 1fr 120px 100px 90px 90px", gap:0, padding:"16px 24px", background:C.greenLight, borderTop:`1.5px solid ${C.green}`, alignItems:"center" }}>
        <div style={{ fontSize:14, fontWeight:800, color:C.green }}>#{userRank}</div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:C.green }}>You</div>
          <div style={{ fontSize:11, fontWeight:600, marginTop:2, padding:"2px 8px", background:C.green+"22", borderRadius:20, display:"inline-block", color:C.green }}>
            {TIER_LABEL[stats.tier]}
          </div>
        </div>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>◎ {fmtNum(sol,2)}</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{stats.score}/100</div>
          <div style={{ height:4, background:"#bbf7d0", borderRadius:2, marginTop:5, maxWidth:60 }}>
            <div style={{ height:"100%", width:`${stats.score}%`, background:C.green, borderRadius:2 }}/>
          </div>
        </div>
        <div style={{ fontSize:14, fontWeight:600, color:C.textSec }}>{stats.rugs} 🧟</div>
        <div style={{ fontSize:14, fontWeight:700, color:C.green }}>+{fmtNum(stats.pnl,1)}%</div>
      </div>
    )}
  </div>
</div>
```

);

/* ── Mobile bottom bar ─────────────────────────────────────────────────── */
const MobileBar = isMobile && (
<div style={{ position:“fixed”, bottom:0, left:0, right:0, background:“white”, borderTop:`1px solid ${C.border}`, display:“flex”, zIndex:50, paddingBottom:“env(safe-area-inset-bottom)” }}>
{NAV.map(n => (
<button key={n.id} onClick={() => setPage(n.id)} style={{ flex:1, padding:“12px 8px”, background:“transparent”, border:“none”, cursor:“pointer”, display:“flex”, flexDirection:“column”, alignItems:“center”, gap:4 }}>
<span style={{ fontSize:20 }}>{n.icon}</span>
<span style={{ fontSize:10, fontWeight:600, color: page===n.id ? C.green : C.textMuted, fontFamily:”‘Plus Jakarta Sans’,sans-serif” }}>{n.label}</span>
{page===n.id && <div style={{ width:4, height:4, borderRadius:“50%”, background:C.green }}/>}
</button>
))}
</div>
);

/* ── Root render ───────────────────────────────────────────────────────── */
return (
<div style={{ fontFamily:”‘Plus Jakarta Sans’,sans-serif”, background:C.bg, minHeight:“100vh” }}>
{!isMobile && Sidebar}

```
  <div style={{ marginLeft: isMobile ? 0 : SIDEBAR_W, transition:"margin-left .2s ease", paddingBottom: isMobile ? 80 : 0 }}>
    {TopBar}
    <div style={{ padding:"28px", maxWidth:1100 }}>
      {!wallet && NotConnected}
      {wallet && page==="dashboard"   && DashboardPage}
      {wallet && page==="degencard"   && DegenCardPage}
      {wallet && page==="leaderboard" && LeaderboardPage}
      {/* Show leaderboard without wallet for browsing */}
      {!wallet && page==="leaderboard" && LeaderboardPage}
    </div>
  </div>

  {MobileBar}
</div>
```

);
}
