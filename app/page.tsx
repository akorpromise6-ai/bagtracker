"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef, type ReactNode, type CSSProperties } from "react";

type PublicKeyString = string & { __brand: "PublicKey" };
type WalletInfo = { publicKey: PublicKeyString };
type TokenAmount = { amount: string; decimals: number; uiAmount: number | null; uiAmountString: string };
type TokenAccount = {
  pubkey: string;
  account: {
    data: {
      parsed: {
        info: {
          mint: string;
          owner: string;
          tokenAmount: TokenAmount;
        };
      };
    };
  };
};
type ISODateString = string & { __brand: "ISODateString" };
type NativeTransfer = { amount: number; fromUserAccount?: string; toUserAccount?: string };
type TokenTransfer = {
  tokenAmount: number;
  mint?: string;
  decimals?: number;
  fromUserAccount?: string;
  toUserAccount?: string;
};
type TransactionInfo = {
  signature: string;
  slot: number;
  blockTime?: number | null;
  timestamp?: number | null;
  err?: Record<string, unknown> | null;
  memo?: string | null;
  confirmationStatus?: string;
  description?: string | null;
  type?: string | null;
  source?: string | null;
  nativeTransfers?: NativeTransfer[];
  tokenTransfers?: TokenTransfer[];
  solChange?: number | null;
};
type Tier = "god" | "diamond" | "ape" | "survivor";
type Goal = { type: "portfolio" | "followers"; target: number; label: string };
type WagerForm = { type: "followers" | "pnl" | "rank"; target: number; amount: number };
type Wager = WagerForm & { id: number; placed: ISODateString; status: "active" | "settled"; progress: number };
type Stats = {
  score: number;
  pnl: number;
  rugs: number;
  diamond: number;
  calls: number;
  hitRate: number;
  hold: number;
  bags: number;
  followers: number;
  rank: number;
  txCount: number;
  title: string;
  tier: Tier;
  isVIP: boolean;
};
type LeaderboardEntry = {
  rank: number;
  name: string;
  sol: number;
  score: number;
  pnl: number;
  followers: number;
  tier: Tier;
  wallet: string;
};
type BagsProfile = {
  stats?: Partial<Stats>;
  minted?: boolean;
  wagers?: Array<Partial<Wager>>;
  watching?: string[];
};
type ReferralStats = { refs: number; converted: number; sol: number };
type ReferralStore = Record<string, string[]>;
type ToastState = { msg: string; type: "success" | "error" | "warning" } | null;
type ModalState =
  | { type: "noWallet" }
  | { type: "confirmMint" }
  | { type: "confirmTip"; data: { name: string } }
  | { type: "confirmWager"; data: WagerForm }
  | null;

type PhantomError = { code: number };
type PhantomProvider = {
  isPhantom?: boolean;
  connect?: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect?: () => Promise<void>;
  on?: (event: string, handler: () => void) => void;
  off?: (event: string, handler: () => void) => void;
};

declare global {
  interface Window {
    solana?: PhantomProvider;
    phantom?: { solana?: PhantomProvider };
  }
}

const toPublicKeyString = (value: string): PublicKeyString => {
  const base58 = /^[1-9A-HJ-NP-Za-km-z]+$/;
  if (!value || value.length < 32 || value.length > 44 || !base58.test(value)) {
    throw new Error(
      `Invalid public key '${value}': expected base58 string for a 32-byte key (typically 43-44 characters)`
    );
  }
  return value as PublicKeyString;
};

const isValidPublicKeyString = (value: string | null | undefined) => {
  if (!value) return false;
  try {
    toPublicKeyString(value);
    return true;
  } catch {
    return false;
  }
};

const toISODateString = (date: Date): ISODateString => date.toISOString() as ISODateString;

// ─── FONT LOADER ────────────────────────────────────────────────────────────
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SOL_PRICE_USD = 178;
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const HELIUS_RPC_URL = HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}` : null;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com";
const BAGS_API = (process.env.NEXT_PUBLIC_BAGS_API || "https://api.bags.fm").replace(/\/$/, "");
const BAGS_API_KEY = process.env.NEXT_PUBLIC_BAGS_API_KEY;
const TX_FETCH_LIMIT = 40;
const TX_DISPLAY_LIMIT = 10;
const REF_STORAGE_KEY = "bagtracker:referrals";
const PENDING_REF_KEY = "bagtracker:pending-ref";
const REF_EARNING_PER_REF = 0.05;
const CHECKIN_POINTS_KEY = "bagtracker:checkin-points";
const CHECKIN_LAST_KEY = "bagtracker:last-checkin";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
const ICONS = {
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
} as const;

type IconName = keyof typeof ICONS;

function Ico({ n, s = 18, c = "currentColor", w = 1.6 }: { n: IconName; s?: number; c?: string; w?: number }) {
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
      {ICONS[n]}
    </svg>
  );
}

// ─── APP LOGO ────────────────────────────────────────────────────────────────
function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/app-icon.png"
      alt="BagTracker logo"
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0, borderRadius: size * 0.22 }}
    />
  );
}

// ─── SOLANA RPC ──────────────────────────────────────────────────────────────
async function rpc(method: string, params: unknown[]) {
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

async function getSolBalance(pk: string) {
  const r = await rpc("getBalance", [pk]);
  return r ? r.value / 1e9 : 0;
}

async function getTokenAccounts(pk: string) {
  const r = await rpc("getTokenAccountsByOwner", [
    pk,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ]);
  return r ? r.value : [];
}

function calcSolChangeForWallet(tx: { nativeTransfers?: NativeTransfer[] }, wallet: string) {
  if (!Array.isArray(tx.nativeTransfers) || !tx.nativeTransfers.length) return null;
  const lamports = tx.nativeTransfers.reduce((acc, nt) => {
    const amount = Number(nt.amount || 0);
    if (!Number.isFinite(amount)) return acc;
    if (nt.toUserAccount === wallet) return acc + amount;
    if (nt.fromUserAccount === wallet) return acc - amount;
    return acc;
  }, 0);
  return lamports / 1e9;
}

function normalizeTx(raw: unknown, wallet: string): TransactionInfo | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const sig = typeof r.signature === "string" ? r.signature : "";
  if (!sig) return null;
  const slotNum = Number(r.slot ?? 0);
  const slot = Number.isFinite(slotNum) ? slotNum : 0;
  const blockTime = typeof r.blockTime === "number" ? r.blockTime : null;
  const timestamp = typeof r.timestamp === "number" ? r.timestamp : blockTime;
  const nativeTransfers = Array.isArray((r as { nativeTransfers?: unknown }).nativeTransfers)
    ? (r as { nativeTransfers: NativeTransfer[] }).nativeTransfers
    : [];
  const tokenTransfers = Array.isArray((r as { tokenTransfers?: unknown }).tokenTransfers)
    ? (r as { tokenTransfers: TokenTransfer[] }).tokenTransfers
    : [];
  return {
    signature: sig,
    slot,
    blockTime,
    timestamp,
    err: (r.err as Record<string, unknown>) || null,
    memo: (r.memo as string) || null,
    confirmationStatus: (r.confirmationStatus as string) || undefined,
    description: (r.description as string) || null,
    type: (r.type as string) || null,
    source: (r.source as string) || null,
    nativeTransfers,
    tokenTransfers,
    solChange: calcSolChangeForWallet({ nativeTransfers }, wallet),
  };
}

async function fetchHeliusTxs(pk: string) {
  if (!HELIUS_API_KEY) return null;
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${pk}/transactions?limit=${TX_FETCH_LIMIT}`, {
      headers: { Authorization: `Bearer ${HELIUS_API_KEY}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    return data.map((t) => normalizeTx(t, pk)).filter(Boolean) as TransactionInfo[];
  } catch {
    return null;
  }
}

async function getRecentTxs(pk: string) {
  const helius = await fetchHeliusTxs(pk);
  if (helius?.length) return helius;

  const r = await rpc("getSignaturesForAddress", [pk, { limit: TX_FETCH_LIMIT }]);
  const rows = Array.isArray(r) ? r : [];
  return rows.map((t) => normalizeTx(t, pk)).filter(Boolean) as TransactionInfo[];
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(BAGS_API_KEY ? { Authorization: `Bearer ${BAGS_API_KEY}` } : {}),
      ...(init?.headers || {}),
    };
    const res = await fetch(`${BAGS_API}${path.startsWith("/") ? path : `/${path}`}`, {
      ...init,
      headers,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function waitForConfirmation(signature: string) {
  for (let i = 0; i < 6; i++) {
    const status = await rpc("getSignatureStatuses", [[signature]]);
    const val = status?.value?.[0];
    if (val?.confirmationStatus === "finalized" || val?.confirmationStatus === "confirmed") return true;
    await new Promise((r) => setTimeout(r, 1200));
  }
  return false;
}

async function fetchJupiterPrice() {
  try {
    const res = await fetch("https://price.jup.ag/v6/price?ids=SOL");
    const json = await res.json();
    const val = Number(json?.data?.SOL?.price);
    return Number.isFinite(val) ? val : undefined;
  } catch {
    return undefined;
  }
}

async function fetchCoingeckoPrice() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const json = await res.json();
    const val = Number(json?.solana?.usd);
    return Number.isFinite(val) ? val : undefined;
  } catch {
    return undefined;
  }
}

async function fetchSolUsdPrice() {
  const price = await fetchJson<{ data?: { SOL?: { price?: number } } }>("/price/sol");
  if (price?.data?.SOL?.price) return price.data.SOL.price;

  const jup = await fetchJupiterPrice();
  if (jup) return jup;

  const cg = await fetchCoingeckoPrice();
  if (cg) return cg;

  console.warn("[bagtracker] Falling back to static SOL price");
  return SOL_PRICE_USD;
}

async function fetchBagsProfile(pk: string) {
  return (
    (await fetchJson<BagsProfile>(`/profiles/${pk}`)) ||
    (await fetchJson<BagsProfile>(`/profile?wallet=${pk}`)) ||
    null
  );
}

function normalizeLeaderboard(raw: unknown): LeaderboardEntry[] {
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { leaderboard?: unknown })?.leaderboard)
    ? (raw as { leaderboard: unknown[] }).leaderboard
    : Array.isArray((raw as { leaders?: unknown })?.leaders)
    ? (raw as { leaders: unknown[] }).leaders
    : [];
  return rows
    .map((r) => ({
      rank: Number((r as LeaderboardEntry).rank ?? 0),
      name: String((r as LeaderboardEntry).name ?? ""),
      sol: Number((r as LeaderboardEntry).sol ?? 0),
      score: Number((r as LeaderboardEntry).score ?? 0),
      pnl: Number((r as LeaderboardEntry).pnl ?? 0),
      followers: Number((r as LeaderboardEntry).followers ?? 0),
      tier: ((r as LeaderboardEntry).tier as Tier) || "survivor",
      wallet: String((r as LeaderboardEntry).wallet ?? (r as { pubkey?: string }).pubkey ?? ""),
    }))
    .filter((r) => r.wallet && r.name);
}

async function fetchLeaderboard() {
  const data = (await fetchJson<unknown>("/leaderboard")) || (await fetchJson<unknown>("/leaderboards"));
  return normalizeLeaderboard(data || []);
}

// ─── REFERRAL STORAGE ───────────────────────────────────────────────────────
const EMPTY_REFERRAL_STATS: ReferralStats = { refs: 0, converted: 0, sol: 0 };

function normalizeReferralStatsWithDefaults(raw?: Partial<ReferralStats> | null): ReferralStats {
  return {
    refs: Number(raw?.refs ?? 0) || 0,
    converted: Number(raw?.converted ?? 0) || 0,
    sol: Number(raw?.sol ?? 0) || 0,
  };
}

function readReferralStore(): ReferralStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REF_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object") {
      return Object.fromEntries(
        Object.entries(parsed as ReferralStore).map(([k, v]) => [
          k,
          Array.isArray(v)
            ? v.filter((item): item is string => typeof item === "string" && item.length > 0)
            : [],
        ])
      );
    }
  } catch {
    /* noop */
  }
  return {};
}

function writeReferralStore(store: ReferralStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REF_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* noop */
  }
}

function calculateReferralTotals(referrer: string): ReferralStats {
  if (!isValidPublicKeyString(referrer)) return EMPTY_REFERRAL_STATS;
  const store = readReferralStore();
  const uniqueRefs = Array.isArray(store[referrer])
    ? Array.from(new Set(store[referrer].filter((v) => typeof v === "string" && v.length > 0)))
    : [];
  const converted = uniqueRefs.length;
  return {
    refs: converted,
    converted,
    sol: Number((converted * REF_EARNING_PER_REF).toFixed(3)),
  };
}

function persistLocalReferral(referrer: string, referred: string): { stats: ReferralStats; added: boolean } {
  if (!isValidPublicKeyString(referrer) || !isValidPublicKeyString(referred) || referrer === referred)
    return { stats: calculateReferralTotals(referrer), added: false };
  const store = readReferralStore();
  const existing = Array.isArray(store[referrer])
    ? store[referrer].filter((v): v is string => typeof v === "string" && v.length > 0)
    : [];
  const hadReferral = existing.includes(referred);
  if (!hadReferral) existing.push(referred);
  store[referrer] = existing;
  writeReferralStore(store);
  return { stats: calculateReferralTotals(referrer), added: !hadReferral };
}

async function fetchReferralStats(referrer: string): Promise<ReferralStats | null> {
  if (!isValidPublicKeyString(referrer)) return null;
  const data = await fetchJson<Partial<ReferralStats>>(`/referrals?wallet=${encodeURIComponent(referrer)}`);
  if (data) return normalizeReferralStatsWithDefaults(data);
  console.warn("[bagtracker] referral stats unavailable", referrer);
  return null;
}

async function recordRemoteReferral(referrer: string, referred: string): Promise<boolean> {
  if (!isValidPublicKeyString(referrer) || !isValidPublicKeyString(referred)) return false;
  const res = await fetchJson<unknown>("/referrals", {
    method: "POST",
    body: JSON.stringify({ referrer, referred }),
  });
  return res !== null;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt$ = (n: number | string, d = 2) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtN = (n: number | string, d = 2) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtSol = (n: number | string) =>
  "◎" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const shrt = (a: string | null | undefined) => (a ? a.slice(0, 5) + "..." + a.slice(-4) : "");

function hasCheckedInWithin24h(last: number | null) {
  if (!last) return false;
  return Date.now() - last < ONE_DAY_MS;
}

function formatCheckInCountdown(last: number | null) {
  if (!last) return "Ready to check in";
  const remaining = Math.max(0, last + ONE_DAY_MS - Date.now());
  if (remaining <= 0) return "Ready to check in";
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  if (hours > 0) return `Next point in ${hours}h ${minutes.toString().padStart(2, "0")}m`;
  if (minutes > 0) return `Next point in ${minutes}m`;
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `Next point in ${seconds}s`;
}

function calcDegenScore(sol: number, tokenCount: number, txCount: number) {
  const liquidity = Math.min(sol * 2, 40);
  const activity = Math.min(txCount * 1.2, 40);
  const diversity = Math.min(tokenCount * 1.4, 20);
  return Math.min(100, Math.round(liquidity + activity + diversity));
}

function deriveTier(score: number): Tier {
  return (score >= 90 ? "god" : score >= 75 ? "diamond" : score >= 55 ? "ape" : "survivor") as Tier;
}

function deriveTitle(score: number) {
  return score >= 90
    ? "Degen God"
    : score >= 75
    ? "Diamond Hands"
    : score >= 55
    ? "Seasoned Ape"
    : score >= 35
    ? "Rug Survivor"
    : "Paper Hands";
}

function buildStats(
  sol: number,
  tokens: ReadonlyArray<TokenAccount>,
  txs: ReadonlyArray<TransactionInfo>,
  bagStats?: Partial<Stats>
): Stats {
  const score = bagStats?.score ?? calcDegenScore(sol, tokens.length, txs.length);
  const tier = bagStats?.tier ?? deriveTier(score);
  const txCount = bagStats?.txCount ?? txs.length;
  const bags = bagStats?.bags ?? tokens.length;
  return {
    score,
    pnl: bagStats?.pnl ?? 0,
    rugs: bagStats?.rugs ?? 0,
    diamond: bagStats?.diamond ?? 0,
    calls: bagStats?.calls ?? 0,
    hitRate: bagStats?.hitRate ?? 0,
    hold: bagStats?.hold ?? 0,
    bags,
    followers: bagStats?.followers ?? 0,
    rank: bagStats?.rank ?? 0,
    txCount,
    title: bagStats?.title ?? deriveTitle(score),
    tier,
    isVIP: bagStats?.isVIP ?? score >= 82,
  };
}

function isPhantomError(e: unknown): e is PhantomError {
  if (typeof e !== "object" || e === null || !("code" in e)) return false;
  return typeof (e as { code: unknown }).code === "number";
}

function formatAgo(ts?: number | null) {
  if (!ts) return "—";
  const ms = ts < 1e12 ? ts * 1000 : ts;
  const diff = Date.now() - ms;
  if (diff < 0) return "in future";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatSolDelta(v?: number | null) {
  if (v == null || Number.isNaN(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(4)} ◎`;
}

function activityColor(change: number | null | undefined) {
  if (change == null) return T.text;
  if (change === 0) return T.text;
  return change > 0 ? T.green : T.red;
}

const hasNonZeroSolChange = (tx: TransactionInfo) => {
  const change = tx.solChange ?? null;
  return change !== null && !Number.isNaN(change) && change !== 0;
};

// ─── ANIMATED NUMBER ─────────────────────────────────────────────────────────
function AnimNum({
  to,
  fmt = fmtN,
  dec = 2,
  dur = 1000,
}: {
  to: number | string;
  fmt?: (value: number, decimals: number) => ReactNode;
  dec?: number;
  dur?: number;
}) {
  const [v, setV] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const target = parseFloat(String(to)) || 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setV(target * ease);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [to, dur]);
  return <>{fmt(v, dec)}</>;
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({
  msg,
  type = "success",
  onClose,
}: {
  msg: string;
  type?: "success" | "error" | "warning";
  onClose: () => void;
}) {
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
function Modal({
  title,
  children,
  onClose,
  width = 480,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: number;
}) {
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
function Card({
  children,
  style = {},
  accent = false,
  glow = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  accent?: boolean;
  glow?: boolean;
}) {
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

// ─── LABEL ────────────────────────────────────────────────────────────────────
function Label({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) {
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
function Bar({
  pct,
  color = T.green,
  height = 6,
  animated = true,
}: {
  pct: number;
  color?: string;
  height?: number;
  animated?: boolean;
}) {
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
function StatBox({
  label,
  value,
  sub,
  icon,
  color = T.text,
  bg = T.surfaceAlt,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: IconName;
  color?: string;
  bg?: string;
}) {
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
}: {
  children?: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "dark" | "danger" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  style?: CSSProperties;
  fullWidth?: boolean;
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

const TIER_C: Record<Tier, string> = { god: T.purple, diamond: "#0891b2", ape: T.green, survivor: T.gold };

const GOAL_OPTIONS: Goal[] = [
  { type: "portfolio", target: 10000, label: "$10k" },
  { type: "portfolio", target: 50000, label: "$50k" },
  { type: "followers", target: 10000, label: "10k flw" },
];
const FILTERS: Array<"all" | Tier> = ["all", "god", "diamond", "ape", "survivor"];
const LANDING_FEATURES: Array<[IconName, string]> = [
  ["diamond", "Mintable NFT Cards"],
  ["zap", "Onchain Wagers"],
  ["lock", "VIP Token Gate"],
  ["gift", "Referral Bounties"],
  ["trophy", "Live Leaderboard"],
  ["flame", "Daily Streaks"],
];
const HIGHLIGHT_FEATURES: Array<{ icon: IconName; title: string; desc: string }> = [
  { icon: "shield", title: "Non-Custodial", desc: "We never hold your keys. Read-only wallet access." },
  { icon: "activity", title: "Real-Time Data", desc: "Live SOL balance and token data from Solana mainnet." },
  { icon: "trending", title: "On-Chain Proof", desc: "All wagers and NFT mints are verifiable on-chain." },
];
const VIP_PERKS: Array<[IconName, string]> = [
  ["diamond", "Priority Support"],
  ["bell", "Instant Whale Alerts"],
  ["gift", "Boosted Referrals"],
  ["shield", "Rug Protection Radar"],
];
const BREAKDOWN_STATS: Array<{ icon: IconName; label: string; getValue: (stats: Stats) => ReactNode }> = [
  { icon: "users", label: "Rugs Survived", getValue: (s) => s.rugs },
  { icon: "diamond", label: "Diamond Hands", getValue: (s) => `${s.diamond}%` },
  { icon: "bell", label: "Calls Made", getValue: (s) => s.calls },
  { icon: "target", label: "Hit Rate", getValue: (s) => `${s.hitRate}%` },
  { icon: "trending", label: "Followers", getValue: (s) => fmtN(s.followers, 0) },
  { icon: "activity", label: "Longest Hold", getValue: (s) => `${s.hold}d` },
];

// ─── DEGEN CARD COMPONENT ────────────────────────────────────────────────────
function DegenCardVisual({
  stats,
  pubkey,
  sol,
  minted,
}: {
  stats: Stats;
  pubkey: string | null;
  sol: number;
  minted: boolean;
}) {
  const pos = stats.pnl >= 0;
  const tierColors: Record<Tier, [string, string]> = {
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
const NAV: Array<{ id: string; icon: IconName; label: string; badge?: string }> = [
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
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [sol, setSol] = useState(0);
  const [tokens, setTokens] = useState<TokenAccount[]>([]);
  const [txs, setTxs] = useState<TransactionInfo[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // App state
  const [page, setPage] = useState<string>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [modal, setModal] = useState<ModalState>(null); // { type, data }

  // UI state
  const [sideOpen, setSideOpen] = useState(true);
  const [mobileSide, setMobileSide] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Feature state
  const [minted, setMinted] = useState(false);
  const [minting, setMinting] = useState(false);
  const [checkInPoints, setCheckInPoints] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  const [goal, setGoal] = useState<Goal>({ type: "portfolio", target: 10000, label: "$10k" });
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [watching, setWatching] = useState<string[]>([]);
  const [tipping, setTipping] = useState<string | null>(null);
  const [tipped, setTipped] = useState<Record<string, boolean>>({});
  const [refCopied, setRefCopied] = useState(false);
  const [pendingReferrerKey, setPendingReferrerKey] = useState<string | null>(null);
  const [refEarnings, setRefEarnings] = useState<ReferralStats>(EMPTY_REFERRAL_STATS);
  const [wagerForm, setWagerForm] = useState<WagerForm>({ type: "followers", amount: 5, target: 1000 });
  const [lbFilter, setLbFilter] = useState<"all" | Tier>("all");
  const [solPrice, setSolPrice] = useState(SOL_PRICE_USD);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [bagsError, setBagsError] = useState<string | null>(null);
  const [bagsProfileLoading, setBagsProfileLoading] = useState(false);

  const readRefFromUrl = useCallback(() => {
    // Prefer the current URL parameter over any cached referral to ensure the latest referrer is honored.
    if (typeof window === "undefined") return;
    const storedRef = localStorage.getItem(PENDING_REF_KEY);
    const urlRef = new URLSearchParams(window.location.search).get("ref");
    const ref = urlRef || storedRef;
    if (ref && isValidPublicKeyString(ref)) {
      setPendingReferrerKey(ref);
      localStorage.setItem(PENDING_REF_KEY, ref);
    } else if (storedRef) {
      localStorage.removeItem(PENDING_REF_KEY);
    }
  }, []);

  const totalUsd = sol * solPrice;
  const goalPct =
    goal.type === "portfolio"
      ? (totalUsd / goal.target) * 100
      : ((stats?.followers || 0) / goal.target) * 100;
  const SIDEBAR_W = sideOpen ? 236 : 68;
  const checkInFilled = Math.min(checkInPoints, 7);
  const checkInSubtitle = checkedIn ? formatCheckInCountdown(lastCheckIn) : "Earn 1 point every 24h";
  const txsWithChange = txs.filter(hasNonZeroSolChange);
  const txsDisplayCount = txsWithChange.length
    ? Math.min(txsWithChange.length, TX_DISPLAY_LIMIT)
    : Math.min(txs.length, TX_DISPLAY_LIMIT);
  const txsLabel = txsWithChange.length
    ? `Last ${txsDisplayCount} SOL change${txsDisplayCount === 1 ? "" : "s"}`
    : `Last ${txsDisplayCount} transaction${txsDisplayCount === 1 ? "" : "s"}`;
  const txsForDisplay = (txsWithChange.length ? txsWithChange : txs).slice(0, TX_DISPLAY_LIMIT);

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

  // Restore daily check-in progress
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPointsRaw = localStorage.getItem(CHECKIN_POINTS_KEY);
    const storedPoints = Number(storedPointsRaw);
    setCheckInPoints(Number.isFinite(storedPoints) ? Math.max(0, storedPoints) : 0);
    const storedLastRaw = localStorage.getItem(CHECKIN_LAST_KEY);
    const parsedLast = storedLastRaw ? Number(storedLastRaw) : null;
    const validLast = parsedLast !== null && Number.isFinite(parsedLast) ? parsedLast : null;
    setLastCheckIn(validLast);
    setCheckedIn(hasCheckedInWithin24h(validLast));
  }, []);

  // Auto-unlock check-in once 24h have passed
  useEffect(() => {
    if (!lastCheckIn) {
      setCheckedIn(false);
      return;
    }
    const remaining = lastCheckIn + ONE_DAY_MS - Date.now();
    if (remaining <= 0) {
      setCheckedIn(false);
      return;
    }
    const id = setTimeout(() => setCheckedIn(false), remaining);
    return () => clearTimeout(id);
  }, [lastCheckIn]);

  // Capture referral parameter from URL or previous session
  useEffect(() => {
    if (typeof window === "undefined") return;
    readRefFromUrl();
    window.addEventListener("popstate", readRefFromUrl);
    window.addEventListener("hashchange", readRefFromUrl);
    return () => {
      window.removeEventListener("popstate", readRefFromUrl);
      window.removeEventListener("hashchange", readRefFromUrl);
    };
  }, [readRefFromUrl]);

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

  // Live SOL price
  useEffect(() => {
    let active = true;
    const load = async () => {
      const p = await fetchSolUsdPrice();
      if (active && p) setSolPrice(p);
    };
    load();
    const id = setInterval(load, 60000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Load leaderboard from bags.fm
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLeaderboardLoading(true);
      const lb = await fetchLeaderboard();
      if (cancelled) return;
      setLeaderboard(lb);
      setLeaderboardLoading(false);
      if (!lb.length) setBagsError("Unable to load leaderboard from bags.fm");
    };
    load();
    return () => {
      cancelled = true;
    };
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

  const showToast = (msg: string, type: NonNullable<ToastState>["type"] = "success") => setToast({ msg, type });

  const syncReferralStats = useCallback(
    async (walletAddress: string) => {
      if (!walletAddress) {
        setRefEarnings(EMPTY_REFERRAL_STATS);
        return;
      }
      const remote = await fetchReferralStats(walletAddress);
      if (remote) {
        setRefEarnings(remote);
        return;
      }
      setRefEarnings(calculateReferralTotals(walletAddress));
    },
    []
  );

  const applyBagsProfile = (profile: BagsProfile | null | undefined) => {
    if (!profile) return;
    const watchList = (profile as { watchings?: string[] }).watchings || profile.watching;
    if (Array.isArray(watchList)) setWatching(watchList);
    if (Array.isArray(profile.wagers)) {
      setWagers(
        profile.wagers
          .map((w, i) => ({
            id: w.id || Date.now() + i,
            amount: Number(w.amount || 0),
            target: Number(w.target || 0),
            type: (w.type as Wager["type"]) || "followers",
            placed: (w.placed as ISODateString) || toISODateString(new Date()),
            status: (w.status as Wager["status"]) || "active",
            progress: Number(w.progress || 0),
          }))
          .filter((w) => !Number.isNaN(w.amount))
      );
    }
    if (typeof profile.minted === "boolean") setMinted(profile.minted);
  };

  const loadPortfolio = useCallback(async (pk: PublicKeyString) => {
    setBagsProfileLoading(true);
    setBagsError(null);
    try {
      const [balR, tknsR, txListR, bagProfileR] = await Promise.allSettled([
        getSolBalance(pk),
        getTokenAccounts(pk),
        getRecentTxs(pk),
        fetchBagsProfile(pk),
      ]);
      const bal = balR.status === "fulfilled" ? balR.value : 0;
      const tkns = tknsR.status === "fulfilled" ? tknsR.value : [];
      const txList = txListR.status === "fulfilled" ? txListR.value : [];
      const bagProfile = bagProfileR.status === "fulfilled" ? bagProfileR.value : null;
      setSol(bal);
      setTokens(tkns);
      setTxs(txList);
      const mergedStats = buildStats(bal, tkns, txList, bagProfile?.stats);
      setStats(mergedStats);
      applyBagsProfile(bagProfile || undefined);
    } catch {
      setBagsError("Unable to load bags.fm data");
      setStats(buildStats(0, [], []));
    } finally {
      setBagsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const walletPk = wallet?.publicKey ? wallet.publicKey.toString() : "";
    syncReferralStats(walletPk);
  }, [wallet?.publicKey, syncReferralStats]);

  // Connect wallet
  const connect = useCallback(async () => {
    const p = window?.solana || window?.phantom?.solana;
    if (!p?.isPhantom || !p.connect) {
      setModal({ type: "noWallet" });
      return;
    }
    setConnecting(true);
    try {
      const resp = await p.connect();
      const pk = toPublicKeyString(resp.publicKey.toString());
      setWallet({ publicKey: pk });
      await loadPortfolio(pk);
      showToast("Wallet connected — Solana Mainnet");
    } catch (e: unknown) {
      const code = isPhantomError(e) ? e.code : undefined;
      if (code !== 4001) showToast("Connection failed. Try again.", "error");
    } finally {
      setConnecting(false);
    }
  }, [loadPortfolio]);

  // Disconnect
  const disconnect = () => {
    window?.solana?.disconnect?.();
    setWallet(null);
    setSol(0);
    setTokens([]);
    setTxs([]);
    setStats(null);
    setMinted(false);
    setWagers([]);
    setWatching([]);
    setBagsError(null);
    showToast("Wallet disconnected");
  };

  useEffect(() => {
    if (!wallet?.publicKey || !pendingReferrerKey) return;
    const walletPk = wallet.publicKey.toString();
    if (pendingReferrerKey === walletPk) {
      setPendingReferrerKey(null);
      if (typeof window !== "undefined") localStorage.removeItem(PENDING_REF_KEY);
      return;
    }
    const referrer = pendingReferrerKey;
    const referred = walletPk;
    const recordReferral = async () => {
      let recordedLocally = false;
      let recordedRemotely = false;
      try {
        const { stats: localStats, added } = persistLocalReferral(referrer, referred);
        recordedLocally = added || localStats.refs > 0;
        recordedRemotely = await recordRemoteReferral(referrer, referred);
      } catch (err) {
        console.error("[bagtracker] referral capture failed", err);
      } finally {
        setToast(
          recordedRemotely
            ? { msg: "Referral recorded - thanks for using a friend's link!", type: "success" }
            : recordedLocally
            ? { msg: "Referral captured locally - syncing may take a moment.", type: "warning" }
            : { msg: "Unable to record referral. Please try again later.", type: "error" }
        );
        setPendingReferrerKey(null);
        if (typeof window !== "undefined") localStorage.removeItem(PENDING_REF_KEY);
      }
    };
    recordReferral();
  }, [wallet?.publicKey, pendingReferrerKey]);

  // Refresh wallet data
  const refreshWallet = async () => {
    if (!wallet || refreshing) return;
    setRefreshing(true);
    try {
      await loadPortfolio(wallet.publicKey);
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
    if (!wallet) {
      showToast("Connect wallet first", "warning");
      return;
    }
    setModal(null);
    setMinting(true);
    try {
      const res = await fetchJson<{ signature?: string; minted?: boolean }>("/mint", {
        method: "POST",
        body: JSON.stringify({ wallet: wallet.publicKey }),
      });
      if (res?.signature) await waitForConfirmation(res.signature);
      setMinted(Boolean(res?.minted ?? res?.signature));
      showToast("Degen Card mint confirmed on-chain");
    } catch {
      showToast("Mint failed — check your wallet approval", "error");
    } finally {
      setMinting(false);
    }
  };

  // Tip
  const doTip = (name: string) => {
    if (!wallet) {
      showToast("Connect wallet first", "warning");
      return;
    }
    setModal({ type: "confirmTip", data: { name } });
  };

  const confirmTip = async (name: string) => {
    setModal(null);
    setTipping(name);
    try {
      const res = await fetchJson<{ signature?: string }>("/tips", {
        method: "POST",
        body: JSON.stringify({ from: wallet?.publicKey, to: name, amount: 0.1 }),
      });
      if (res?.signature) await waitForConfirmation(res.signature);
      setTipped((p) => ({ ...p, [name]: true }));
      showToast(`Tip submitted on-chain to ${name}`);
    } catch {
      showToast("Tip failed — please retry", "error");
    } finally {
      setTipping(null);
    }
  };

  // Check in
  const doCheckIn = () => {
    if (hasCheckedInWithin24h(lastCheckIn)) {
      showToast("Already checked in. Come back after 24 hours.", "warning");
      return;
    }
    const now = Date.now();
    const nextPoints = checkInPoints + 1;
    setCheckedIn(true);
    setCheckInPoints(nextPoints);
    setLastCheckIn(now);
    try {
      localStorage.setItem(CHECKIN_POINTS_KEY, String(nextPoints));
      localStorage.setItem(CHECKIN_LAST_KEY, String(now));
    } catch {
      /* ignore storage errors */
    }
    showToast(`+1 point added — total ${nextPoints}`);
  };

  // Place wager
  const doWager = () => {
    if (!wallet) {
      showToast("Connect wallet first", "warning");
      return;
    }
    setModal({ type: "confirmWager", data: wagerForm });
  };

  const confirmWager = (form: WagerForm) => {
    setModal(null);
    if (!wallet) {
      showToast("Connect wallet first", "warning");
      return;
    }
    const submit = async () => {
      try {
        const res = await fetchJson<{ signature?: string; wager?: Partial<Wager> }>("/wagers", {
          method: "POST",
          body: JSON.stringify({ wallet: wallet.publicKey, ...form }),
        });
        if (res?.signature) await waitForConfirmation(res.signature);
        const wager = res?.wager;
        if (wager) {
          setWagers((w) => [
            ...w,
            {
              ...form,
              id: wager.id ?? Date.now(),
              placed: (wager.placed as ISODateString) ?? toISODateString(new Date()),
              status: (wager.status as Wager["status"]) ?? "active",
              progress: Number(wager.progress ?? 0),
            },
          ]);
        }
        showToast(`Wager placed — ${form.amount} SOL staked`);
      } catch {
        showToast("Unable to place wager — try again", "error");
      }
    };
    submit();
  };

  // Cancel wager
  const cancelWager = (id: number) => {
    setWagers((w) => w.filter((x) => x.id !== id));
    showToast("Wager cancelled — SOL returned");
  };

  // Watch whale
  const toggleWatch = (name: string) => {
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
    if (!wallet?.publicKey) {
      showToast("Connect your wallet to get your referral link", "warning");
      return;
    }
    const base =
      (typeof window !== "undefined" && window.location?.origin) || "https://bagstracker-seven.vercel.app";
    const pk = wallet.publicKey.toString();
    const link = `${base}?ref=${encodeURIComponent(pk)}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2500);
    showToast("Referral link copied!");
  };

  // Share
  const shareX = (text: string) =>
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  const shareCast = (text: string) =>
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, "_blank");

  const navigate = (id: string) => {
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
        {LANDING_FEATURES.map(([ico, t]) => (
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
        {HIGHLIGHT_FEATURES.map((f) => (
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
              <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Daily Check-ins</span>
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
              {!checkedIn && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    background: T.surfaceAlt,
                    color: T.textSec,
                    borderRadius: 20,
                    fontFamily: T.mono,
                  }}
                >
                  {checkInPoints} pts
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
                    background: i < checkInFilled ? `linear-gradient(90deg,${T.green},#4ade80)` : T.border,
                    transition: "background .3s",
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.textSec, marginBottom: 14, fontFamily: T.sans }}>
              {checkInPoints} points · {checkInSubtitle}
            </div>
            <Btn
              fullWidth
              variant={checkedIn ? "secondary" : "primary"}
              disabled={checkedIn}
              icon={checkedIn ? "check" : "flame"}
              onClick={doCheckIn}
            >
              {checkedIn ? "Checked in today" : "Add today's point"}
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
            {GOAL_OPTIONS.map((g) => (
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
            {BREAKDOWN_STATS.map((s) => (
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
                  {s.getValue(stats)}
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Ico n="activity" s={16} c={T.green} />
              <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Recent On-Chain Activity</span>
              <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: T.mono, color: T.textMute }}>
                {HELIUS_API_KEY ? "via Helius RPC" : "via Solana RPC"} · {txsLabel}
              </span>
            </div>
            <div style={{ fontSize: 11, color: T.textMute, fontFamily: T.mono, marginBottom: 8 }}>
              Wallet balance: {fmtSol(sol)}
            </div>
            {txsWithChange.length === 0 && txs.length > 0 && (
              <div style={{ fontSize: 11, color: T.textMute, marginBottom: 6 }}>
                No SOL deltas detected — showing recent transactions instead.
              </div>
            )}
            {txsForDisplay.length === 0 ? (
              <div style={{ color: T.textMute, fontSize: 13 }}>No transactions found for this wallet yet.</div>
            ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {txsForDisplay.map((t) => {
                const when = t.timestamp ?? t.blockTime ?? null;
                const change = t.solChange ?? null;
                const color = activityColor(change);
                const label = t.description || t.type || t.source || "Transaction";
                return (
                  <div
                    key={t.signature}
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1.4fr auto auto",
                      gap: 8,
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid ${T.border}`,
                      background: T.surfaceAlt,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: T.text }}>{label}</div>
                      <div style={{ fontSize: 11, color: T.textMute }}>{formatAgo(when)}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontFamily: T.mono, color }}>{formatSolDelta(change)}</div>
                    <a
                      href={`https://solscan.io/tx/${t.signature}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 11, color: T.textSec, textDecoration: "none" }}
                    >
                      {shrt(t.signature)}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
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
            {leaderboard.slice(0, 6).map((w) => (
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
                <Btn size="sm" variant="ghost" onClick={() => doTip(w.name)} disabled={!!tipped[w.name]}>
                  {tipped[w.name] ? "Tipped" : "Tip"}
                </Btn>
              </div>
            ))}
            {!leaderboardLoading && !leaderboard.length && (
              <div style={{ color: T.textMute, fontSize: 13, padding: "4px 0" }}>
                No whale data yet. Bags.fm leaderboard will appear once loaded.
              </div>
            )}
            {leaderboardLoading && (
              <div style={{ color: T.textMute, fontSize: 13, padding: "4px 0" }}>Loading whales from bags.fm…</div>
            )}
          </div>
        </Card>
      </div>
    );

  // ── Degen card page
  const DegenCardPage =
    wallet && stats ? (
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
    ) : null;

  // ── Leaderboard page
  const LeaderboardPage = (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Ico n="trophy" s={16} c={T.green} />
          <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Top Degens</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {FILTERS.map((f) => (
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
               {leaderboard
                .filter((x) => lbFilter === "all" || x.tier === lbFilter)
                .map((w) => (
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
          {!leaderboardLoading && !leaderboard.length && (
            <div style={{ padding: "12px 8px", color: T.textMute, fontSize: 13 }}>No leaderboard data yet.</div>
          )}
          {leaderboardLoading && (
            <div style={{ padding: "12px 8px", color: T.textMute, fontSize: 13 }}>Loading leaderboard…</div>
          )}
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
              onChange={(e) => setWagerForm((f) => ({ ...f, type: e.target.value as WagerForm["type"] }))}
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
            {VIP_PERKS.map(([ico, title]) => (
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

          {wallet && (bagsProfileLoading || bagsError) && (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${bagsError ? T.red : T.border}`,
                background: bagsError ? T.redLight : T.surfaceAlt,
                color: bagsError ? T.red : T.textSec,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {bagsError ? bagsError : "Syncing live data from bags.fm and Solana…"}
            </div>
          )}

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
            This will mint your current Degen Card to Solana mainnet via bags.fm. Please approve the transaction in your
            wallet.
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
            Tip 0.1 ◎ to {modal.data.name}. We submit a signed transaction so the transfer is verifiable on-chain.
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
            Stake {wagerForm.amount} ◎ on reaching {wagerForm.target} {wagerForm.type}. We submit the wager to bags.fm
            so it can be settled on-chain.
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
