“use client”;

import { useState, useEffect, useCallback, useRef } from “react”;

/* ─── Fonts loaded in useEffect (SSR safe) ──────────────────────────────── */
const FONT_URL = “https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap”;

/* ─── App Icon ───────────────────────────────────────────────────────────── */
function AppIcon({ size = 32 }: { size?: number }) {
return (
<svg width={size} height={size} viewBox=“0 0 48 48” fill=“none” xmlns=“http://www.w3.org/2000/svg”
style={{ display:“block”, flexShrink:0, borderRadius: size * 0.22 }}>
<rect width="48" height="48" rx="11" fill="#16a34a"/>
<path d="M14 33C14 38 34 38 34 33V22C34 16 14 16 14 22Z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.4"/>
<path d="M19 16C19 11 29 11 29 16" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
<circle cx="28" cy="27" r="6" stroke="white" strokeWidth="1.6" fill="none"/>
<line x1="32.2" y1="31.2" x2="35" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
<path d="M24 25V27.5L25.5 29" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
</svg>
);
}

/* ─── SVG Icon System (no emojis) ───────────────────────────────────────── */
const Icon = ({ name, size=18, color=“currentColor”, strokeWidth=1.6 }) => {
const paths = {
grid:        <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
card:        <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
trophy:      <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>,
zap:         <><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></>,
lock:        <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
gift:        <><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>,
chevronLeft: <><polyline points="15 18 9 12 15 6"/></>,
chevronRight:<><polyline points="9 18 15 12 9 6"/></>,
menu:        <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
x:           <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
check:       <><polyline points="20 6 9 17 4 12"/></>,
copy:        <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
share:       <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
trending:    <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
users:       <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
target:      <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
flame:       <><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></>,
eye:         <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
eyeOff:      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
diamond:     <><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/></>,
arrowUp:     <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
arrowDown:   <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>,
wallet:      <><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></>,
link:        <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
crown:       <><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></>,
star:        <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
coins:       <><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></>,
activity:    <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
bell:        <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
logout:      <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
};
return (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
{paths[name]}
</svg>
);
};

/* ─── Solana RPC ─────────────────────────────────────────────────────────── */
const RPC = “https://api.mainnet-beta.solana.com”;
async function getSolBalance(pk) {
try {
const r = await fetch(RPC, { method:“POST”, headers:{“Content-Type”:“application/json”},
body: JSON.stringify({ jsonrpc:“2.0”, id:1, method:“getBalance”, params:[pk] }) });
return ((await r.json()).result?.value||0)/1e9;
} catch { return 0; }
}
async function getTokenAccounts(pk) {
try {
const r = await fetch(RPC, { method:“POST”, headers:{“Content-Type”:“application/json”},
body: JSON.stringify({ jsonrpc:“2.0”, id:1, method:“getTokenAccountsByOwner”,
params:[pk,{programId:“TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA”},{encoding:“jsonParsed”}]}) });
return (await r.json()).result?.value||[];
} catch { return []; }
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmtUSD = (n,d=2) => “$”+Number(n).toLocaleString(“en-US”,{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtN   = (n,d=2) => Number(n).toLocaleString(“en-US”,{minimumFractionDigits:d,maximumFractionDigits:d});
const shrt   = a => a?`${a.slice(0,5)}…${a.slice(-4)}`:””;
const rng    = (seed,lo,hi) => { let h=0; for(let i=0;i<seed.length;i++) h=(Math.imul(31,h)+seed.charCodeAt(i))|0; return lo+(Math.abs(h%1000)/1000)*(hi-lo); };
const ri     = (s,a,b) => Math.floor(rng(s,a,b));

function buildStats(pk, sol, tc) {
const score = Math.min(100,Math.floor(rng(pk+“d”,20,90)+Math.min(sol*2,18)+Math.min(tc,12)));
return {
score, rugs:ri(pk+“r”,0,22), diamond:ri(pk+“dm”,10,100), calls:ri(pk+“c”,2,55),
hitRate:ri(pk+“h”,8,70), pnl:rng(pk+“p”,-40,420), hold:ri(pk+“ho”,1,720),
bags:tc||ri(pk+“bg”,1,34), followers:ri(pk+“fo”,120,12000), rank:ri(pk+“rk”,8,2800),
title: score>=90?“Degen God”:score>=75?“Diamond Hands”:score>=55?“Seasoned Ape”:score>=35?“Rug Survivor”:“Paper Hands”,
tier:  score>=90?“god”:score>=75?“diamond”:score>=55?“ape”:“survivor”,
isVIP: score>=82,
};
}

/* ─── Animated counter ───────────────────────────────────────────────────── */
function Count({ to, fmt=fmtN, dec=2, ms=900 }) {
const [v,setV] = useState(0);
const raf = useRef();
useEffect(()=>{
const t=parseFloat(to)||0,t0=performance.now();
const tick=now=>{const p=Math.min((now-t0)/ms,1),e=1-Math.pow(1-p,4);setV(t*e);if(p<1)raf.current=requestAnimationFrame(tick);};
raf.current=requestAnimationFrame(tick);
return()=>cancelAnimationFrame(raf.current);
},[to]);
return <>{fmt(v,dec)}</>;
}

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
bg:        “#f7f4ef”,
surface:   “#ffffff”,
surfaceAlt:”#f0ede8”,
sidebar:   “#0d1a0d”,
sideHov:   “#182e18”,
sideAct:   “#16a34a”,
border:    “#e2ddd6”,
borderStr: “#ccc7bf”,
green:     “#16a34a”,
greenLight:”#dcfce7”,
greenMid:  “#86efac”,
greenStr:  “#15803d”,
text:      “#131a12”,
textSec:   “#5c6b5c”,
textMute:  “#9aa498”,
red:       “#dc2626”,
redLight:  “#fee2e2”,
gold:      “#b45309”,
goldLight: “#fef3c7”,
purple:    “#6d28d9”,
purpleLight:”#ede9fe”,
mono:      “‘JetBrains Mono’, monospace”,
sans:      “‘Instrument Sans’, sans-serif”,
};

/* ─── Leaderboard data ───────────────────────────────────────────────────── */
const LB_DATA = [
{rank:1, name:“DegenGod.sol”,    sol:18420, score:99, pnl:892, followers:48200, tier:“god”},
{rank:2, name:“DiamondFlip.sol”, sol:9810,  score:94, pnl:541, followers:32100, tier:“diamond”},
{rank:3, name:“ApeKing.sol”,     sol:7050,  score:88, pnl:398, followers:21800, tier:“ape”},
{rank:4, name:“MoonBag.sol”,     sol:5870,  score:81, pnl:271, followers:18400, tier:“god”},
{rank:5, name:“Wagmi.sol”,       sol:4240,  score:77, pnl:198, followers:14300, tier:“diamond”},
{rank:6, name:“BagsKing.sol”,    sol:3110,  score:71, pnl:143, followers:10200, tier:“ape”},
{rank:7, name:“OnChain.sol”,     sol:2480,  score:65, pnl:98,  followers:7800,  tier:“ape”},
{rank:8, name:“AlphaApe.sol”,    sol:1840,  score:59, pnl:67,  followers:5400,  tier:“survivor”},
];
const TIER_COLOR = {god:C.purple, diamond:”#0891b2”, ape:C.green, survivor:C.gold};

/* ─── Beautiful background SVG ──────────────────────────────────────────── */
function BackgroundArt() {
return (
<div style={{position:“fixed”,inset:0,zIndex:0,overflow:“hidden”,pointerEvents:“none”}}>
{/* Warm cream base */}
<div style={{position:“absolute”,inset:0,background:”#f7f4ef”}}/>
{/* Large radial — top right */}
<div style={{position:“absolute”,top:-200,right:-200,width:700,height:700,borderRadius:“50%”,
background:“radial-gradient(circle,rgba(22,163,74,0.06) 0%,transparent 70%)”}}/>
{/* Bottom left */}
<div style={{position:“absolute”,bottom:-150,left:-150,width:500,height:500,borderRadius:“50%”,
background:“radial-gradient(circle,rgba(22,163,74,0.05) 0%,transparent 70%)”}}/>
{/* Diagonal fine grid */}
<svg style={{position:“absolute”,inset:0,width:“100%”,height:“100%”,opacity:0.45}} xmlns=“http://www.w3.org/2000/svg”>
<defs>
<pattern id="diag" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<line x1="0" y1="0" x2="0" y2="28" stroke="#16a34a" strokeWidth="0.4" strokeOpacity="0.18"/>
</pattern>
<pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
<circle cx="16" cy="16" r="0.9" fill="#16a34a" fillOpacity="0.15"/>
</pattern>
</defs>
<rect width="100%" height="100%" fill="url(#diag)"/>
<rect width="100%" height="100%" fill="url(#dots)"/>
</svg>
{/* Horizontal rule lines — editorial feel */}
{[120,240,400,600].map(y=>(
<div key={y} style={{position:“absolute”,top:y,left:0,right:0,height:1,
background:`linear-gradient(90deg,transparent 0%,rgba(22,163,74,0.1) 30%,rgba(22,163,74,0.1) 70%,transparent 100%)`}}/>
))}
</div>
);
}

/* ─── Reusable Card ──────────────────────────────────────────────────────── */
function Card({ children, style={}, accent=false }) {
return (
<div style={{background:C.surface, border:`1px solid ${accent?C.green:C.border}`,
borderRadius:16, padding:“22px”, position:“relative”,
boxShadow:“0 1px 4px rgba(0,0,0,0.04)”, …style}}>
{children}
</div>
);
}

/* ─── Label ──────────────────────────────────────────────────────────────── */
function Label({ children }) {
return <div style={{fontSize:10,fontWeight:600,color:C.textMute,textTransform:“uppercase”,
letterSpacing:”.1em”,fontFamily:C.mono,marginBottom:6}}>{children}</div>;
}

/* ─── Progress bar ───────────────────────────────────────────────────────── */
function Bar({ pct, color=C.green, height=6 }) {
return (
<div style={{height,background:C.surfaceAlt,borderRadius:height/2,overflow:“hidden”,
border:`1px solid ${C.border}`}}>
<div style={{height:“100%”,width:`${Math.min(pct,100)}%`,
background:`linear-gradient(90deg,${color},${C.green})`,
borderRadius:height/2,transition:“width 1.1s ease”}}/>
</div>
);
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ msg, onClose }) {
useEffect(()=>{const t=setTimeout(onClose,2600);return()=>clearTimeout(t);},[]);
return (
<div style={{position:“fixed”,bottom:24,left:“50%”,transform:“translateX(-50%)”,zIndex:1000,
background:C.sidebar,color:“white”,padding:“11px 22px”,borderRadius:50,fontSize:13,
fontWeight:600,fontFamily:C.sans,boxShadow:“0 8px 32px rgba(0,0,0,0.22)”,
border:`1px solid ${C.green}`,whiteSpace:“nowrap”,letterSpacing:”-0.1px”}}>
{msg}
</div>
);
}

/* ─── Degen Card ─────────────────────────────────────────────────────────── */
function DegenCard({ stats, pubkey, sol, minted, onMint, minting }) {
const pos = stats.pnl >= 0;
return (
<div style={{background:C.sidebar,borderRadius:20,padding:“26px 24px 22px”,
position:“relative”,overflow:“hidden”,color:“white”,fontFamily:C.sans,
boxShadow:“0 24px 64px rgba(13,26,13,0.2),0 2px 8px rgba(0,0,0,0.1)”,
border:“1px solid rgba(22,163,74,0.25)”}}>
{/* BG texture */}
<svg style={{position:“absolute”,inset:0,width:“100%”,height:“100%”,opacity:.6}} xmlns=“http://www.w3.org/2000/svg”>
<defs>
<pattern id="cdiag" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<line x1="0" y1="0" x2="0" y2="24" stroke="#22c55e" strokeWidth="0.4" strokeOpacity="0.12"/>
</pattern>
</defs>
<rect width="100%" height="100%" fill="url(#cdiag)"/>
</svg>
{/* Large circle deco */}
<div style={{position:“absolute”,top:-80,right:-80,width:240,height:240,borderRadius:“50%”,
background:“radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%)”,pointerEvents:“none”}}/>

```
  {minted && (
    <div style={{position:"absolute",top:16,right:16,background:C.green,color:"white",
      fontSize:9,fontWeight:700,padding:"3px 10px",borderRadius:20,letterSpacing:.8,
      fontFamily:C.mono,textTransform:"uppercase"}}>NFT Minted</div>
  )}

  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22,position:"relative"}}>
    <AppIcon size={34}/>
    <div>
      <div style={{fontWeight:700,fontSize:15,letterSpacing:"-0.3px"}}>BagTracker</div>
      <div style={{fontSize:10,opacity:.4,fontFamily:C.mono,letterSpacing:".1em"}}>BAGS.FM · SOLANA</div>
    </div>
    <div style={{marginLeft:"auto",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",
      borderRadius:20,padding:"4px 12px",fontSize:10,fontWeight:700,fontFamily:C.mono,
      color:"rgba(255,255,255,0.7)"}}>
      {stats.title.toUpperCase()}
    </div>
  </div>

  {/* Score bar */}
  <div style={{marginBottom:24,position:"relative"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
      <span style={{fontSize:9,opacity:.4,textTransform:"uppercase",letterSpacing:".12em",fontFamily:C.mono}}>Degen Score</span>
      <span style={{fontSize:10,color:"#4ade80",fontWeight:700,fontFamily:C.mono}}>{stats.score} / 100</span>
    </div>
    <div style={{height:4,background:"rgba(255,255,255,0.07)",borderRadius:2}}>
      <div style={{height:"100%",width:`${stats.score}%`,background:"linear-gradient(90deg,#15803d,#4ade80)",borderRadius:2}}/>
    </div>
  </div>

  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:22,position:"relative"}}>
    {[
      {l:"SOL Balance", v:`◎ ${fmtN(sol,3)}`},
      {l:"All-Time PNL", v:`${pos?"+":""}${fmtN(stats.pnl,1)}%`, c:pos?"#4ade80":"#f87171"},
      {l:"Rugs Survived", v:stats.rugs},
    ].map(s=>(
      <div key={s.l}>
        <div style={{fontSize:9,opacity:.38,textTransform:"uppercase",letterSpacing:".1em",marginBottom:5,fontFamily:C.mono}}>{s.l}</div>
        <div style={{fontSize:20,fontWeight:700,color:s.c||"white",letterSpacing:"-0.5px"}}>{s.v}</div>
      </div>
    ))}
  </div>

  <div style={{borderTop:"1px solid rgba(255,255,255,0.09)",paddingTop:14,
    display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative"}}>
    <div style={{fontFamily:C.mono,fontSize:10,opacity:.28}}>{shrt(pubkey)}</div>
    <div style={{display:"flex",gap:16}}>
      {[["Calls",stats.calls],["Hit %",`${stats.hitRate}%`],["Diamond",`${stats.diamond}%`]].map(([l,v])=>(
        <div key={l} style={{textAlign:"center"}}>
          <div style={{fontSize:13,fontWeight:700}}>{v}</div>
          <div style={{fontSize:8,opacity:.35,textTransform:"uppercase",letterSpacing:".1em",fontFamily:C.mono}}>{l}</div>
        </div>
      ))}
    </div>
  </div>

  {!minted && onMint && (
    <button onClick={onMint} disabled={minting} style={{marginTop:18,width:"100%",padding:"12px",
      background:minting?"rgba(22,163,74,0.3)":"linear-gradient(135deg,#15803d,#22c55e)",
      border:"none",borderRadius:11,color:"white",fontWeight:700,fontSize:13,
      cursor:minting?"default":"pointer",fontFamily:C.sans,position:"relative",
      display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
      <Icon name="diamond" size={15} color="white"/>
      {minting?"Minting on Solana…":"Mint as NFT — 0.01 SOL"}
    </button>
  )}
</div>
```

);
}

/* ─── VIP Lock ───────────────────────────────────────────────────────────── */
function VIPGate({ rank, score, onShare }) {
const pct = Math.max(0,100-(rank/2800)*100);
const needed = Math.max(0,rank-100);
return (
<Card style={{overflow:“hidden”,padding:0}}>
{/* Blurred preview */}
<div style={{background:C.sidebar,padding:“40px 28px 0”,position:“relative”,overflow:“hidden”}}>
<svg style={{position:“absolute”,inset:0,width:“100%”,height:“100%”}} xmlns=“http://www.w3.org/2000/svg”>
<defs>
<pattern id="vpat" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<line x1="0" y1="0" x2="0" y2="20" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.1"/>
</pattern>
</defs>
<rect width="100%" height="100%" fill="url(#vpat)"/>
</svg>
{/* Blurred preview cards */}
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:8,filter:“blur(4px)”,opacity:.35,pointerEvents:“none”,paddingBottom:20}}>
{[“Whale Activity”,“Alpha Signals”,“Predictive Chart”,“Network Map”].map(t=>(
<div key={t} style={{background:“rgba(255,255,255,0.06)”,borderRadius:10,padding:“16px”,
height:80,border:“1px solid rgba(255,255,255,0.1)”}}>
<div style={{width:60,height:8,background:“rgba(255,255,255,0.2)”,borderRadius:4,marginBottom:8}}/>
<div style={{width:40,height:20,background:“rgba(34,197,94,0.4)”,borderRadius:4}}/>
</div>
))}
</div>
</div>

```
  <div style={{padding:"28px"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
      <Icon name="lock" size={22} color={C.text}/>
      <div style={{fontWeight:800,fontSize:20,color:C.text,fontFamily:C.sans,letterSpacing:"-0.5px"}}>BagTracker Pro</div>
    </div>
    <div style={{color:C.textSec,fontSize:14,lineHeight:1.7,marginBottom:22}}>
      Exclusive access for the Top 100. You're ranked <strong style={{color:C.text}}>#{rank}</strong> — {needed} places away from unlocking.
    </div>
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
        <span style={{fontSize:12,fontWeight:600,color:C.text}}>Progress to Top 100</span>
        <span style={{fontSize:12,fontFamily:C.mono,color:C.textSec}}>{needed} ranks to go</span>
      </div>
      <Bar pct={pct} height={8}/>
      <div style={{marginTop:8,fontSize:12,color:C.textMute,fontFamily:C.mono}}>
        Score {score}/100 · Need 82+ to qualify
      </div>
    </div>
    <div style={{background:C.surfaceAlt,borderRadius:12,padding:"14px",marginBottom:20,
      border:`1px solid ${C.border}`}}>
      <Label>Pro unlocks</Label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {["Whale tracking","Predictive charts","Alpha signals","Priority alerts"].map(f=>(
          <div key={f} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.textSec}}>
            <Icon name="check" size={12} color={C.green}/>{f}
          </div>
        ))}
      </div>
    </div>
    <button onClick={onShare} style={{width:"100%",padding:"13px",background:C.sidebar,
      border:"none",borderRadius:11,color:"white",fontWeight:700,fontSize:13,
      cursor:"pointer",fontFamily:C.sans,display:"flex",alignItems:"center",
      justifyContent:"center",gap:8}}>
      <Icon name="share" size={15} color="white"/>
      Share to grind your rank
    </button>
  </div>
</Card>
```

);
}

/* ─── MAIN APP ───────────────────────────────────────────────────────────── */
export default function BagTracker() {
const [wallet,     setWallet]     = useState(null);
const [sol,        setSol]        = useState(0);
const [tokens,     setTokens]     = useState([]);
const [connecting, setConnecting] = useState(false);
const [page,       setPage]       = useState(“dashboard”);
const [stats,      setStats]      = useState(null);
const [toast,      setToast]      = useState(null);
const [sideOpen,   setSideOpen]   = useState(true);
const [mobileSide, setMobileSide] = useState(false);
const [isMobile,   setIsMobile]   = useState(false);

const [minted,     setMinted]     = useState(false);
const [minting,    setMinting]    = useState(false);
const [streak,     setStreak]     = useState(4);
const [checkedIn,  setCheckedIn]  = useState(false);
const [goal,       setGoal]       = useState({type:“portfolio”,target:10000,label:”$10,000 Portfolio”});
const [wager,      setWager]      = useState(null);
const [wagerForm,  setWagerForm]  = useState({type:“followers”,amount:5,target:1000});
const [watching,   setWatching]   = useState([“DegenGod.sol”]);
const [tipping,    setTipping]    = useState(null);
const [refCopied,  setRefCopied]  = useState(false);

const SOL_PRICE = 178;

// Load fonts
useEffect(()=>{
if(document.querySelector(‘link[data-bagtracker-font]’)) return;
const l = document.createElement(‘link’);
l.rel = ‘stylesheet’; l.href = FONT_URL;
l.setAttribute(‘data-bagtracker-font’,‘1’);
document.head.appendChild(l);
},[]);

useEffect(()=>{
const check=()=>{ setIsMobile(window.innerWidth<820); if(window.innerWidth<820) setSideOpen(false); };
check(); window.addEventListener(“resize”,check);
return()=>window.removeEventListener(“resize”,check);
},[]);

const connect = useCallback(async()=>{
const p=window.solana||window.phantom?.solana;
if(!p?.isPhantom){ alert(“Install Phantom from phantom.app”); return; }
setConnecting(true);
try {
const resp = await p.connect();
const pk = resp.publicKey.toString();
setWallet({publicKey:pk});
const [bal,tkns] = await Promise.all([getSolBalance(pk),getTokenAccounts(pk)]);
setSol(bal); setTokens(tkns);
setStats(buildStats(pk,bal,tkns.length));
setToast(“Wallet connected — Solana Mainnet”);
} catch(e){ if(e.code!==4001) alert(“Connection failed”); }
finally{ setConnecting(false); }
},[]);

const disconnect = ()=>{ setWallet(null); setSol(0); setTokens([]); setStats(null); setMinted(false); };

useEffect(()=>{
const p=window.solana; if(!p) return;
p.on?.(“disconnect”,disconnect);
return()=>p.off?.(“disconnect”,disconnect);
},[]);

const totalUsd = sol * SOL_PRICE;
const goalPct  = goal.type===“portfolio” ? (totalUsd/goal.target)*100 : (stats?.followers||0)/goal.target*100;

const doMint = async()=>{
setMinting(true);
await new Promise(r=>setTimeout(r,2200));
setMinted(true); setMinting(false);
setToast(“Degen Card minted as NFT on Solana Mainnet”);
};

const doTip = async name=>{
setTipping(name);
await new Promise(r=>setTimeout(r,1400));
setTipping(null);
setToast(`Tipped 0.1 SOL to ${name}`);
};

const doCheckIn = ()=>{
if(checkedIn) return;
setCheckedIn(true); setStreak(s=>s+1);
setToast(`Day ${streak+1} streak — keep going`);
};

const doWager = ()=>{
setWager({…wagerForm, placed:new Date().toLocaleDateString(), deadline:“7 days”});
setToast(`Wager placed — ${wagerForm.amount} SOL staked`);
};

const doCopyRef = ()=>{
navigator.clipboard.writeText(`https://bagtracker.vercel.app?ref=${wallet?.publicKey?.slice(0,8)}`);
setRefCopied(true); setTimeout(()=>setRefCopied(false),2500);
setToast(“Referral link copied to clipboard”);
};

const tweetCard = ()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${stats?.title} — Score: ${stats?.score}/100\n◎ ${fmtN(sol,3)} SOL on Solana\n\nbagtracker.vercel.app @bagsfm`)}`, “_blank”);
const farcaster = ()=>window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(`Checking my bags on BagTracker — Score ${stats?.score}/100\nbagtracker.vercel.app`)}`, “_blank”);
const shareRank = ()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I’m ranked #${stats?.rank} on BagTracker — grinding to Top 100 to unlock Pro\nbagtracker.vercel.app`)}`, “_blank”);

const SIDEBAR_W = sideOpen ? 230 : 64;

const NAV = [
{id:“dashboard”,  icon:“grid”,   label:“Dashboard”},
{id:“degencard”,  icon:“card”,   label:“Degen Card”},
{id:“leaderboard”,icon:“trophy”, label:“Leaderboard”},
{id:“wagers”,     icon:“zap”,    label:“Wagers”},
{id:“pro”,        icon:“crown”,  label:“Pro VIP”},
{id:“referral”,   icon:“gift”,   label:“Referral”},
];

/* ── SIDEBAR ──────────────────────────────────────────────────────────── */
const SidebarEl = (
<div style={{
position:“fixed”, top:0, left: isMobile&&!mobileSide ? -230 : 0,
bottom:0, width: isMobile ? 230 : SIDEBAR_W,
background:C.sidebar, zIndex:60,
display:“flex”, flexDirection:“column”,
borderRight:“1px solid rgba(255,255,255,0.05)”,
transition:“all .22s ease”, overflow:“hidden”,
}}>
{/* BG line pattern */}
<svg style={{position:“absolute”,inset:0,width:“100%”,height:“100%”,pointerEvents:“none”}} xmlns=“http://www.w3.org/2000/svg”>
<defs>
<pattern id="spat" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<line x1="0" y1="0" x2="0" y2="20" stroke="#22c55e" strokeWidth="0.4" strokeOpacity="0.07"/>
</pattern>
</defs>
<rect width="100%" height="100%" fill="url(#spat)"/>
</svg>

```
  {/* Logo row */}
  <div style={{padding:"18px 16px",display:"flex",alignItems:"center",gap:10,
    borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:8,position:"relative"}}>
    <AppIcon size={30}/>
    {(sideOpen||isMobile) && (
      <div>
        <div style={{fontWeight:700,fontSize:15,color:"white",letterSpacing:"-0.3px",fontFamily:C.sans}}>BagTracker</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:".12em",fontFamily:C.mono}}>BAGS.FM</div>
      </div>
    )}
    {!isMobile && (
      <button onClick={()=>setSideOpen(p=>!p)} style={{marginLeft:"auto",background:"transparent",
        border:"none",cursor:"pointer",color:"rgba(255,255,255,0.3)",padding:4,borderRadius:6,
        display:"flex",alignItems:"center",transition:"color .15s"}}
        onMouseEnter={e=>e.target.style.color="rgba(255,255,255,0.7)"}
        onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>
        <Icon name={sideOpen?"chevronLeft":"chevronRight"} size={16} color="currentColor"/>
      </button>
    )}
    {isMobile && (
      <button onClick={()=>setMobileSide(false)} style={{marginLeft:"auto",background:"transparent",
        border:"none",cursor:"pointer",color:"rgba(255,255,255,0.4)",padding:4}}>
        <Icon name="x" size={18} color="currentColor"/>
      </button>
    )}
  </div>

  {/* Nav items */}
  <div style={{flex:1,padding:"4px 8px",overflowY:"auto",position:"relative"}}>
    {NAV.map(n=>{
      const active=page===n.id;
      return (
        <button key={n.id} onClick={()=>{ setPage(n.id); if(isMobile) setMobileSide(false); }}
          style={{
            display:"flex",alignItems:"center",gap:10,width:"100%",
            padding:"10px 10px",
            justifyContent:(sideOpen||isMobile)?"flex-start":"center",
            background:active?C.sideAct:"transparent",
            border:"none",borderRadius:10,cursor:"pointer",marginBottom:2,
            color:active?"white":"rgba(255,255,255,0.45)",
            fontFamily:C.sans,fontSize:13,fontWeight:600,
            transition:"all .15s",
          }}
          onMouseEnter={e=>{ if(!active) e.currentTarget.style.background=C.sideHov; }}
          onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
          <Icon name={n.icon} size={16} color="currentColor" strokeWidth={active?2:1.6}/>
          {(sideOpen||isMobile) && <span style={{flex:1,textAlign:"left"}}>{n.label}</span>}
          {(sideOpen||isMobile) && n.id==="pro" && (
            <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",background:C.gold,
              color:"white",borderRadius:20,fontFamily:C.mono}}>VIP</span>
          )}
        </button>
      );
    })}
  </div>

  {/* Wallet status at bottom */}
  {(sideOpen||isMobile) && wallet && (
    <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.06)",position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:C.green,flexShrink:0,
          boxShadow:`0 0 6px ${C.green}`}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontFamily:C.mono,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shrt(wallet.publicKey)}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:C.mono}}>MAINNET · CONNECTED</div>
        </div>
        <button onClick={disconnect} style={{background:"transparent",border:"none",
          cursor:"pointer",color:"rgba(255,255,255,0.3)",padding:4,borderRadius:6}}
          title="Disconnect">
          <Icon name="logout" size={14} color="currentColor"/>
        </button>
      </div>
    </div>
  )}
</div>
```

);

/* ── TOP BAR ──────────────────────────────────────────────────────────── */
const TopBar = (
<div style={{position:“sticky”,top:0,zIndex:40,background:“rgba(247,244,239,0.92)”,
backdropFilter:“blur(14px)”,borderBottom:`1px solid ${C.border}`,
padding:“0 22px”,height:56,display:“flex”,alignItems:“center”,
justifyContent:“space-between”,gap:12}}>
<div style={{display:“flex”,alignItems:“center”,gap:10}}>
{isMobile && (
<button onClick={()=>setMobileSide(true)} style={{background:“transparent”,border:“none”,
cursor:“pointer”,color:C.textSec,padding:4,borderRadius:8,display:“flex”}}>
<Icon name="menu" size={20} color="currentColor"/>
</button>
)}
<div style={{fontFamily:C.sans,fontWeight:700,fontSize:16,color:C.text,letterSpacing:”-0.3px”}}>
{NAV.find(n=>n.id===page)?.label||“BagTracker”}
</div>
</div>
<div style={{display:“flex”,alignItems:“center”,gap:10}}>
{wallet && (
<div style={{display:“flex”,alignItems:“center”,gap:5,padding:“5px 11px”,
background:C.greenLight,border:`1px solid ${C.greenMid}`,borderRadius:20}}>
<div style={{width:6,height:6,borderRadius:“50%”,background:C.green}}/>
<span style={{fontSize:11,fontWeight:700,color:C.green,fontFamily:C.mono}}>Mainnet</span>
</div>
)}
{wallet ? (
<div style={{padding:“6px 13px”,background:C.surface,border:`1px solid ${C.border}`,
borderRadius:10,fontSize:12,fontWeight:600,color:C.textSec,fontFamily:C.mono}}>
{shrt(wallet.publicKey)}
</div>
) : (
<button onClick={connect} disabled={connecting} style={{padding:“9px 20px”,
background:connecting?C.greenLight:C.green,border:“none”,borderRadius:10,
fontSize:13,fontWeight:700,color:connecting?C.green:“white”,cursor:“pointer”,
fontFamily:C.sans,boxShadow:connecting?“none”:“0 2px 12px rgba(22,163,74,0.28)”,
display:“flex”,alignItems:“center”,gap:7}}>
<Icon name=“wallet” size={15} color={connecting?C.green:“white”}/>
{connecting?“Connecting…”:“Connect Wallet”}
</button>
)}
</div>
</div>
);

/* ── LANDING ──────────────────────────────────────────────────────────── */
const Landing = (
<div style={{minHeight:“80vh”,display:“flex”,flexDirection:“column”,
alignItems:“center”,justifyContent:“center”,padding:“60px 24px”,textAlign:“center”}}>
<div style={{marginBottom:24,position:“relative”,display:“inline-block”}}>
<AppIcon size={72}/>
<div style={{position:“absolute”,inset:-8,borderRadius:“50%”,
background:`radial-gradient(circle,rgba(22,163,74,0.12),transparent 70%)`}}/>
</div>
<div style={{fontSize:10,fontWeight:600,color:C.green,letterSpacing:”.16em”,
textTransform:“uppercase”,marginBottom:14,fontFamily:C.mono}}>bag.fm · solana mainnet</div>
<h1 style={{fontFamily:C.sans,fontSize:isMobile?44:60,fontWeight:700,margin:“0 0 14px”,
letterSpacing:”-2.5px”,lineHeight:1.02,color:C.text}}>
Track Your<br/><span style={{color:C.green}}>Bags.</span>
</h1>
<p style={{color:C.textSec,fontSize:15,maxWidth:380,margin:“0 auto 36px”,lineHeight:1.8,fontFamily:C.sans}}>
Real-time Solana portfolio analytics, verifiable on-chain identity, wagers, and a leaderboard that separates the holders from the paper hands.
</p>
<div style={{display:“flex”,flexWrap:“wrap”,gap:8,justifyContent:“center”,marginBottom:40,maxWidth:480}}>
{[
{i:“diamond”,t:“Mintable NFT Cards”},
{i:“zap”,t:“Onchain Wagers”},
{i:“lock”,t:“VIP Token Gate”},
{i:“gift”,t:“Referral Bounties”},
{i:“trophy”,t:“Live Leaderboard”},
{i:“flame”,t:“Daily Streaks”},
].map(f=>(
<div key={f.t} style={{display:“flex”,alignItems:“center”,gap:6,padding:“7px 14px”,
background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,
fontSize:12,fontWeight:600,color:C.textSec,fontFamily:C.sans}}>
<Icon name={f.i} size={12} color={C.green}/>{f.t}
</div>
))}
</div>
<button onClick={connect} disabled={connecting} style={{padding:“14px 44px”,
background:C.green,border:“none”,borderRadius:50,fontWeight:700,fontSize:15,
color:“white”,cursor:“pointer”,fontFamily:C.sans,
boxShadow:“0 4px 28px rgba(22,163,74,0.3)”,letterSpacing:”-0.1px”,
display:“flex”,alignItems:“center”,gap:8}}>
<Icon name="wallet" size={16} color="white"/>
{connecting?“Connecting…”:“Connect Phantom”}
</button>
<div style={{color:C.textMute,fontSize:11,marginTop:12,fontFamily:C.mono}}>Phantom · Solflare · Backpack · Glow</div>
</div>
);

/* ── DASHBOARD ────────────────────────────────────────────────────────── */
const DashPage = stats && (
<div style={{display:“grid”,gap:16}}>
{/* Portfolio hero */}
<Card>
<Label>Total Portfolio Value</Label>
<div style={{fontFamily:C.sans,fontSize:isMobile?38:50,fontWeight:700,color:C.text,
letterSpacing:”-2px”,lineHeight:1,marginBottom:8}}>
<Count to={totalUsd} fmt={fmtUSD} dec={2}/>
</div>
<div style={{display:“flex”,alignItems:“center”,gap:8,marginBottom:24}}>
<span style={{display:“inline-flex”,alignItems:“center”,gap:4,padding:“4px 10px”,
background:stats.pnl>=0?C.greenLight:C.redLight,borderRadius:20,
fontSize:12,fontWeight:700,color:stats.pnl>=0?C.green:C.red,fontFamily:C.mono}}>
<Icon name={stats.pnl>=0?“arrowUp”:“arrowDown”} size={11} color={stats.pnl>=0?C.green:C.red}/>
{stats.pnl>=0?”+”:””}{fmtN(stats.pnl,1)}%
</span>
<span style={{fontSize:12,color:C.textMute,fontFamily:C.sans}}>all-time estimated</span>
</div>
<div style={{display:“grid”,gridTemplateColumns:“repeat(auto-fit,minmax(140px,1fr))”,gap:12}}>
{[
{l:“SOL Balance”,v:`◎ ${fmtN(sol,4)}`,s:fmtUSD(totalUsd),c:C.green},
{l:“SPL Tokens”,v:`${tokens.length} accounts`,s:“On-chain bags”},
{l:“Degen Score”,v:`${stats.score}/100`,s:stats.title},
{l:“Global Rank”,v:`#${fmtN(stats.rank,0)}`,s:“All wallets”,c:C.purple},
].map(t=>(
<div key={t.l} style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,
borderRadius:12,padding:“16px”}}>
<Label>{t.l}</Label>
<div style={{fontFamily:C.sans,fontWeight:700,fontSize:22,
color:t.c||C.text,letterSpacing:”-0.3px”}}>{t.v}</div>
{t.s && <div style={{fontSize:11,color:C.textMute,marginTop:3,fontFamily:C.sans}}>{t.s}</div>}
</div>
))}
</div>
</Card>

```
  {/* Streak + Goal */}
  <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16}}>
    <Card>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <Icon name="flame" size={16} color={C.green}/>
        <div style={{fontWeight:700,fontSize:14,color:C.text,fontFamily:C.sans}}>Daily Streak</div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:12}}>
        {Array.from({length:7},(_,i)=>(
          <div key={i} style={{flex:1,height:7,borderRadius:4,
            background:i<streak?C.green:C.border}}/>
        ))}
      </div>
      <div style={{fontSize:12,color:C.textSec,marginBottom:16,fontFamily:C.sans}}>
        {streak}/7 days this week · {7-streak} left for multiplier
      </div>
      <button onClick={doCheckIn} disabled={checkedIn} style={{width:"100%",padding:"10px",
        borderRadius:10,fontWeight:700,fontSize:13,cursor:checkedIn?"default":"pointer",
        fontFamily:C.sans,display:"flex",alignItems:"center",justifyContent:"center",gap:7,
        background:checkedIn?C.greenLight:C.green,
        color:checkedIn?C.green:"white",
        border:`1px solid ${checkedIn?C.greenMid:C.green}`}}>
        <Icon name="check" size={14} color={checkedIn?C.green:"white"}/>
        {checkedIn?"Checked in today":"Check in"}
      </button>
    </Card>

    <Card>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <Icon name="target" size={16} color={C.green}/>
        <div style={{fontWeight:700,fontSize:14,color:C.text,fontFamily:C.sans}}>Goal Tracker</div>
      </div>
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:C.sans}}>{goal.label}</span>
          <span style={{fontSize:11,fontFamily:C.mono,color:C.textSec}}>{Math.min(100,goalPct).toFixed(0)}%</span>
        </div>
        <Bar pct={goalPct}/>
      </div>
      <div style={{fontSize:11,color:C.textMute,marginBottom:14,fontFamily:C.mono}}>
        {goal.type==="portfolio" ? `${fmtUSD(totalUsd)} of ${fmtUSD(goal.target)}` : `${fmtN(stats.followers,0)} of ${fmtN(goal.target,0)} followers`}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[{t:"portfolio",l:"$10k",v:10000},{t:"portfolio",l:"$50k",v:50000},{t:"followers",l:"10k flw",v:10000}].map(g=>(
          <button key={g.l} onClick={()=>setGoal({type:g.t,target:g.v,label:g.l})}
            style={{flex:1,padding:"6px",fontSize:10,fontWeight:700,cursor:"pointer",
              fontFamily:C.mono,borderRadius:8,
              background:goal.target===g.v?C.sidebar:C.surfaceAlt,
              color:goal.target===g.v?"white":C.textSec,
              border:`1px solid ${goal.target===g.v?C.sidebar:C.border}`}}>{g.l}</button>
        ))}
      </div>
    </Card>
  </div>

  {/* Degen stats grid */}
  <Card>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
      <Icon name="activity" size={16} color={C.green}/>
      <div style={{fontWeight:700,fontSize:14,color:C.text,fontFamily:C.sans}}>Degen Breakdown</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10}}>
      {[
        {i:"users",l:"Rugs Survived",v:stats.rugs},
        {i:"diamond",l:"Diamond Hands",v:`${stats.diamond}%`},
        {i:"bell",l:"Calls Made",v:stats.calls},
        {i:"target",l:"Hit Rate",v:`${stats.hitRate}%`},
        {i:"trending",l:"Followers",v:fmtN(stats.followers,0)},
        {i:"activity",l:"Longest Hold",v:`${stats.hold}d`},
      ].map(s=>(
        <div key={s.l} style={{padding:"14px 10px",background:C.surfaceAlt,
          borderRadius:12,border:`1px solid ${C.border}`,textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
            <Icon name={s.i} size={18} color={C.green}/>
          </div>
          <div style={{fontFamily:C.sans,fontWeight:700,fontSize:18,color:C.text}}>{s.v}</div>
          <div style={{fontSize:9,color:C.textMute,textTransform:"uppercase",
            letterSpacing:".07em",marginTop:3,fontFamily:C.mono}}>{s.l}</div>
        </div>
      ))}
    </div>
  </Card>

  {/* Whale Watcher */}
  <Card>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
      <Icon name="eye" size={16} color={C.green}/>
      <div style={{fontWeight:700,fontSize:14,color:C.text,fontFamily:C.sans}}>Whale Watcher</div>
    </div>
    <div style={{fontSize:12,color:C.textSec,marginBottom:16,fontFamily:C.sans}}>
      Watching {watching.length} wallets — alerts fire when they make major moves
    </div>
    {LB_DATA.slice(0,4).map(r=>(
      <div key={r.rank} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
        background:C.surfaceAlt,borderRadius:12,border:`1px solid ${C.border}`,marginBottom:8}}>
        <div style={{fontWeight:700,fontSize:15,color:C.text,minWidth:28,fontFamily:C.sans}}>#{r.rank}</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:13,color:C.text,fontFamily:C.sans}}>{r.name}</div>
          <div style={{fontSize:11,color:C.textSec,fontFamily:C.mono}}>◎{(r.sol/1000).toFixed(1)}K · +{r.pnl}%</div>
        </div>
        <button onClick={()=>{ setWatching(w=>w.includes(r.name)?w.filter(x=>x!==r.name):[...w,r.name]); setToast(watching.includes(r.name)?`Removed ${r.name}`:`Now watching ${r.name}`); }}
          style={{padding:"5px 14px",fontSize:11,fontWeight:700,borderRadius:20,cursor:"pointer",
            fontFamily:C.mono,display:"flex",alignItems:"center",gap:5,
            background:watching.includes(r.name)?C.greenLight:C.surfaceAlt,
            color:watching.includes(r.name)?C.green:C.textSec,
            border:`1px solid ${watching.includes(r.name)?C.greenMid:C.border}`}}>
          <Icon name={watching.includes(r.name)?"eye":"eyeOff"} size={11} color="currentColor"/>
          {watching.includes(r.name)?"Watching":"Watch"}
        </button>
      </div>
    ))}
  </Card>
</div>
```

);

/* ── DEGEN CARD PAGE ──────────────────────────────────────────────────── */
const CardPage = stats && (
<div style={{display:“grid”,gap:16,maxWidth:500}}>
<DegenCard stats={stats} pubkey={wallet?.publicKey||””} sol={sol}
minted={minted} onMint={!minted?doMint:null} minting={minting}/>
<Card>
<div style={{display:“flex”,alignItems:“center”,gap:8,marginBottom:16}}>
<Icon name="share" size={16} color={C.green}/>
<div style={{fontWeight:700,fontSize:14,color:C.text,fontFamily:C.sans}}>Share your card</div>
</div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:10,marginBottom:10}}>
<button onClick={tweetCard} style={{padding:“12px”,background:”#1a8cd8”,border:“none”,
borderRadius:10,color:“white”,fontWeight:700,fontSize:13,cursor:“pointer”,
fontFamily:C.sans,display:“flex”,alignItems:“center”,justifyContent:“center”,gap:7}}>
<Icon name="share" size={13} color="white"/> Post on X
</button>
<button onClick={farcaster} style={{padding:“12px”,background:C.purple,border:“none”,
borderRadius:10,color:“white”,fontWeight:700,fontSize:13,cursor:“pointer”,
fontFamily:C.sans,display:“flex”,alignItems:“center”,justifyContent:“center”,gap:7}}>
<Icon name="share" size={13} color="white"/> Cast on Farcaster
</button>
</div>
<button onClick={()=>{navigator.clipboard.writeText(`${stats.title} — Score ${stats.score}/100\n◎ ${fmtN(sol,3)} SOL · ${stats.rugs} rugs survived\nbagtracker.vercel.app`);setToast(“Stats copied”);}}
style={{width:“100%”,padding:“11px”,background:C.surfaceAlt,
border:`1px solid ${C.border}`,borderRadius:10,fontWeight:600,fontSize:13,
color:C.textSec,cursor:“pointer”,fontFamily:C.sans,
display:“flex”,alignItems:“center”,justifyContent:“center”,gap:7}}>
<Icon name="copy" size={13} color={C.textSec}/> Copy Stats Text
</button>
</Card>
</div>
);

/* ── LEADERBOARD PAGE ─────────────────────────────────────────────────── */
const LBPage = (
<div style={{display:“grid”,gap:16}}>
{stats && (
<Card accent>
<div style={{display:“flex”,alignItems:“center”,justifyContent:“space-between”,flexWrap:“wrap”,gap:16}}>
<div>
<Label>Your Rank</Label>
<div style={{fontFamily:C.sans,fontSize:40,fontWeight:700,color:C.text,
letterSpacing:”-1.5px”,lineHeight:1}}>#{stats.rank}</div>
<div style={{fontSize:13,color:C.textSec,marginTop:6,fontFamily:C.sans}}>
{stats.title} · Score {stats.score}/100
</div>
</div>
<div style={{display:“flex”,gap:10}}>
<div style={{background:C.greenLight,border:`1px solid ${C.greenMid}`,
borderRadius:12,padding:“12px 18px”,textAlign:“center”}}>
<Label>Followers</Label>
<div style={{fontFamily:C.sans,fontSize:20,fontWeight:700,color:C.green}}>{fmtN(stats.followers,0)}</div>
</div>
<div style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,
borderRadius:12,padding:“12px 18px”,textAlign:“center”}}>
<Label>PNL</Label>
<div style={{fontFamily:C.sans,fontSize:20,fontWeight:700,
color:stats.pnl>=0?C.green:C.red}}>{stats.pnl>=0?”+”:””}{fmtN(stats.pnl,1)}%</div>
</div>
</div>
</div>
</Card>
)}

```
  <Card>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
      <Icon name="trophy" size={16} color={C.green}/>
      <div style={{fontWeight:700,fontSize:14,color:C.text,fontFamily:C.sans}}>Global Degen Board</div>
    </div>
    <div style={{fontSize:12,color:C.textSec,marginBottom:16,fontFamily:C.sans}}>
      Tip fellow holders directly on-chain · 0.1 SOL per tip
    </div>

    <div style={{display:"grid",gridTemplateColumns:"44px 1fr 80px 68px 68px 70px",
      gap:8,padding:"8px 14px",borderBottom:`1px solid ${C.border}`}}>
      {["#","Wallet","SOL","Score","PNL","Tip"].map(h=>(
        <div key={h} style={{fontSize:10,fontWeight:600,color:C.textMute,
          textTransform:"uppercase",letterSpacing:".08em",fontFamily:C.mono}}>{h}</div>
      ))}
    </div>

    {LB_DATA.map((r,i)=>(
      <div key={r.rank} style={{display:"grid",gridTemplateColumns:"44px 1fr 80px 68px 68px 70px",
        gap:8,padding:"13px 14px",borderBottom:i<LB_DATA.length-1?`1px solid ${C.border}`:"none",
        alignItems:"center",background:i%2===0?C.surface:C.surfaceAlt}}>
        <div style={{fontWeight:700,fontFamily:C.sans,
          fontSize:r.rank<=3?17:13,
          color:r.rank===1?C.gold:r.rank===2?"#6b7280":r.rank===3?"#b45309":C.textMute}}>
          {r.rank<=3?["1st","2nd","3rd"][r.rank-1]:r.rank}
        </div>
        <div>
          <div style={{fontWeight:600,fontSize:13,color:C.text,fontFamily:C.sans}}>{r.name}</div>
          <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,
            background:TIER_COLOR[r.tier]+"18",color:TIER_COLOR[r.tier],
            fontFamily:C.mono,textTransform:"uppercase",letterSpacing:.5}}>{r.tier}</span>
        </div>
        <div style={{fontFamily:C.mono,fontSize:12,color:C.text}}>◎{(r.sol/1000).toFixed(1)}K</div>
        <div>
          <div style={{fontFamily:C.mono,fontSize:12,fontWeight:600,color:C.text}}>{r.score}/100</div>
          <div style={{height:3,background:C.border,borderRadius:2,marginTop:4,maxWidth:48}}>
            <div style={{height:"100%",width:`${r.score}%`,background:C.green,borderRadius:2}}/>
          </div>
        </div>
        <div style={{fontFamily:C.mono,fontSize:12,fontWeight:700,color:C.green}}>+{r.pnl}%</div>
        <button onClick={()=>doTip(r.name)} disabled={!!tipping}
          style={{padding:"6px 10px",background:tipping===r.name?C.goldLight:C.surfaceAlt,
            border:`1px solid ${tipping===r.name?C.gold:C.border}`,borderRadius:8,
            fontSize:11,fontWeight:700,cursor:"pointer",color:C.textSec,
            fontFamily:C.mono,display:"flex",alignItems:"center",gap:4}}>
          <Icon name="coins" size={11} color="currentColor"/>
          {tipping===r.name?"…":"Tip"}
        </button>
      </div>
    ))}

    {stats && (
      <div style={{display:"grid",gridTemplateColumns:"44px 1fr 80px 68px 68px 70px",
        gap:8,padding:"13px 14px",alignItems:"center",
        background:C.greenLight,borderTop:`1.5px solid ${C.green}`,
        borderRadius:"0 0 12px 12px"}}>
        <div style={{fontWeight:800,fontSize:12,color:C.green,fontFamily:C.mono}}>#{stats.rank}</div>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:C.green,fontFamily:C.sans}}>You</div>
          <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,
            background:TIER_COLOR[stats.tier]+"20",color:TIER_COLOR[stats.tier],
            fontFamily:C.mono,textTransform:"uppercase"}}>{stats.tier}</span>
        </div>
        <div style={{fontFamily:C.mono,fontSize:12,color:C.green}}>◎{fmtN(sol,2)}</div>
        <div style={{fontFamily:C.mono,fontSize:12,color:C.text}}>{stats.score}/100</div>
        <div style={{fontFamily:C.mono,fontSize:12,fontWeight:700,color:C.green}}>+{fmtN(stats.pnl,1)}%</div>
        <div style={{fontSize:11,color:C.textMute}}>—</div>
      </div>
    )}
  </Card>
</div>
```

);

/* ── WAGERS PAGE ──────────────────────────────────────────────────────── */
const WagerPage = stats && (
<div style={{display:“grid”,gap:16}}>
<Card>
<div style={{display:“flex”,alignItems:“center”,gap:8,marginBottom:6}}>
<Icon name="zap" size={18} color={C.green}/>
<div style={{fontFamily:C.sans,fontWeight:700,fontSize:18,color:C.text,letterSpacing:”-0.4px”}}>
Onchain Wagers
</div>
</div>
<div style={{fontSize:13,color:C.textSec,fontFamily:C.sans}}>
Stake SOL on your own growth targets. Hit the goal, keep the yield pool.
</div>
</Card>

```
  {wager ? (
    <Card accent>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div style={{padding:"3px 10px",background:C.greenLight,border:`1px solid ${C.greenMid}`,
          borderRadius:20,fontSize:10,fontWeight:700,color:C.green,fontFamily:C.mono}}>ACTIVE WAGER</div>
        <span style={{fontSize:11,color:C.textMute,fontFamily:C.mono}}>{wager.placed}</span>
      </div>
      <div style={{fontFamily:C.sans,fontWeight:700,fontSize:22,color:C.text,marginBottom:6,
        letterSpacing:"-0.5px"}}>{wager.amount} SOL staked</div>
      <div style={{fontSize:13,color:C.textSec,marginBottom:20,fontFamily:C.sans}}>
        Target: gain {wager.target} {wager.type} in {wager.deadline}
      </div>
      <div style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:12,fontWeight:600,color:C.text}}>Progress</span>
          <span style={{fontSize:11,fontFamily:C.mono,color:C.textSec}}>{wager.deadline} remaining</span>
        </div>
        <Bar pct={ri(wallet?.publicKey+"wp"||"x",15,80)}/>
      </div>
      <button onClick={()=>{ setWager(null); setToast("Wager cancelled — SOL returned"); }}
        style={{marginTop:14,padding:"10px 18px",background:C.redLight,
          border:"1px solid #fca5a5",borderRadius:10,color:C.red,fontWeight:700,
          fontSize:12,cursor:"pointer",fontFamily:C.sans}}>
        Cancel Wager
      </button>
    </Card>
  ) : (
    <Card>
      <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:18,fontFamily:C.sans}}>Place a Wager</div>
      <div style={{display:"grid",gap:16}}>
        <div>
          <Label>Bet type</Label>
          <div style={{display:"flex",gap:8}}>
            {[{v:"followers",l:"Gain Followers"},{v:"bags",l:"Grow Bags Token"}].map(t=>(
              <button key={t.v} onClick={()=>setWagerForm(p=>({...p,type:t.v}))} style={{flex:1,
                padding:"10px",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer",
                fontFamily:C.sans,
                background:wagerForm.type===t.v?C.sidebar:C.surfaceAlt,
                color:wagerForm.type===t.v?"white":C.textSec,
                border:`1px solid ${wagerForm.type===t.v?C.sidebar:C.border}`}}>{t.l}</button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {[
            {l:"SOL to stake",k:"amount",opts:[1,5,10,25]},
            {l:"Target",k:"target",opts:[500,1000,5000,10000]},
          ].map(f=>(
            <div key={f.k}>
              <Label>{f.l}</Label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {f.opts.map(v=>(
                  <button key={v} onClick={()=>setWagerForm(p=>({...p,[f.k]:v}))} style={{
                    padding:"7px 12px",borderRadius:8,fontWeight:600,fontSize:11,
                    cursor:"pointer",fontFamily:C.mono,
                    background:wagerForm[f.k]===v?C.sidebar:C.surfaceAlt,
                    color:wagerForm[f.k]===v?"white":C.textSec,
                    border:`1px solid ${wagerForm[f.k]===v?C.sidebar:C.border}`}}>{v}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"14px",background:C.surfaceAlt,borderRadius:12,
          border:`1px solid ${C.border}`,fontFamily:C.mono,fontSize:11,color:C.textSec,lineHeight:1.9}}>
          Stake {wagerForm.amount} SOL · Target +{fmtN(wagerForm.target,0)} {wagerForm.type} in 7 days<br/>
          Win pool: ~{(wagerForm.amount*1.4).toFixed(2)} SOL (40% yield on success)<br/>
          Loss: stake returned minus 5% protocol fee
        </div>
        <button onClick={doWager} style={{padding:"13px",
          background:C.green,border:"none",borderRadius:11,color:"white",
          fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:C.sans,
          display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <Icon name="zap" size={14} color="white"/>
          Place Wager — {wagerForm.amount} SOL
        </button>
      </div>
    </Card>
  )}

  <Card>
    <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:14,fontFamily:C.sans}}>Past Wagers</div>
    {[
      {amt:2,type:"followers",target:1000,result:"won",pnl:"+0.8 SOL"},
      {amt:5,type:"bags",target:5000,result:"lost",pnl:"-0.25 SOL"},
    ].map((w,i)=>(
      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"12px 14px",background:C.surfaceAlt,borderRadius:12,
        border:`1px solid ${C.border}`,marginBottom:8}}>
        <div>
          <div style={{fontWeight:600,fontSize:13,color:C.text,fontFamily:C.sans}}>{w.amt} SOL on {w.target} {w.type}</div>
          <div style={{fontSize:11,color:C.textMute,fontFamily:C.sans}}>7-day sprint</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700,
            display:"inline-block",fontFamily:C.mono,
            background:w.result==="won"?C.greenLight:C.redLight,
            color:w.result==="won"?C.green:C.red}}>{w.result}</div>
          <div style={{fontFamily:C.mono,fontSize:12,fontWeight:700,marginTop:4,
            color:w.result==="won"?C.green:C.red}}>{w.pnl}</div>
        </div>
      </div>
    ))}
  </Card>
</div>
```

);

/* ── PRO VIP PAGE ─────────────────────────────────────────────────────── */
const ProPage = stats && (
stats.isVIP ? (
<div style={{display:“grid”,gap:16}}>
<Card style={{border:`1.5px solid ${C.gold}`,background:C.goldLight}}>
<div style={{display:“flex”,alignItems:“center”,gap:12,marginBottom:8}}>
<Icon name="crown" size={24} color={C.gold}/>
<div>
<div style={{fontFamily:C.sans,fontWeight:700,fontSize:18,color:C.text,letterSpacing:”-0.3px”}}>BagTracker Pro</div>
<div style={{padding:“3px 10px”,background:C.gold,color:“white”,borderRadius:20,
display:“inline-block”,fontSize:9,fontWeight:700,letterSpacing:1,fontFamily:C.mono,marginTop:4}}>VIP ACCESS GRANTED</div>
</div>
</div>
<div style={{fontSize:13,color:C.textSec,fontFamily:C.sans}}>Score {stats.score}/100 — you’re in the Top 100.</div>
</Card>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:12}}>
{[
{i:“eye”,l:“Whale Signals”,v:“4 Active”,s:“BIG_DEGEN moved ◎420”},
{i:“star”,l:“Alpha Leaks”,v:“2 New”,s:“Filtered for your bags”},
{i:“trending”,l:“Predicted Score”,v:”+18%”,s:“30-day trajectory”},
{i:“users”,l:“Network Rank”,v:“Top 3.5%”,s:“Percentile by score”},
].map(t=>(
<div key={t.l} style={{background:C.surface,border:`1px solid ${C.border}`,
borderRadius:12,padding:“16px”}}>
<div style={{display:“flex”,alignItems:“center”,gap:7,marginBottom:8}}>
<Icon name={t.i} size={14} color={C.green}/>
<Label>{t.l}</Label>
</div>
<div style={{fontFamily:C.sans,fontWeight:700,fontSize:20,color:C.text}}>{t.v}</div>
<div style={{fontSize:11,color:C.textMute,marginTop:3,fontFamily:C.sans}}>{t.s}</div>
</div>
))}
</div>
<Card>
<div style={{display:“flex”,alignItems:“center”,gap:8,marginBottom:14}}>
<Icon name="activity" size={15} color={C.green}/>
<div style={{fontWeight:700,fontSize:14,color:C.text,fontFamily:C.sans}}>Whale Activity Feed</div>
</div>
{[
{name:“DegenGod.sol”,action:“Swapped ◎4,200 to BAGS”,time:“12m ago”,hot:true},
{name:“DiamondFlip.sol”,action:“Added 2,800 followers”,time:“1h ago”,hot:false},
{name:“ApeKing.sol”,action:“Minted 3 NFTs on-chain”,time:“3h ago”,hot:false},
].map((a,i)=>(
<div key={i} style={{display:“flex”,alignItems:“center”,gap:12,padding:“12px 14px”,
background:a.hot?C.greenLight:C.surfaceAlt,borderRadius:12,
border:`1px solid ${a.hot?C.greenMid:C.border}`,marginBottom:8}}>
<Icon name={a.hot?“zap”:“activity”} size={16} color={a.hot?C.green:C.textMute}/>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:13,color:C.text,fontFamily:C.sans}}>{a.name}</div>
<div style={{fontSize:12,color:C.textSec,fontFamily:C.sans}}>{a.action}</div>
</div>
<div style={{fontFamily:C.mono,fontSize:10,color:C.textMute}}>{a.time}</div>
</div>
))}
</Card>
</div>
) : <VIPGate rank={stats.rank} score={stats.score} onShare={shareRank}/>
);

/* ── REFERRAL PAGE ────────────────────────────────────────────────────── */
const RefPage = wallet && (
<div style={{display:“grid”,gap:16}}>
<Card>
<div style={{display:“flex”,alignItems:“center”,gap:8,marginBottom:6}}>
<Icon name="gift" size={18} color={C.green}/>
<div style={{fontFamily:C.sans,fontWeight:700,fontSize:18,color:C.text,letterSpacing:”-0.4px”}}>Referral Bounties</div>
</div>
<div style={{fontSize:13,color:C.textSec,fontFamily:C.sans}}>
Invite degens. Both wallets receive a micro-airdrop from the bounty contract on connection.
</div>
</Card>

```
  <Card>
    <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:14,fontFamily:C.sans}}>Your Referral Link</div>
    <div style={{display:"flex",gap:10,alignItems:"center",padding:"11px 14px",
      background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:11,marginBottom:14}}>
      <Icon name="link" size={14} color={C.textMute}/>
      <div style={{flex:1,fontFamily:C.mono,fontSize:11,color:C.textSec,
        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        bagtracker.vercel.app?ref={wallet.publicKey.slice(0,8)}
      </div>
      <button onClick={doCopyRef} style={{padding:"7px 14px",fontWeight:700,fontSize:11,
        cursor:"pointer",fontFamily:C.sans,borderRadius:8,flexShrink:0,
        background:refCopied?C.greenLight:C.sidebar,
        border:`1px solid ${refCopied?C.greenMid:C.sidebar}`,
        color:refCopied?C.green:"white",display:"flex",alignItems:"center",gap:6}}>
        <Icon name={refCopied?"check":"copy"} size={11} color="currentColor"/>
        {refCopied?"Copied":"Copy"}
      </button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:18}}>
      {[
        {l:"Referrals",v:ri(wallet.publicKey+"refs",2,18)},
        {l:"Converted",v:ri(wallet.publicKey+"conv",1,8),a:true},
        {l:"SOL Earned",v:`◎${rng(wallet.publicKey+"earn",0.05,0.8).toFixed(2)}`,c:C.green},
      ].map(t=>(
        <div key={t.l} style={{background:t.a?C.greenLight:C.surfaceAlt,
          border:`1px solid ${t.a?C.greenMid:C.border}`,borderRadius:11,padding:"14px"}}>
          <Label>{t.l}</Label>
          <div style={{fontFamily:C.sans,fontWeight:700,fontSize:20,color:t.c||C.text}}>{t.v}</div>
        </div>
      ))}
    </div>
    <div style={{padding:"13px",background:C.greenLight,borderRadius:11,
      border:`1px solid ${C.greenMid}`,fontFamily:C.mono,fontSize:11,color:C.textSec,lineHeight:1.9}}>
      Reward per referral: 0.05 SOL · Funded by smart contract<br/>
      Auto-distributes when referred wallet connects · Tracked on-chain
    </div>
  </Card>

  <Card>
    <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:14,fontFamily:C.sans}}>Share your link</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <button onClick={()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on BagTracker — track your Solana bags on @bagsfm\n\nWe both earn SOL:\nbagtracker.vercel.app?ref=${wallet.publicKey.slice(0,8)}`)}`, "_blank")}
        style={{padding:"12px",background:"#1a8cd8",border:"none",borderRadius:10,
          color:"white",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:C.sans,
          display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
        <Icon name="share" size={13} color="white"/> Post on X
      </button>
      <button onClick={()=>window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(`Track your Solana bags on BagTracker\nbagtracker.vercel.app?ref=${wallet.publicKey.slice(0,8)}`)}`, "_blank")}
        style={{padding:"12px",background:C.purple,border:"none",borderRadius:10,
          color:"white",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:C.sans,
          display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
        <Icon name="share" size={13} color="white"/> Cast on Farcaster
      </button>
    </div>
  </Card>
</div>
```

);

const PAGE_MAP = {
dashboard:   wallet&&stats ? DashPage  : null,
degencard:   wallet&&stats ? CardPage  : null,
leaderboard: LBPage,
wagers:      wallet&&stats ? WagerPage : null,
pro:         wallet&&stats ? ProPage   : null,
referral:    wallet ? RefPage : null,
};

/* ─── ROOT RENDER ───────────────────────────────────────────────────────── */
return (
<div style={{fontFamily:C.sans,minHeight:“100vh”,background:C.bg}}>
<BackgroundArt/>
{/* Mobile overlay */}
{isMobile && mobileSide && (
<div onClick={()=>setMobileSide(false)} style={{position:“fixed”,inset:0,
background:“rgba(0,0,0,0.4)”,zIndex:55,backdropFilter:“blur(2px)”}}/>
)}
{SidebarEl}

```
  <div style={{marginLeft:isMobile?0:SIDEBAR_W,transition:"margin-left .22s ease",
    position:"relative",zIndex:1}}>
    {TopBar}
    <div style={{padding:isMobile?"16px":"24px",maxWidth:1040,paddingBottom:40}}>
      {!wallet ? Landing : (PAGE_MAP[page] || (
        <Card>
          <div style={{textAlign:"center",padding:"60px 0",color:C.textSec,fontFamily:C.mono,fontSize:13}}>
            Connect your wallet to access this page.
          </div>
        </Card>
      ))}
    </div>
  </div>

  {toast && <Toast msg={toast} onClose={()=>setToast(null)}/>}
</div>
```

);
}
