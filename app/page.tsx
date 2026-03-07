"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ─── Check if we're in browser ─────────────────────────────────── */
const isBrowser = typeof window !== 'undefined';

/* ─── Fonts loaded in useEffect (SSR safe) ──────────────────────────────── */
const FONT_URL = "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";

/* ─── App Icon (Swapped to pure CSS to prevent mobile copy/paste glitches) ── */
function AppIcon({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, background: "#16a34a",
      borderRadius: size * 0.22, display: "flex", alignItems: "center",
      justifyContent: "center", color: "white", fontWeight: "bold",
      fontSize: size * 0.6, flexShrink: 0
    }}>
      $
    </div>
  );
}

/* ─── SVG Icon System ───────────────────────────────────────── */
const Icon = ({ name, size=18, color="currentColor", strokeWidth=1.6 }) => {
  const paths = {
    grid:        <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    card:        <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    trophy:      <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/></>,
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
    eyeOff:      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/></>,
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

/* ─── Solana RPC ──────────────────────────────────────────────────────────── */
const RPC = "https://api.mainnet-beta.solana.com";

async function getSolBalance(pk) {
  try {
    const r = await fetch(RPC, { 
      method:"POST", 
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ jsonrpc:"2.0", id:1, method:"getBalance", params:[pk] }) 
    });
    const data = await r.json();
    return ((data.result?.value||0)/1e9);
  } catch { 
    return 0; 
  }
}

async function getTokenAccounts(pk) {
  try {
    const r = await fetch(RPC, { 
      method:"POST", 
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ 
        jsonrpc:"2.0", 
        id:1, 
        method:"getTokenAccountsByOwner",
        params:[pk,{programId:"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},{encoding:"jsonParsed"}]
      }) 
    });
    const data = await r.json();
    return data.result?.value||[];
  } catch { 
    return []; 
  }
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtUSD = (n,d=2) => "$"+Number(n).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtN   = (n,d=2) => Number(n).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const shrt   = a => a?`${a.slice(0,5)}…${a.slice(-4)}`:"";
const rng    = (seed,lo,hi) => { let h=0; for(let i=0;i<seed.length;i++) h=(Math.imul(31,h)+seed.charCodeAt(i))|0; return lo+(Math.abs(h%1000)/1000)*(hi-lo); };
const ri     = (s,a,b) => Math.floor(rng(s,a,b));

function buildStats(pk, sol, tc) {
  const score = Math.min(100,Math.floor(rng(pk+"d",20,90)+Math.min(sol*2,18)+Math.min(tc,12)));
  return {
    score, rugs:ri(pk+"r",0,22), diamond:ri(pk+"dm",10,100), calls:ri(pk+"c",2,55),
    hitRate:ri(pk+"h",8,70), pnl:rng(pk+"p",-40,420), hold:ri(pk+"ho",1,720),
    bags:tc||ri(pk+"bg",1,34), followers:ri(pk+"fo",120,12000), rank:ri(pk+"rk",8,2800),
    title: score>=90?"Degen God":score>=75?"Diamond Hands":score>=55?"Seasoned Ape":score>=35?"Rug Survivor":"Paper Hands",
    tier:  score>=90?"god":score>=75?"diamond":score>=55?"ape":"survivor",
    isVIP: score>=82,
  };
}

/* ─── Animated counter ───────────────────────────────────────────────────── */
function Count({ to, fmt=fmtN, dec=2, ms=900 }) {
  const [v,setV] = useState(0);
  const raf = useRef();
  useEffect(()=>{
    const t=parseFloat(to)||0,t0=performance.now();
    const tick=(now)=>{const p=Math.min((now-t0)/ms,1),e=1-Math.pow(1-p,4);setV(t*e);if(p<1)raf.current=requestAnimationFrame(tick);};
    raf.current=requestAnimationFrame(tick);
    return()=>{ if(raf.current) cancelAnimationFrame(raf.current); };
  },[to]);
  return <>{fmt(v,dec)}</>;
}

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  bg:        "#f7f4ef",
  surface:   "#ffffff",
  surfaceAlt:"#f0ede8",
  sidebar:   "#0d1a0d",
  sideHov:   "#182e18",
  sideAct:   "#16a34a",
  border:    "#e2ddd6",
  borderStr: "#ccc7bf",
  green:     "#16a34a",
  greenLight:"#dcfce7",
  greenMid:  "#86efac",
  greenStr:  "#15803d",
  text:      "#131a12",
  textSec:   "#5c6b5c",
  textMute:  "#9aa498",
  red:       "#dc2626",
  redLight:  "#fee2e2",
  gold:      "#b45309",
  goldLight: "#fef3c7",
  purple:    "#6d28d9",
  purpleLight:"#ede9fe",
  mono:      "'JetBrains Mono', monospace",
  sans:      "'Instrument Sans', sans-serif",
};

/* ─── Leaderboard data ───────────────────────────────────────────────────── */
const LB_DATA = [
  {rank:1, name:"DegenGod.sol",    sol:18420, score:99, pnl:892, followers:48200, tier:"god"},
  {rank:2, name:"DiamondFlip.sol", sol:9810,  score:94, pnl:541, followers:32100, tier:"diamond"},
  {rank:3, name:"ApeKing.sol",     sol:7050,  score:88, pnl:398, followers:21800, tier:"ape"},
  {rank:4, name:"MoonBag.sol",     sol:5870,  score:81, pnl:271, followers:18400, tier:"god"},
  {rank:5, name:"Wagmi.sol",       sol:4240,  score:77, pnl:198, followers:14300, tier:"diamond"},
  {rank:6, name:"BagsKing.sol",    sol:3110,  score:71, pnl:143, followers:10200, tier:"ape"},
  {rank:7, name:"OnChain.sol",     sol:2480,  score:65, pnl:98,  followers:7800,  tier:"ape"},
  {rank:8, name:"AlphaApe.sol",    sol:1840,  score:59, pnl:67,  followers:5400,  tier:"survivor"},
];
const TIER_COLOR = {god:C.purple, diamond:"#0891b2", ape:C.green, survivor:C.gold};

/* ─── Beautiful background SVG ──────────────────────────────────────────── */
function BackgroundArt() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none"}}>
      <div style={{position:"absolute",inset:0,background:"#f7f4ef"}}/>
      <div style={{position:"absolute",top:-200,right:-200,width:700,height:700,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(22,163,74,0.06) 0%,transparent 70%)"}}/>
      <div style={{position:"absolute",bottom:-150,left:-150,width:500,height:500,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(22,163,74,0.05) 0%,transparent 70%)"}}/>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.45}} xmlns="http://www.w3.org/2000/svg">
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
      {[120,240,400,600].map(y=>(
        <div key={y} style={{position:"absolute",top:y,left:0,right:0,height:1,
          background:`linear-gradient(90deg,transparent 0%,rgba(22,163,74,0.1) 30%,rgba(22,163,74,0.1) 70%,transparent 100%)`}}/>
      ))}
    </div>
  );
}

/* ─── Reusable Card ──────────────────────────────────────────────────────── */
function Card({ children, style={}, accent=false }) {
  return (
    <div style={{background:C.surface, border:`1px solid ${accent?C.green:C.border}`,
      borderRadius:16, padding:"22px", position:"relative",
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)", ...style}}>
      {children}
    </div>
  );
}

/* ─── Label ─────────────────────────��──────────────────────────────────── */
function Label({ children }) {
  return <div style={{fontSize:10,fontWeight:600,color:C.textMute,textTransform:"uppercase",
    letterSpacing:".1em",fontFamily:C.mono,marginBottom:6}}>{children}</div>;
}

/* ─── Progress bar ───────────────────────────────────────────────────────── */
function Bar({ pct, color=C.green, height=6 }) {
  return (
    <div style={{height,background:C.surfaceAlt,borderRadius:height/2,overflow:"hidden",
      border:`1px solid ${C.border}`}}>
      <div style={{height:"100%",width:`${Math.min(pct,100)}%`,
        background:`linear-gradient(90deg,${color},${C.green})`,
        borderRadius:height/2,transition:"width 1.1s ease"}}/>
    </div>
  );
}

/* ─── Toast ────────────────────────────────────────────────────────────── */
function Toast({ msg, onClose }) {
  useEffect(()=>{const t=setTimeout(onClose,2600);return()=>clearTimeout(t);},[onClose]);
  return (
    <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:1000,
      background:C.sidebar,color:"white",padding:"11px 22px",borderRadius:50,fontSize:13,
      fontWeight:600,fontFamily:C.sans,boxShadow:"0 8px 32px rgba(0,0,0,0.22)",
      border:`1px solid ${C.green}`,whiteSpace:"nowrap",letterSpacing:"-0.1px"}}>
      {msg}
    </div>
  );
}

/* ─── Degen Card ──────────────────────────────────────────────────────────── */
function DegenCard({ stats, pubkey, sol, minted, onMint, minting }) {
  const pos = stats.pnl >= 0;
  return (
    <div style={{background:C.sidebar,borderRadius:20,padding:"26px 24px 22px",
      position:"relative",overflow:"hidden",color:"white",fontFamily:C.sans,
      boxShadow:"0 24px 64px rgba(13,26,13,0.2),0 2px 8px rgba(0,0,0,0.1)",
      border:"1px solid rgba(22,163,74,0.25)"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.6}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cdiag" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="24" stroke="#22c55e" strokeWidth="0.4" strokeOpacity="0.12"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cdiag)"/>
      </svg>
      <div style={{position:"absolute",top:-80,right:-80,width:240,height:240,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%)",pointerEvents:"none"}}/>

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
  );
}

/* ─── VIP Lock ───────────────────────────────────────────────────────────── */
function VIPGate({ rank, score, onShare }) {
  const pct = Math.max(0,100-(rank/2800)*100);
  const needed = Math.max(0,rank-100);
  return (
    <Card style={{overflow:"hidden",padding:0}}>
      <div style={{background:C.sidebar,padding:"40px 28px 0",position:"relative",overflow:"hidden"}}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="vpat" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="20" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vpat)"/>
        </svg>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,filter:"blur(4px)",opacity:.35,pointerEvents:"none",paddingBottom:20}}>
          {["Whale Activity","Alpha Signals","Predictive Chart","Network Map"].map(t=>(
            <div key={t} style={{background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"16px",
              height:80,border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{width:60,height:8,background:"rgba(255,255,255,0.2)",borderRadius:4,marginBottom:8}}/>
              <div style={{width:40,height:20,background:"rgba(34,197,94,0.4)",borderRadius:4}}/>
            </div>
          ))}
        </div>
      </div>

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
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────────────────── */
export default function BagTracker() {
  const [wallet,     setWallet]     = useState(null);
  const [sol,        setSol]        = useState(0);
  const [tokens,     setTokens]     = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [page,       setPage]       = useState("dashboard");
  const [stats,      setStats]      = useState(null);
  const [toast,      setToast]      = useState(null);
  const [sideOpen,   setSideOpen]   = useState(true);
  const [mobileSide, setMobileSide] = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);

  const [minted,     setMinted]     = useState(false);
  const [minting,    setMinting]    = useState(false);
  const [streak,     setStreak]     = useState(4);
  const [checkedIn,  setCheckedIn]  = useState(false);
  const [goal,       setGoal]       = useState({type:"portfolio",target:10000,label:"$10,000 Portfolio"});
  const [wager,      setWager]      = useState(null);
  const [wagerForm,  setWagerForm]  = useState({type:"followers",amount:5,target:1000});
  const [watching,   setWatching]   = useState(["DegenGod.sol"]);
  const [tipping,    setTipping]    = useState(null);
  const [refCopied,  setRefCopied]  = useState(false);

  const SOL_PRICE = 178;

  // Load fonts - FIX #1: Add browser check
  useEffect(()=>{
    if (!isBrowser) return;
    if(document.querySelector('link[data-bagtracker-font]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONT_URL;
    l.setAttribute('data-bagtracker-font','1');
    l.onerror = () => console.warn('Font load failed');
    document.head.appendChild(l);
  },[]);

  // Resize listener - FIX #2: Add browser check
  useEffect(()=>{
    if (!isBrowser) return;
    const check=()=>{ setIsMobile(window.innerWidth<820); if(window.innerWidth<820) setSideOpen(false); };
    check(); 
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  // Connect wallet - FIX #3: Add browser check and cast window
  const connect = useCallback(async()=>{
    if (!isBrowser) return;
    const p=(window as any).solana||(window as any).phantom?.solana;
    if(!p?.isPhantom){ alert("Install Phantom from phantom.app"); return; }
    setConnecting(true);
    try {
      const resp = await p.connect();
      const pk = resp.publicKey.toString();
      setWallet({publicKey:pk});
      const [bal,tkns] = await Promise.all([getSolBalance(pk),getTokenAccounts(pk)]);
      setSol(bal); setTokens(tkns);
      setStats(buildStats(pk,bal,tkns.length));
      setToast("Wallet connected — Solana Mainnet");
    } catch(e){ if(e.code!==4001) alert("Connection failed"); }
    finally{ setConnecting(false); }
  },[]);

  const disconnect = ()=>{ setWallet(null); setSol(0); setTokens([]); setStats(null); setMinted(false); };

  // Phantom listener - FIX #4: Add browser check and cast window
  useEffect(()=>{
    if (!isBrowser) return;
    const p=(window as any).solana; if(!p) return;
    p.on?.("disconnect",disconnect);
    return()=>p.off?.("disconnect",disconnect);
  },[]);

  const totalUsd = sol * SOL_PRICE;
  const goalPct  = goal.type==="portfolio" ? (totalUsd/goal.target)*100 : (stats?.followers||0)/goal.target*100;

  const doMint = async()=>{
    setMinting(true);
    await new Promise(r=>setTimeout(r,2200));
    setMinted(true); setMinting(false);
    setToast("Degen Card minted as NFT on Solana Mainnet");
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
    setWager({...wagerForm, placed:new Date().toLocaleDateString(), deadline:"7 days"});
    setToast(`Wager placed — ${wagerForm.amount} SOL staked`);
  };

  // Copy referral - FIX #5: Add browser check
  const doCopyRef = ()=>{
    if (!isBrowser) return;
    navigator.clipboard.writeText(`https://bagtracker.vercel.app?ref=${wallet?.publicKey?.slice(0,8)}`);
    setRefCopied(true); setTimeout(()=>setRefCopied(false),2500);
    setToast("Referral link copied to clipboard");
  };

  const tweetCard = ()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${stats?.title} — Score: ${stats?.score}/100\n◎ ${fmtN(sol,3)} SOL on Solana\n\nbagtracker.vercel.app`)}`, "_blank");
  const farcaster = ()=>window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(`Checking my bags on BagTracker — Score ${stats?.score}/100\nbagtracker.vercel.app`)}`, "_blank");
  const shareRank = ()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm ranked #${stats?.rank} on BagTracker — grinding to Top 100 to unlock Pro\nbagtracker.vercel.app`)}`, "_blank");

  const SIDEBAR_W = sideOpen ? 230 : 64;

  const NAV = [
    {id:"dashboard",  icon:"grid",   label:"Dashboard"},
    {id:"degencard",  icon:"card",   label:"Degen Card"},
    {id:"leaderboard",icon:"trophy", label:"Leaderboard"},
    {id:"wagers",     icon:"zap",    label:"Wagers"},
    {id:"pro",        icon:"crown",  label:"Pro VIP"},
    {id:"referral",   icon:"gift",   label:"Referral"},
  ];

  /* ── SIDEBAR ────────────────────────────────────────────────────────────── */
  const SidebarEl = (
    <div style={{
      position:"fixed", top:0, left: isMobile&&!mobileSide ? -230 : 0,
      bottom:0, width: isMobile ? 230 : SIDEBAR_W,
      background:C.sidebar, zIndex:60,
      display:"flex", flexDirection:"column",
      borderRight:"1px solid rgba(255,255,255,0.05)",
      transition:"all .22s ease", overflow:"hidden",
    }}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="spat" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="20" stroke="#22c55e" strokeWidth="0.4" strokeOpacity="0.07"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#spat)"/>
      </svg>

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
  );

  /* ── TOP BAR ────────────────────────────────────────────────────────────── */
  const TopBar = (
    <div style={{position:"sticky",top:0,zIndex:40,background:"rgba(247,244,239,0.92)",
      backdropFilter:"blur(14px)",borderBottom:`1px solid ${C.border}`,
      padding:"0 22px",height:56,display:"flex",alignItems:"center",
      justifyContent:"space-between",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {isMobile && (
          <button onClick={()=>setMobileSide(true)} style={{background:"transparent",border:"none",
            cursor:"pointer",color:C.textSec,padding:4,borderRadius:8,display:"flex"}}>
            <Icon name="menu" size={20} color="currentColor"/>
          </button>
        )}
        <div style={{fontFamily:C.sans,fontWeight:700,fontSize:16,color:C.text,letterSpacing:"-0.3px"}}>
          {NAV.find(n=>n.id===page)?.label||"BagTracker"}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {wallet && (
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",
            background:C.greenLight,border:`1px solid ${C.greenMid}`,borderRadius:20}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/>
            <span style={{fontSize:11,fontWeight:700,color:C.green,fontFamily:C.mono}}>Mainnet</span>
          </div>
        )}
        {wallet ? (
          <div style={{padding:"6px 13px",background:C.surface,border:`1px solid ${C.border}`,
            borderRadius:10,fontSize:12,fontWeight:600,color:C.textSec,fontFamily:C.mono}}>
            {shrt(wallet.publicKey)}
          </div>
        ) : (
          <button onClick={connect} disabled={connecting} style={{padding:"9px 20px",
            background:connecting?C.greenLight:C.green,border:"none",borderRadius:10,
            fontSize:13,fontWeight:700,color:connecting?C.green:"white",cursor:"pointer",
            fontFamily:C.sans,boxShadow:connecting?"none":"0 2px 12px rgba(22,163,74,0.28)",
            display:"flex",alignItems:"center",gap:7}}>
            <Icon name="wallet" size={15} color={connecting?C.green:"white"}/>
            {connecting?"Connecting...":"Connect Wallet"}
          </button>
        )}
      </div>
    </div>
  );

  /* ── LANDING ────────────────────────────────────────────────────────────── */
  const Landing = (
    <div style={{minHeight:"80vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:"60px 24px",textAlign:"center"}}>
      <div style={{marginBottom:24,position:"relative",display:"inline-block"}}>
        <AppIcon size={72}/>
        <div style={{position:"absolute",inset:-8,borderRadius:"50%",
          background:`radial-gradient(circle,rgba(22,163,74,0.12),transparent 70%)`}}/>
      </div>
      <div style={{fontSize:10,fontWeight:600,color:C.green,letterSpacing:".16em",
        textTransform:"uppercase",marginBottom:14,fontFamily:C.mono}}>bag.fm · solana mainnet</div>
      <h1 style={{fontFamily:C.sans,fontSize:isMobile?44:60,fontWeight:700,margin:"0 0 14px",
        letterSpacing:"-2.5px",lineHeight:1.02,color:C.text}}>
        Track Your<br/><span style={{color:C.green}}>Bags.</span>
      </h1>
      <p style={{color:C.textSec,fontSize:15,maxWidth:380,margin:"0 auto 36px",lineHeight:1.8,fontFamily:C.sans}}>
        Real-time Solana portfolio analytics, verifiable on-chain identity, wagers, and a leaderboard that separates the holders from the paper hands.
      </p>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:40,maxWidth:480}}>
        {[
          {i:"diamond",t:"Mintable NFT Cards"},
          {i:"zap",t:"Onchain Wagers"},
          {i:"lock",t:"VIP Token Gate"},
          {i:"gift",t:"Referral Bounties"},
          {i:"trophy",t:"Live Leaderboard"},
          {i:"flame",t:"Daily Streaks"},
        ].map(f=>(
          <div key={f.t} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",
            background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,
            fontSize:12,fontWeight:600,color:C.textSec,fontFamily:C.sans}}>
            <Icon name={f.i} size={12} color={C.green}/>{f.t}
          </div>
        ))}
      </div>
      <button onClick={connect} disabled={connecting} style={{padding:"14px 44px",
        background:C.green,border:"none",borderRadius:50,fontWeight:700,fontSize:15,
        color:"white",cursor:"pointer",fontFamily:C.sans,
        boxShadow:"0 4px 28px rgba(22,163,74,0.3)",letterSpacing:"-0.1px",
        display:"flex",alignItems:"center",gap:8}}>
        <Icon name="wallet" size={16} color="white"/>
        {connecting?"Connecting...":"Connect Phantom"}
      </button>
      <div style={{color:C.textMute,fontSize:11,marginTop:12,fontFamily:C.mono}}>Phantom · Solflare · Backpack · Glow</div>
    </div>
  );

  const PAGE_MAP = {
    dashboard:   wallet&&stats ? <div>Dashboard Page</div> : null,
    degencard:   wallet&&stats ? <div>Card Page</div> : null,
    leaderboard: <div>Leaderboard Page</div>,
    wagers:      wallet&&stats ? <div>Wagers Page</div> : null,
    pro:         wallet&&stats ? <div>Pro Page</div> : null,
    referral:    wallet ? <div>Referral Page</div> : null,
  };

  return (
    <div style={{fontFamily:C.sans,minHeight:"100vh",background:C.bg}}>
      <BackgroundArt/>
      {isMobile && mobileSide && (
        <div onClick={()=>setMobileSide(false)} style={{position:"fixed",inset:0,
          background:"rgba(0,0,0,0.4)",zIndex:55,backdropFilter:"blur(2px)"}}/>
      )}
      {SidebarEl}

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
  );
}
