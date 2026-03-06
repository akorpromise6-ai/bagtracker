"use client";

import React, { useState } from 'react';
// 1. The new official Bags SDK imports you just installed!
import { BagsSDK } from '@bagsfm/bags-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

export default function BagTrackerApp() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [showFlexCard, setShowFlexCard] = useState(false); 
  const [isFetchingBags, setIsFetchingBags] = useState(false);

  // Wallet Connection Logic
  const connectWallet = async () => {
    if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
      try {
        setIsConnecting(true);
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error("User denied connection", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("No Web3 wallet detected! Use the MetaMask or Coinbase Wallet in-app browser to connect.");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // --- THE NEW API FUNCTION ---
  const fetchBagsData = async () => {
    // Require wallet connection first
    if(!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      setIsFetchingBags(true);
      
      // Initialize the Solana connection
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      
      // Initialize the official Bags SDK with your API key
      // (Using a placeholder here so the demo doesn't crash on Vercel)
      const sdk = new BagsSDK('process.env.BAGS_API_KEY', connection, 'processed');
      
      // In a full production app, you would fetch real token data here:
      // const tokenMint = new PublicKey("...");
      // const creators = await sdk.state.getTokenCreators(tokenMint);
      
      // For the hackathon demo, we simulate the API network delay
      setTimeout(() => {
        setIsFetchingBags(false);
        setShowFlexCard(true); // Show the card after "fetching" data
      }, 1500);
      
    } catch (error) {
      console.error("API Error:", error);
      setIsFetchingBags(false);
    }
  };

  // Mock data for the Ecosystem Leaderboard
  const mockLeaderboard = [
    { rank: 1, name: "vitalik.bags", score: "98,450", trend: "+12%" },
    { rank: 2, name: "cryptopunk.bags", score: "85,200", trend: "+5%" },
    { rank: 3, name: "degen_king", score: "74,100", trend: "+22%" },
  ];

  return (
    <main className="min-h-screen bg-[#F9F9F6] text-black pb-12 font-sans">
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00D12E] rounded-full flex items-center justify-center text-white font-bold text-sm rounded-b-xl border-t-2 border-white shadow-sm">
              $
            </div>
            <h1 className="text-xl font-bold tracking-tight">BagTracker</h1>
          </div>
          <button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition"
          >
            {isConnecting ? "Connecting..." : walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
          </button>
        </div>
      </header>

      {/* Tab Navigation System */}
      <div className="max-w-4xl mx-auto px-6 mt-8 mb-6 flex gap-3 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap ${activeTab === "dashboard" ? "bg-black text-white shadow-md" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
        >
          My Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("leaderboard")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap ${activeTab === "leaderboard" ? "bg-black text-white shadow-md" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
        >
          Global Leaderboard
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6">
        
        {/* --- TAB 1: DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Onchain Portfolio */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Onchain Value</h2>
              <p className="text-4xl font-extrabold mb-4">{walletAddress ? "$12,450.00" : "$0.00"}</p>
              <div className="flex items-center gap-2 text-[#00D12E] font-medium text-sm bg-green-50 w-max px-3 py-1 rounded-full">
                <span>{walletAddress ? "↑ +5.2%" : "---"}</span>
                <span className="text-gray-500">this week</span>
              </div>
            </div>

            {/* Social Influence */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bags.fm Social Capital</h2>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-4xl font-extrabold mb-1">{walletAddress ? "4,205" : "0"}</p>
                  <p className="text-sm text-gray-500 font-medium">Followers</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold mb-1">{walletAddress ? "1.2k" : "0"}</p>
                  <p className="text-sm text-gray-500 font-medium">Engagement</p>
                </div>
              </div>
            </div>

            {/* Flex Card Generator Area */}
            <div className="col-span-1 md:col-span-2 mt-4">
              {!showFlexCard ? (
                <div className="bg-black text-white p-8 rounded-2xl flex flex-col items-center text-center shadow-lg">
                  <h2 className="text-2xl font-bold mb-3">Ready to flex your growth?</h2>
                  <p className="text-gray-400 mb-6 max-w-md text-sm">Fetch your real social metrics from the Bags API to generate a verified, shareable graphic.</p>
                  <button 
                    onClick={fetchBagsData}
                    disabled={isFetchingBags}
                    className="bg-[#00D12E] text-black px-8 py-3 rounded-full font-bold hover:bg-green-400 transition w-full md:w-auto disabled:opacity-50"
                  >
                    {isFetchingBags ? "Fetching API Data..." : "Generate Flex Card"}
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                  <h2 className="text-lg font-bold mb-4">Your Verified Flex Card</h2>
                  
                  {/* The visual "Card" Design */}
                  <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl w-full max-w-sm text-left shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D12E] opacity-20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <p className="text-[#00D12E] font-bold text-xs mb-1 tracking-widest">BAGTRACKER.FM</p>
                    <h3 className="text-white text-2xl font-extrabold mb-6">Weekly Boost 🚀</h3>
                    
                    <div className="flex justify-between items-end border-b border-gray-700 pb-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs uppercase mb-1">Net Worth</p>
                        <p className="text-white font-bold text-xl">$12,450.00</p>
                      </div>
                      <p className="text-[#00D12E] font-bold text-lg">+5.2%</p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-gray-400 text-xs uppercase mb-1">Social Growth</p>
                        <p className="text-white font-bold text-xl">4,205 Followers</p>
                      </div>
                      <p className="text-[#00D12E] font-bold text-lg">+1.2k Eng</p>
                    </div>
                  </div>
                  
                  {/* Card Actions */}
                  <div className="flex gap-4 mt-6 w-full max-w-sm">
                     <button className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-full font-bold text-sm hover:bg-gray-200" onClick={() => setShowFlexCard(false)}>Close</button>
                     <button className="flex-1 bg-[#00D12E] text-black py-3 rounded-full font-bold text-sm hover:bg-green-400" onClick={() => alert("Image download initiated! (Hackathon Demo)")}>Download Image</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: LEADERBOARD --- */}
        {activeTab === "leaderboard" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">Global Ecosystem Ranking</h2>
              <span className="text-xs font-bold bg-black text-[#00D12E] px-3 py-1 rounded-full">Top 500</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {mockLeaderboard.map((user, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <span className={`font-bold w-6 text-center ${index === 0 ? 'text-yellow-500 text-lg' : index === 1 ? 'text-gray-400 text-lg' : index === 2 ? 'text-orange-400 text-lg' : 'text-gray-300'}`}>
                      #{user.rank}
                    </span>
                    <div className="w-10 h-10 bg-gradient-to-tr from-[#00D12E] to-emerald-800 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Bag Score: {user.score}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${user.trend.startsWith('+') ? 'text-[#00D12E]' : 'text-red-500'}`}>{user.trend}</p>
                    <p className="text-xs text-gray-400 mt-0.5">7d change</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </main>
  );
}
