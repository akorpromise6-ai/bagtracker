"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── FONT LOADER ────────────────────────────────────────────────────────────
const FONT_URL = "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap";

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
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />, // ... more icons
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

// Remaining file content...
