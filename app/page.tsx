import { useState, useEffect, useCallback, useRef } from “react”;

/* ─── Fonts ──────────────────────────────────────────────────────────────── */
(() => {
const l = document.createElement(“link”);
l.rel = “stylesheet”;
l.href = “https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap”;
document.head.appendChild(l);
})();

/* ─── App Icon ───────────────────────────────────────────────────────────── */
const ICON_B64 = “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”;
function AppIcon({ size = 32 }) {
return <img src={`data:image/png;base64,${ICON_B64}`} width={size} height={size}
style={{ borderRadius: size * 0.22, display:“block”, flexShrink:0 }} alt=”” />;
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
