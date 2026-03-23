"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── FONT LOADER ────────────────────────────────────────────────────────────
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SOL_PRICE_USD = 178;
const RPC_URL = "https://api.mainnet-beta.solana.com";

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const T = {
  bg: "#f5f2eb",
  surface: "#ffffff",
  surfaceAlt: "#f0ede6",
  sidebar: "#0d1a0d",
  sideHover: "#162916",
  sideActive: "#16a34a",
  border: "#e4dfd7",
  borderMid: "#d0c9c0",
  green: "#16a34a",
  greenLight: "#dcfce7",
  greenMid: "#86efac",
  greenDark: "#14532d",
  text: "#111a10",
  textSec: "#52635a",
  textMute: "#9aaa98",
  red: "#dc2626",
  redLight: "#fee2e2",
  gold: "#b45309",
  goldLight: "#fef3c7",
  purple: "#7c3aed",
  purpleLight: "#ede9fe",
  blue: "#1d4ed8",
  sans: "'Instrument Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Courier New', monospace",
};

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
function Ico({ n, s = 18, c = "currentColor", w = 1.6 }) {
  const d = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    card: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M7 15h3M14 15h3" />
      </>
    ),
    trophy: (
      <>
        <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0012 0V2z" />
      </>
    ),
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    lock: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </>
    ),
    gift: (
      <>
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </>
    ),
    chevronL: <polyline points="15 18 9 12 15 6" />,
    chevronR: <polyline points="9 18 15 12 9 6" />,
    menu: (
      <>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </>
    ),
    close: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
    check: <polyline points="20 6 9 17 4 12" />,
    copy: (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </>
    ),
    trending: (
      <>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </>
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    flame: (
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    ),
    eye: (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ),
    diamond: (
      <path d="M2.7 10.3a2.41 2.41 0 000 3.41l7.59 7.59a2.41 2.41 0 003.41 0l7.59-7.59a2.41 2.41 0 000-3.41l-7.59-7.59a2.41 2.41 0 00-3.41 0z" />
    ),
    arrowUp: (
      <>
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </>
    ),
    arrowDown: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </>
    ),
    wallet: (
      <>
        <path d="M21 12V7H5a2 2 0 010-4h14v4" />
        <path d="M3 5v14a2 2 0 002 2h16v-5" />
        <path d="M18 12a2 2 0 000 4h4v-4z" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </>
    ),
    crown: (
      <>
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
        <path d="M5 20h14" />
      </>
    ),
    star: (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    coins: (
      <>
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1110.34 18" />
        <path d="M7 6h1v4" />
        <path d="m16.71 13.88.7.71-2.82 2.82" />
      </>
    ),
    activity: (
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    ),
    bell: (
      <>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </>
    ),
    refresh: (
      <>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </>
    ),
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
    externalLink: (
      <>
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
  };
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
    >
      {d[n]}
    </svg>
  );
}

// ─── APP LOGO ────────────────────────────────────────────────────────────────
function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      style={{ display: "block", flexShrink: 0, borderRadius: size * 0.22 }}
    >
      <rect width="48" height="48" rx="10" fill="#0d1a0d" />
      <rect width="48" height="48" rx="10" fill="url(#lg)" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0d1a0d" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M14 32C14 37 34 37 34 32V21C34 15 14 15 14 21Z"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.4"
      />
      <path
        d="M19 15C19 10.5 29 10.5 29 15"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="28.5" cy="26.5" r="6" stroke="#4ade80" strokeWidth="1.6" fill="none" />
      <line x1="32.7" y1="30.7" x2="36" y2="34" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24.5 24.5V27L26 28.5" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ─── SOLANA RPC ──────────────────────────────────────────────────────────────
async function rpc(method, params) {
  try {
    const r = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    return (await r.json()).result;
  } catch {
    return null;
  }
}

async function getSolBalance(pk) {
  const r = await rpc("getBalance", [pk]);
  return r ? r.value / 1e9 : 0;
}

async function getTokenAccounts(pk) {
  const r = await rpc("getTokenAccountsByOwner", [
    pk,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ]);
  return r ? r.value : [];
}

async function getRecentTxs(pk) {
  const r = await rpc("getSignaturesForAddress", [pk, { limit: 20 }]);
  return r || [];
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt$ = (n, d = 2) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtN = (n, d = 2) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtSol = (n) => "◎" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const shrt = (a) => (a ? a.slice(0, 5) + "..." + a.slice(-4) : "");
const rng = (seed, lo, hi) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return lo + (Math.abs(h % 1000) / 1000) * (hi - lo);
};
const ri = (s, a, b) => Math.floor(rng(s, a, b + 1));

function calcDegenScore(pk, sol, tokenCount, txCount) {
  const ageFactor = Math.min(txCount * 0.5, 25);
  const solFactor = Math.min(sol * 1.5, 25);
  const tokenFactor = Math.min(tokenCount * 1.2, 25);
  const actFactor = Math.min(ri(pk + "act", 5, 25), 25);
  return Math.min(100, Math.floor(ageFactor + solFactor + tokenFactor + actFactor));
}

function buildStats(pk, sol, tokens, txs) {
  const score = calcDegenScore(pk, sol, tokens.length, txs.length);
  const pnl = rng(pk + "pnl", -45, 320);
  return {
    score,
    pnl,
    rugs: ri(pk + "r", 0, 18),
    diamond: ri(pk + "dm", 10, 95),
    calls: ri(pk + "c", 2, 60),
    hitRate: ri(pk + "h", 10, 75),
    hold: ri(pk + "ho", 1, 730),
    bags: tokens.length || ri(pk + "bg", 1, 40),
    followers: ri(pk + "fo", 100, 15000),
    rank: ri(pk + "rk", 5, 3000),
    txCount: txs.length,
    title:
      score >= 90
        ? "Degen God"
        : score >= 75
        ? "Diamond Hands"
        : score >= 55
        ? "Seasoned Ape"
        : score >= 35
        ? "Rug Survivor"
        : "Paper Hands",
    tier: score >= 90 ? "god" : score >= 75 ? "diamond" : score >= 55 ? "ape" : "survivor",
    isVIP: score >= 82,
  };
}

// ─── ANIMATED NUMBER ─────────────────────────────────────────────────────────
function AnimNum({ to, fmt = fmtN, dec = 2, dur = 1000 }) {
  const [v, setV] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const target = parseFloat(to) || 0;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setV(target * ease);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, dur]);
  return <>{fmt(v, dec)}</>;
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "error" ? T.red : type === "warning" ? T.gold : T.green;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: T.sidebar,
        color: "white",
        padding: "12px 24px",
        borderRadius: 50,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: T.sans,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        border: `1.5px solid ${bg}`,
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: 8,
        animation: "slideUp 0.2s ease",
      }}
    >
      <div
        style={{ width: 7, height: 7, borderRadius: "50%", background: bg, flexShrink: 0 }}
      />
      {msg}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose, width = 480 }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.surface,
          borderRadius: 20,
          width: "100%",
          maxWidth: width,
          border: `1px solid ${T.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, color: T.text, fontFamily: T.sans }}>
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.textMute,
              padding: 4,
            }}
          >
            <Ico n="close" s={18} c="currentColor" />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── CARD ────────────────────────────────────────────────────────────────────
function Card({ children, style = {}, accent = false, glow = false }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${accent ? T.green : T.border}`,
        borderRadius: 16,
        padding: 22,
        boxShadow: glow
          ? `0 0 24px rgba(22,163,74,0.15), 0 2px 8px rgba(0,0,0,0.04)`
          : "0 1px 4px rgba(0,0,0,0.04)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── LABEL ──────────────────────────────────��────────────────────────────────
function Label({ children, style = {} }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: T.textMute,
        textTransform: "uppercase",
        letterSpacing: ".1em",
        fontFamily: T.mono,
        marginBottom: 6,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
function Bar({ pct, color = T.green, height = 6, animated = true }) {
  return (
    <div
      style={{
        height,
        background: T.surfaceAlt,
        borderRadius: height / 2,
        overflow: "hidden",
        border: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(Math.max(pct, 0), 100)}%`,
          background: `linear-gradient(90deg,${color},${color}dd)`,
          borderRadius: height / 2,
          transition: animated ? "width 1.2s cubic-bezier(0.4,0,0.2,1)" : "none",
        }}
      />
    </div>
  );
}

// ─── STAT BOX ────────────────────────────────────────────────────────────────
function StatBox({ label, value, sub, icon, color = T.text, bg = T.surfaceAlt }) {
  return (
    <div style={{ background: bg, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 14px" }}>
      {icon && (
        <div style={{ marginBottom: 10 }}>
          <Ico n={icon} s={18} c={T.green} />
        </div>
      )}
      <Label>{label}</Label>
      <div
        style={{
          fontFamily: T.sans,
          fontWeight: 700,
          fontSize: 22,
          color,
          letterSpacing: "-0.5px",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: T.textMute, marginTop: 4, fontFamily: T.sans }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── BTN ─────────────────────────────────────────────────────────────────────
function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  style = {},
  fullWidth = false,
}) {
  const styles = {
    primary: { bg: T.green, color: "white", border: T.green },
    secondary: { bg: T.surfaceAlt, color: T.text, border: T.border },
    dark: { bg: T.sidebar, color: "white", border: T.sidebar },
    danger: { bg: T.redLight, color: T.red, border: "#fca5a5" },
    ghost: { bg: "transparent", color: T.textSec, border: T.border },
    gold: { bg: T.goldLight, color: T.gold, border: "#fcd34d" },
  };
  const sz = { sm: "8px 14px", md: "11px 20px", lg: "14px 28px" };
  const fs = { sm: 11, md: 13, lg: 15 };
  const v = styles[variant] || styles.primary;
  return (
    <button
      onClick={!disabled && !loading ? onClick : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        padding: sz[size],
        background: disabled || loading ? T.surfaceAlt : v.bg,
        color: disabled || loading ? T.textMute : v.color,
        border: `1px solid ${disabled || loading ? T.border : v.border}`,
        borderRadius: 10,
        fontWeight: 700,
        fontSize: fs[size],
        cursor: disabled || loading ? "not-allowed" : "pointer",
        fontFamily: T.sans,
        transition: "all .15s",
        width: fullWidth ? "100%" : "auto",
        ...style,
      }}
    >
      {loading ? (
        <Ico n="refresh" s={14} c="currentColor" />
      ) : (
        icon && <Ico n={icon} s={size === "sm" ? 12 : size === "lg" ? 16 : 14} c="currentColor" />
      )}
      {children}
    </button>
  );
}

// ─── BACKGROUND ──────────────────────────────────────────────────────────────
function Background() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: T.bg }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}>
        <defs>
          <pattern id="diag" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="32" stroke="#16a34a" strokeWidth="0.35" strokeOpacity="0.2" />
          </pattern>
          <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.8" fill="#16a34a" fillOpacity="0.12" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag)" />
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      <div
        style={{
          position: "absolute",
          top: -300,
          right: -300,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(22,163,74,0.07) 0%,transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(22,163,74,0.05) 0%,transparent 65%)",
        }}
      />
    </div>
  );
}

// ─── LEADERBOARD DATA ────────────────────────────────────────────────────────
const LB = [
  { rank: 1, name: "DegenGod.sol", sol: 18420, score: 99, pnl: 892, followers: 48200, tier: "god", wallet: "DgN7xK9mP2qR" },
  { rank: 2, name: "DiamondFlip.sol", sol: 9810, score: 94, pnl: 541, followers: 32100, tier: "diamond", wallet: "DF2xP9mQ3rS" },
  { rank: 3, name: "ApeKing.sol", sol: 7050, score: 88, pnl: 398, followers: 21800, tier: "ape", wallet: "AK3yQ8nR4sT" },
  { rank: 4, name: "MoonBag.sol", sol: 5870, score: 81, pnl: 271, followers: 18400, tier: "god", wallet: "MB4zR7oS5tU" },
  { rank: 5, name: "Wagmi.sol", sol: 4240, score: 77, pnl: 198, followers: 14300, tier: "diamond", wallet: "WG5aS6pT6uV" },
  { rank: 6, name: "BagsKing.sol", sol: 3110, score: 71, pnl: 143, followers: 10200, tier: "ape", wallet: "BK6bT5qU7vW" },
  { rank: 7, name: "OnChain.sol", sol: 2480, score: 65, pnl: 98, followers: 7800, tier: "ape", wallet: "OC7cU4rV8wX" },
  { rank: 8, name: "AlphaApe.sol", sol: 1840, score: 59, pnl: 67, followers: 5400, tier: "survivor", wallet: "AA8dV3sW9xY" },
  { rank: 9, name: "RugProof.sol", sol: 1200, score: 52, pnl: 44, followers: 3800, tier: "survivor", wallet: "RP9eW2tX0yZ" },
  { rank: 10, name: "HoldStrong.sol", sol: 880, score: 47, pnl: 31, followers: 2600, tier: "survivor", wallet: "HS0fX1uY1zA" },
];

const TIER_C = { god: T.purple, diamond: "#0891b2", ape: T.green, survivor: T.gold };
const TIER_BG = { god: T.purpleLight, diamond: "#cffafe", ape: T.greenLight, survivor: T.goldLight };

// ─── DEGEN CARD COMPONENT ────────────────────────────────────────────────────
function DegenCardVisual({ stats, pubkey, sol, minted }) {
  const pos = stats.pnl >= 0;
  const tierColors = {
    god: ["#7c3aed", "#a855f7"],
    diamond: ["#0891b2", "#22d3ee"],
    ape: ["#15803d", "#4ade80"],
    survivor: ["#b45309", "#fbbf24"],
  };
  const [tc1, tc2] = tierColors[stats.tier] || tierColors.ape;

  return (
    <div
      style={{
        background: `linear-gradient(135deg,#0d1a0d 0%,#111a10 50%,#0a1a12 100%)`,
        borderRadius: 20,
        padding: "28px 24px 24px",
        position: "relative",
        overflow: "hidden",
        color: "white",
        fontFamily: T.sans,
        boxShadow: `0 24px 64px rgba(13,26,13,0.4), 0 0 0 1px rgba(22,163,74,0.2)`,
        minHeight: 260,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle,${tc1}22 0%,transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(circle,${tc2}18 0%,transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4, pointerEvents: "none" }}
      >
        <defs>
          <pattern id="cdiag" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="20" stroke="#22c55e" strokeWidth="0.4" strokeOpacity="0.15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cdiag)" />
      </svg>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: "linear-gradient(180deg,rgba(255,255,255,0.04) 0%,transparent 100%)",
          borderRadius: "20px 20px 0 0",
          pointerEvents: "none",
        }}
      />

      {minted && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: `linear-gradient(135deg,${tc1},${tc2})`,
            color: "white",
            fontSize: 9,
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: 20,
            letterSpacing: 1,
            fontFamily: T.mono,
            textTransform: "uppercase",
            boxShadow: `0 0 12px ${tc1}66`,
          }}
        >
          NFT Minted
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, position: "relative" }}>
        <Logo size={32} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>BagTracker</div>
          <div style={{ fontSize: 9, opacity: 0.35, fontFamily: T.mono, letterSpacing: ".12em" }}>
            BAGS.FM · SOLANA MAINNET
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            background: `${tc1}33`,
            border: `1px solid ${tc1}55`,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 9,
            fontWeight: 700,
            fontFamily: T.mono,
            color: tc2,
          }}
        >
          {stats.title.toUpperCase()}
        </div>
      </div>

      <div style={{ marginBottom: 20, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span
            style={{ fontSize: 9, opacity: 0.35, textTransform: "uppercase", letterSpacing: ".12em", fontFamily: T.mono }}
          >
            Degen Score
          </span>
          <span style={{ fontSize: 11, color: tc2, fontWeight: 700, fontFamily: T.mono }}>{stats.score} / 100</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
          <div
            style={{
              height: "100%",
              width: `${stats.score}%`,
              background: `linear-gradient(90deg,${tc1},${tc2})`,
              borderRadius: 2,
              boxShadow: `0 0 8px ${tc2}66`,
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20, position: "relative" }}>
        {[
          { l: "SOL Balance", v: fmtSol(sol) },
          { l: "All-Time PNL", v: `${pos ? "+" : ""}${fmtN(stats.pnl, 1)}%`, c: pos ? "#4ade80" : "#f87171" },
          { l: "Rugs Survived", v: stats.rugs },
        ].map((s) => (
          <div key={s.l}>
            <div
              style={{
                fontSize: 8,
                opacity: 0.3,
                textTransform: "uppercase",
                letterSpacing: ".1em",
                marginBottom: 5,
                fontFamily: T.mono,
              }}
            >
              {s.l}
            </div>
            <div
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: s.c || "white",
                letterSpacing: "-0.5px",
                fontFamily: T.sans,
              }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div style={{ fontFamily: T.mono, fontSize: 9, opacity: 0.25 }}>{shrt(pubkey)}</div>
        <div style={{ display: "flex", gap: 18 }}>
          {[
            ["Calls", stats.calls],
            ["Hit %", `${stats.hitRate}%`],
            ["Diamond", `${stats.diamond}%`],
          ].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: T.sans }}>{v}</div>
              <div
                style={{
                  fontSize: 8,
                  opacity: 0.3,
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  fontFamily: T.mono,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── NAV CONFIG ──────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard" },
  { id: "degencard", icon: "card", label: "Degen Card" },
  { id: "leaderboard", icon: "trophy", label: "Leaderboard" },
  { id: "wagers", icon: "zap", label: "Wagers" },
  { id: "pro", icon: "crown", label: "Pro VIP", badge: "VIP" },
  { id: "referral", icon: "gift", label: "Referral" },
];

// ════════════════════════════════════════════════════════════════════════════
// ─── MAIN APP ───────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
export default function BagTracker() {
  // Wallet state
  const [wallet, setWallet] = useState(null);
  const [sol, setSol] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [txs, setTxs] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // App state
  const [page, setPage] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { type, data }

  // UI state
  const [sideOpen, setSideOpen] = useState(true);
  const [mobileSide, setMobileSide] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Feature state
  const [minted, setMinted] = useState(false);
  const [minting, setMinting] = useState(false);
  const [streak, setStreak] = useState(4);
  const [checkedIn, setCheckedIn] = useState(false);
  const [goal, setGoal] = useState({ type: "portfolio", target: 10000, label: "$10,000" });
  const [wagers, setWagers] = useState([]);
  const [watching, setWatching] = useState(["DegenGod.sol", "DiamondFlip.sol"]);
  const [tipping, setTipping] = useState(null);
  const [tipped, setTipped] = useState({});
  const [refCopied, setRefCopied] = useState(false);
  const [refEarnings] = useState({ refs: 7, converted: 3, sol: 0.35 });
  const [wagerForm, setWagerForm] = useState({ type: "followers", amount: 5, target: 1000 });
  const [lbFilter, setLbFilter] = useState("all");
  const [solPrice, setSolPrice] = useState(SOL_PRICE_USD);

  const totalUsd = sol * solPrice;
  const goalPct =
    goal.type === "portfolio"
      ? (totalUsd / goal.target) * 100
      : ((stats?.followers || 0) / goal.target) * 100;
  const SIDEBAR_W = sideOpen ? 236 : 68;

  // Responsive
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 840;
      setIsMobile(mobile);
      if (mobile) setSideOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load fonts + global styles
  useEffect(() => {
    if (document.querySelector("[data-bt-font]")) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FONT_URL;
    l.setAttribute("data-bt-font", "1");
    document.head.appendChild(l);
    const s = document.createElement("style");
    s.textContent = `* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: ${T.sans}; background:${T.bg}; } @keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } } @keyframes spin { to { transform:rotate(360deg); } } .spin { animation: spin 1s linear infinite; } ::-webkit-scrollbar{width:5px;height:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${T.borderMid};border-radius:10px}`;
    document.head.appendChild(s);
  }, []);

  // Phantom disconnect listener
  useEffect(() => {
    const p = window?.solana || window?.phantom?.solana;
    if (!p) return;
    const fn = () => {
      setWallet(null);
      setSol(0);
      setTokens([]);
      setTxs([]);
      setStats(null);
    };
    p.on?.("disconnect", fn);
    return () => p.off?.("disconnect", fn);
  }, []);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Connect wallet
  const connect = useCallback(async () => {
    const p = window?.solana || window?.phantom?.solana;
    if (!p?.isPhantom) {
      setModal({ type: "noWallet" });
      return;
    }
    setConnecting(true);
    try {
      const resp = await p.connect();
      const pk = resp.publicKey.toString();
      setWallet({ publicKey: pk });
      const [bal, tkns, txList] = await Promise.all([
        getSolBalance(pk),
        getTokenAccounts(pk),
        getRecentTxs(pk),
      ]);
      setSol(bal);
      setTokens(tkns);
      setTxs(txList);
      setStats(buildStats(pk, bal, tkns, txList));
      showToast("Wallet connected — Solana Mainnet");
    } catch (e) {
      if (e.code !== 4001) showToast("Connection failed. Try again.", "error");
    } finally {
      setConnecting(false);
    }
  }, []);

  // Disconnect
  const disconnect = () => {
    window?.solana?.disconnect?.();
    setWallet(null);
    setSol(0);
    setTokens([]);
    setTxs([]);
    setStats(null);
    showToast("Wallet disconnected");
  };

  // Refresh wallet data
  const refreshWallet = async () => {
    if (!wallet || refreshing) return;
    setRefreshing(true);
    try {
      const [bal, tkns, txList] = await Promise.all([
        getSolBalance(wallet.publicKey),
        getTokenAccounts(wallet.publicKey),
        getRecentTxs(wallet.publicKey),
      ]);
      setSol(bal);
      setTokens(tkns);
      setTxs(txList);
      setStats(buildStats(wallet.publicKey, bal, tkns, txList));
      showToast("Portfolio refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  // Mint NFT
  const doMint = () => {
    if (!wallet) {
      showToast("Connect wallet first", "warning");
      return;
    }
    setModal({ type: "confirmMint" });
  };

  const confirmMint = async () => {
    setModal(null);
    setMinting(true);
    await new Promise((r) => setTimeout(r, 2400));
    setMinted(true);
    setMinting(false);
    showToast("Degen Card minted as NFT on Solana");
  };

  // Tip
  const doTip = (name) => {
    if (!wallet) {
      showToast("Connect wallet first", "warning");
      return;
    }
    setModal({ type: "confirmTip", data: { name } });
  };

  const confirmTip = async (name) => {
    setModal(null);
    setTipping(name);
    await new Promise((r) => setTimeout(r, 1600));
    setTipping(null);
    setTipped((p) => ({ ...p, [name]: true }));
    showToast(`Tipped 0.1 SOL to ${name}`);
  };

  // Check in
  const doCheckIn = () => {
    if (checkedIn) return;
    setCheckedIn(true);
    setStreak((s) => Math.min(s + 1, 7));
    showToast(`Day ${streak + 1} streak — keep building!`);
  };

  // Place wager
  const doWager = () => {
    if (!wallet) {
      showToast("Connect wallet first", "warning");
      return;
    }
    setModal({ type: "confirmWager", data: wagerForm });
  };

  const confirmWager = (form) => {
    setModal(null);
    setWagers((w) => [
      ...w,
      {
        ...form,
        id: Date.now(),
        placed: new Date().toLocaleDateString(),
        status: "active",
        progress: ri(wallet?.publicKey + "wp" || "x", 12, 68),
      },
    ]);
    showToast(`Wager placed — ${form.amount} SOL staked`);
  };

  // Cancel wager
  const cancelWager = (id) => {
    setWagers((w) => w.filter((x) => x.id !== id));
    showToast("Wager cancelled — SOL returned");
  };

  // Watch whale
  const toggleWatch = (name) => {
    if (watching.includes(name)) {
      setWatching((w) => w.filter((x) => x !== name));
      showToast(`Removed ${name} from watch list`);
    } else {
      setWatching((w) => [...w, name]);
      showToast(`Now watching ${name}`);
    }
  };

  // Copy ref
  const copyRef = () => {
    const link = `https://bagstracker-seven.vercel.app?ref=${wallet?.publicKey?.slice(0, 8) || "demo"}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2500);
    showToast("Referral link copied!");
  };

  // Share
  const shareX = (text) => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  const shareCast = (text) =>
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, "_blank");

  const navigate = (id) => {
    if (!wallet && !["leaderboard"].includes(id)) {
      showToast("Connect your wallet first", "warning");
      return;
    }
    setPage(id);
    if (isMobile) setMobileSide(false);
  };

  // ── Landing page
  const LandingPage = (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px 80px",
        textAlign: "center",
      }}
    >
      <Logo size={72} />
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: T.green,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          margin: "20px 0 12px",
          fontFamily: T.mono,
        }}
      >
        bags.fm · solana mainnet
      </div>
      <h1
        style={{
          fontFamily: T.sans,
          fontSize: isMobile ? 48 : 64,
          fontWeight: 700,
          letterSpacing: "-3px",
          lineHeight: 1,
          color: T.text,
          marginBottom: 16,
        }}
      >
        Track Your
        <br />
        <span style={{ color: T.green }}>Bags.</span>
      </h1>
      <p style={{ color: T.textSec, fontSize: 15, maxWidth: 400, lineHeight: 1.8, marginBottom: 40 }}>
        Real-time Solana portfolio analytics, verifiable on-chain identity, onchain wagers, and a leaderboard that
        separates diamond hands from paper hands.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          marginBottom: 40,
          maxWidth: 500,
        }}
      >
        {[
          ["diamond", "Mintable NFT Cards"],
          ["zap", "Onchain Wagers"],
          ["lock", "VIP Token Gate"],
          ["gift", "Referral Bounties"],
          ["trophy", "Live Leaderboard"],
          ["flame", "Daily Streaks"],
        ].map(([ico, t]) => (
          <div
            key={t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: T.textSec,
            }}
          >
            <Ico n={ico} s={12} c={T.green} />
            {t}
          </div>
        ))}
      </div>
      <Btn
        size="lg"
        onClick={connect}
        loading={connecting}
        icon="wallet"
        style={{ borderRadius: 50, boxShadow: "0 4px 28px rgba(22,163,74,0.3)" }}
      >
        {connecting ? "Connecting..." : "Connect Phantom Wallet"}
      </Btn>
      <div style={{ color: T.textMute, fontSize: 11, marginTop: 12, fontFamily: T.mono }}>
        Phantom · Solflare · Backpack
      </div>

      <div
        style={{
          marginTop: 60,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
          maxWidth: 700,
          width: "100%",
        }}
      >
        {[
          { icon: "shield", title: "Non-Custodial", desc: "We never hold your keys. Read-only wallet access." },
          { icon: "activity", title: "Real-Time Data", desc: "Live SOL balance and token data from Solana mainnet." },
          { icon: "trending", title: "On-Chain Proof", desc: "All wagers and NFT mints are verifiable on-chain." },
        ].map((f) => (
          <Card key={f.title} style={{ textAlign: "left" }}>
            <Ico n={f.icon} s={20} c={T.green} />
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginTop: 10, marginBottom: 4 }}>
              {f.title}
            </div>
            <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.7 }}>{f.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );

  // ── Dashboard page
  const DashboardPage =
    stats && (
      <div style={{ display: "grid", gap: 16 }}>
        <Card style={{ padding: "24px 24px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <Label>Total Portfolio Value</Label>
              <div
                style={{
                  fontFamily: T.sans,
                  fontSize: isMobile ? 42 : 56,
                  fontWeight: 700,
                  color: T.text,
                  letterSpacing: "-2.5px",
                  lineHeight: 1,
                }}
              >
                <AnimNum to={totalUsd} fmt={fmt$} dec={2} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    background: stats.pnl >= 0 ? T.greenLight : T.redLight,
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    color: stats.pnl >= 0 ? T.green : T.red,
                    fontFamily: T.mono,
                  }}
                >
                  <Ico n={stats.pnl >= 0 ? "arrowUp" : "arrowDown"} s={11} c="currentColor" />
                  {stats.pnl >= 0 ? "+" : ""}
                  {fmtN(stats.pnl, 1)}% all-time
                </span>
                <span style={{ fontSize: 12, color: T.textMute }}>{fmtSol(sol)}</span>
              </div>
            </div>
            <Btn variant="ghost" size="sm" onClick={refreshWallet} loading={refreshing} icon={refreshing ? undefined : "refresh"}>
              {refreshing ? "Refreshing..." : "Refresh"}
            </Btn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
            <StatBox label="SOL Balance" value={fmtSol(sol)} sub={fmt$(totalUsd)} color={T.green} />
            <StatBox label="SPL Tokens" value={`${tokens.length}`} sub="Token accounts" />
            <StatBox label="Degen Score" value={`${stats.score}/100`} sub={stats.title} />
            <StatBox label="Global Rank" value={`#${fmtN(stats.rank, 0)}`} sub="All wallets" color={T.purple} />
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Ico n="flame" s={16} c={T.green} />
              <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Daily Streak</span>
              {checkedIn && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    background: T.greenLight,
                    color: T.green,
                    borderRadius: 20,
                    fontFamily: T.mono,
                  }}
                >
                  Checked in
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: i < streak ? `linear-gradient(90deg,${T.green},#4ade80)` : T.border,
                    transition: "background .3s",
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.textSec, marginBottom: 14, fontFamily: T.sans }}>
              {streak}/7 days · {checkedIn ? "Come back tomorrow" : "Check in to keep your streak"}
            </div>
            <Btn
              fullWidth
              variant={checkedIn ? "secondary" : "primary"}
              disabled={checkedIn}
              icon={checkedIn ? "check" : "flame"}
              onClick={doCheckIn}
            >
              {checkedIn ? "Checked in today" : "Check In Now"}
            </Btn>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Ico n="target" s={16} c={T.green} />
              <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Goal Tracker</span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{goal.label}</span>
                <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textSec }}>
                  {Math.min(100, goalPct).toFixed(1)}%
                </span>
              </div>
              <Bar pct={goalPct} height={8} />
            </div>
            <div style={{ fontSize: 11, color: T.textMute, fontFamily: T.mono, marginBottom: 14 }}>
              {goal.type === "portfolio"
                ? `${fmt$(totalUsd)} of ${fmt$(goal.target, 0)}`
                : `${fmtN(stats.followers, 0)} of ${fmtN(goal.target, 0)} followers`}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { type: "portfolio", target: 10000, label: "$10k" },
                { type: "portfolio", target: 50000, label: "$50k" },
                { type: "followers", target: 10000, label: "10k flw" },
              ].map((g) => (
                <button
                  key={g.label}
                  onClick={() => setGoal(g)}
                  style={{
                    flex: 1,
                    padding: "7px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: T.mono,
                    borderRadius: 8,
                    background: goal.target === g.target ? T.sidebar : T.surfaceAlt,
                    color: goal.target === g.target ? "white" : T.textSec,
                    border: `1px solid ${goal.target === g.target ? T.sidebar : T.border}`,
                    transition: "all .15s",
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Ico n="activity" s={16} c={T.green} />
            <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Degen Breakdown</span>
            <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: T.mono, color: T.textMute }}>
              {txs.length} on-chain txs
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10 }}>
            {[
              { icon: "users", label: "Rugs Survived", value: stats.rugs },
              { icon: "diamond", label: "Diamond Hands", value: `${stats.diamond}%` },
              { icon: "bell", label: "Calls Made", value: stats.calls },
              { icon: "target", label: "Hit Rate", value: `${stats.hitRate}%` },
              { icon: "trending", label: "Followers", value: fmtN(stats.followers, 0) },
              { icon: "activity", label: "Longest Hold", value: `${stats.hold}d` },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "14px 10px",
                  background: T.surfaceAlt,
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  textAlign: "center",
                }}
              >
                <Ico n={s.icon} s={18} c={T.green} />
                <div
                  style={{
                    fontFamily: T.sans,
                    fontWeight: 700,
                    fontSize: 19,
                    color: T.text,
                    marginTop: 8,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: T.textMute,
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    marginTop: 3,
                    fontFamily: T.mono,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Ico n="eye" s={16} c={T.green} />
              <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Whale Watcher</span>
            </div>
            <span style={{ fontSize: 11, color: T.textMute }}>{watching.length} tracked</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
            {LB.slice(0, 6).map((w) => (
              <div
                key={w.name}
                style={{
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  background: watching.includes(w.name) ? T.greenLight : T.surfaceAlt,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: T.sidebar,
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontFamily: T.mono,
                    fontSize: 12,
                  }}
                >
                  #{w.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: T.textMute }}>{fmtSol(w.sol)} · {w.score} score</div>
                </div>
                <Btn
                  size="sm"
                  variant={watching.includes(w.name) ? "secondary" : "primary"}
                  onClick={() => toggleWatch(w.name)}
                >
                  {watching.includes(w.name) ? "Unwatch" : "Watch"}
                </Btn>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );

  // ── Degen card page
  const DegenCardPage =
    stats && (
      <div style={{ display: "grid", gap: 16 }}>
        <Card glow accent>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Ico n="card" s={18} c={T.green} />
              <span style={{ fontWeight: 700, fontSize: 16, color: T.text }}>Your Degen Card</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="secondary" size="sm" icon="copy" onClick={() => navigator.clipboard?.writeText(wallet.publicKey)}>
                Copy Pubkey
              </Btn>
              <Btn variant="primary" size="sm" icon="plus" onClick={doMint} loading={minting} disabled={minted}>
                {minted ? "Minted" : "Mint as NFT"}
              </Btn>
            </div>
          </div>
          <DegenCardVisual stats={stats} pubkey={wallet.publicKey} sol={sol} minted={minted} />
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Ico n="share" s={16} c={T.green} />
            <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Share your flex</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="secondary" icon="externalLink" onClick={() => shareX(`Checking my Degen Card on bags.fm — score ${stats.score}!`)}>
              Post to X
            </Btn>
            <Btn variant="secondary" icon="externalLink" onClick={() => shareCast(`My bags.fm Degen Card: score ${stats.score}.`)}>Share on Warpcast</Btn>
          </div>
        </Card>
      </div>
    );

  // ── Leaderboard page
  const LeaderboardPage = (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Ico n="trophy" s={16} c={T.green} />
          <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Top Degens</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {["all", "god", "diamond", "ape", "survivor"].map((f) => (
              <button
                key={f}
                onClick={() => setLbFilter(f)}
                style={{
                  padding: "6px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: T.mono,
                  borderRadius: 10,
                  border: `1px solid ${lbFilter === f ? T.green : T.border}`,
                  background: lbFilter === f ? T.greenLight : T.surfaceAlt,
                  color: lbFilter === f ? T.greenDark : T.textSec,
                  cursor: "pointer",
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.sans }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 11, color: T.textMute, textTransform: "uppercase", letterSpacing: ".05em" }}>
                <th style={{ padding: "10px 8px" }}>Rank</th>
                <th style={{ padding: "10px 8px" }}>Name</th>
                <th style={{ padding: "10px 8px" }}>SOL</th>
                <th style={{ padding: "10px 8px" }}>Score</th>
                <th style={{ padding: "10px 8px" }}>PNL</th>
                <th style={{ padding: "10px 8px" }}>Followers</th>
                <th style={{ padding: "10px 8px" }}>Watch</th>
              </tr>
            </thead>
            <tbody>
              {LB.filter((x) => lbFilter === "all" || x.tier === lbFilter).map((w) => (
                <tr key={w.wallet} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: "12px 8px", fontWeight: 700, fontFamily: T.mono }}>#{w.rank}</td>
                  <td style={{ padding: "12px 8px", fontWeight: 700, color: T.text }}>{w.name}</td>
                  <td style={{ padding: "12px 8px", color: T.textSec }}>{fmtSol(w.sol)}</td>
                  <td style={{ padding: "12px 8px", color: TIER_C[w.tier] }}>{w.score}</td>
                  <td style={{ padding: "12px 8px", color: w.pnl >= 0 ? T.green : T.red }}>
                    {w.pnl >= 0 ? "+" : ""}
                    {w.pnl}%
                  </td>
                  <td style={{ padding: "12px 8px", color: T.textSec }}>{fmtN(w.followers, 0)}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <Btn
                      size="sm"
                      variant={watching.includes(w.name) ? "secondary" : "primary"}
                      onClick={() => toggleWatch(w.name)}
                    >
                      {watching.includes(w.name) ? "Unwatch" : "Watch"}
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // ── Wagers page
  const WagersPage = (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Ico n="zap" s={16} c={T.green} />
          <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Place a wager</span>
        </div>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr" }}>
          <div>
            <Label>Type</Label>
            <select
              value={wagerForm.type}
              onChange={(e) => setWagerForm((f) => ({ ...f, type: e.target.value }))}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                fontFamily: T.sans,
              }}
            >
              <option value="followers">Followers</option>
              <option value="pnl">PNL</option>
              <option value="rank">Leaderboard Rank</option>
            </select>
          </div>
          <div>
            <Label>Target</Label>
            <input
              value={wagerForm.target}
              onChange={(e) => setWagerForm((f) => ({ ...f, target: Number(e.target.value) || 0 }))}
              type="number"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                fontFamily: T.sans,
              }}
            />
          </div>
          <div>
            <Label>Amount (SOL)</Label>
            <input
              value={wagerForm.amount}
              onChange={(e) => setWagerForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))}
              type="number"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                fontFamily: T.sans,
              }}
            />
          </div>
        </div>
        <Btn style={{ marginTop: 12 }} icon="plus" onClick={doWager}>
          Stake Wager
        </Btn>
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Ico n="activity" s={16} c={T.green} />
          <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Active wagers</span>
        </div>
        {wagers.length === 0 ? (
          <div style={{ color: T.textMute, fontSize: 13 }}>No wagers yet. Place one to get started.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {wagers.map((w) => (
              <div
                key={w.id}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  background: T.surfaceAlt,
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr auto",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: T.text }}>{w.type.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: T.textMute }}>Target: {w.target}</div>
                </div>
                <div>
                  <Label>Staked</Label>
                  <div style={{ fontWeight: 700 }}>{fmtSol(w.amount)}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: w.status === "active" ? T.green : T.gold,
                      }}
                    />
                    <span style={{ fontWeight: 700, color: T.text }}>{w.status}</span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Bar pct={w.progress} height={6} />
                  </div>
                </div>
                <div style={{ justifySelf: "end" }}>
                  <Btn size="sm" variant="secondary" onClick={() => cancelWager(w.id)}>
                    Cancel
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  // ── Pro page
  const ProPage =
    stats && (
      <div style={{ display: "grid", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Ico n="crown" s={16} c={T.green} />
            <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Pro VIP</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16, alignItems: "center" }}>
            <div style={{ color: T.textSec, fontSize: 14, lineHeight: 1.7 }}>
              Unlock VIP token-gated features: higher wager limits, private whale alerts, auto-referral boosts, and early
              access to NFT drops. Your current tier: <strong>{stats.tier.toUpperCase()}</strong>.
            </div>
            <div style={{ justifySelf: "end" }}>
              <Btn variant="primary" size="lg" icon="lock">
                Upgrade for 10 ◎
              </Btn>
            </div>
          </div>
        </Card>
        <Card>
          <Label>VIP Perks</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {[
              ["diamond", "Priority Support"],
              ["bell", "Instant Whale Alerts"],
              ["gift", "Boosted Referrals"],
              ["shield", "Rug Protection Radar"],
            ].map(([ico, title]) => (
              <div
                key={title}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  background: T.surfaceAlt,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Ico n={ico} s={18} c={T.green} />
                <div style={{ fontWeight: 700, color: T.text }}>{title}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );

  // ── Referral page
  const ReferralPage =
    stats && (
      <div style={{ display: "grid", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Ico n="gift" s={16} c={T.green} />
            <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Referral program</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16 }}>
            <div style={{ color: T.textSec, fontSize: 14, lineHeight: 1.7 }}>
              Share your referral link and earn 10% of fees for every friend who connects a wallet and places a wager. Your
              stats update in real time.
            </div>
            <div style={{ justifySelf: "end", display: "flex", gap: 8 }}>
              <Btn variant="primary" icon="copy" onClick={copyRef}>
                {refCopied ? "Copied!" : "Copy link"}
              </Btn>
              <Btn variant="secondary" icon="share" onClick={() => shareX("Track your bags on bags.fm — join with my link!")}>
                Share
              </Btn>
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 12 }}>
          <StatBox label="Referrals" value={refEarnings.refs} sub="Total invited" icon="users" />
          <StatBox label="Converted" value={refEarnings.converted} sub="Active users" icon="check" />
          <StatBox label="Earned" value={fmtSol(refEarnings.sol)} sub="Lifetime SOL" icon="coins" color={T.green} />
        </div>
      </div>
    );

  // Page switcher
  const renderPage = () => {
    if (!wallet && page !== "leaderboard") return LandingPage;
    switch (page) {
      case "dashboard":
        return DashboardPage;
      case "degencard":
        return DegenCardPage;
      case "leaderboard":
        return LeaderboardPage;
      case "wagers":
        return WagersPage;
      case "pro":
        return ProPage;
      case "referral":
        return ReferralPage;
      default:
        return DashboardPage;
    }
  };

  // Layout
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <Background />

      <div style={{ display: "flex", position: "relative", zIndex: 1 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: SIDEBAR_W,
            transition: "width .2s",
            background: T.sidebar,
            color: "white",
            minHeight: "100vh",
            position: "sticky",
            top: 0,
            padding: 16,
            display: isMobile && !mobileSide ? "none" : "block",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <Logo size={36} />
            {sideOpen && (
              <div>
                <div style={{ fontWeight: 800, letterSpacing: "-0.4px" }}>BagTracker</div>
                <div style={{ fontSize: 11, opacity: 0.6, fontFamily: T.mono }}>SOLANA MAINNET</div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {NAV.map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: active ? T.sideActive : "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.78)",
                    border: "none",
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                >
                  <Ico n={item.icon} s={16} c={active ? "white" : "rgba(255,255,255,0.78)"} />
                  {sideOpen && <span style={{ fontWeight: 700, fontSize: 13 }}>{item.label}</span>}
                  {item.badge && sideOpen && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.14)",
                        color: "white",
                        fontFamily: T.mono,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
            <Btn
              variant="secondary"
              size="sm"
              icon={sideOpen ? "chevronL" : "chevronR"}
              onClick={() => setSideOpen((s) => !s)}
              fullWidth
            >
              {sideOpen ? "Collapse" : ""}
            </Btn>
            {wallet && (
              <Btn variant="ghost" size="sm" icon="logout" onClick={disconnect} fullWidth>
                {sideOpen ? "Disconnect" : ""}
              </Btn>
            )}
          </div>
        </aside>

        {/* Main */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? "18px 14px 32px" : "28px 32px 40px",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {isMobile && (
                <Btn variant="secondary" size="sm" icon="menu" onClick={() => setMobileSide((s) => !s)} />
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.6px", color: T.text }}>
                  {wallet ? "Welcome back" : "BagTracker"}
                </div>
                <div style={{ fontSize: 12, color: T.textMute }}>
                  {wallet ? shrt(wallet.publicKey) : "Connect your Phantom wallet to begin"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  fontFamily: T.mono,
                  fontSize: 12,
                  color: T.text,
                }}
              >
                SOL ${solPrice}
              </div>
              {!wallet ? (
                <Btn icon="wallet" onClick={connect} loading={connecting}>
                  {connecting ? "Connecting..." : "Connect"}
                </Btn>
              ) : (
                <Btn variant="secondary" icon="refresh" onClick={refreshWallet} loading={refreshing}>
                  Refresh
                </Btn>
              )}
            </div>
          </div>

          {renderPage()}
        </main>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {modal?.type === "noWallet" && (
        <Modal title="No wallet detected" onClose={() => setModal(null)}>
          <p style={{ color: T.textSec, fontSize: 14, lineHeight: 1.6 }}>
            Install Phantom, Solflare, or Backpack, then refresh this page. We only request read-only access to show your
            portfolio data.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn variant="secondary" icon="externalLink" onClick={() => window.open("https://phantom.app/", "_blank")}>
              Get Phantom
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Close
            </Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "confirmMint" && (
        <Modal title="Mint Degen Card as NFT" onClose={() => setModal(null)}>
          <p style={{ color: T.textSec, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            This will mint your current Degen Card to Solana mainnet (demo flow). A small network fee applies.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={confirmMint} loading={minting}>
              Mint NFT
            </Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "confirmTip" && (
        <Modal title="Send tip" onClose={() => setModal(null)}>
          <p style={{ color: T.textSec, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            Tip 0.1 ◎ to {modal.data.name}. This is a simulated flow for demo purposes.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={() => confirmTip(modal.data.name)} loading={tipping === modal.data.name}>
              Send tip
            </Btn>
          </div>
        </Modal>
      )}

      {modal?.type === "confirmWager" && (
        <Modal title="Confirm wager" onClose={() => setModal(null)}>
          <p style={{ color: T.textSec, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            Stake {wagerForm.amount} ◎ on reaching {wagerForm.target} {wagerForm.type}. This is simulated for demo
            purposes.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={() => confirmWager(wagerForm)}>
              Confirm
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
