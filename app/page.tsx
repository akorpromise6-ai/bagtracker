"use client";

import React, { useState } from 'react';

export default function Dashboard() {
  // These 'states' remember if the wallet is connected
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // The magic function that connects the Web3 wallet
  const connectWallet = async () => {
    // Check if the browser has a crypto wallet injected
    if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
      try {
        setIsConnecting(true);
        // Ask the wallet for permission to connect
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]); // Save the connected wallet address
        }
      } catch (error) {
        console.error("User denied connection", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      // If they don't have a wallet installed, show this alert
      alert("No Web3 wallet detected! To test this on mobile, open this website inside the MetaMask or Coinbase Wallet in-app browser.");
    }
  };

  // Helper to make the long wallet address look pretty (e.g., 0x123...ABCD)
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <main className="min-h-screen bg-[#F9F9F6] text-black p-8 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00D12E] rounded-full flex items-center justify-center text-white font-bold text-xl rounded-t-none rounded-b-xl border-t-4 border-white">
            $
          </div>
          <h1 className="text-2xl font-bold tracking-tight">BagTracker</h1>
        </div>
        
        {/* Dynamic Connect Button */}
        <button 
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition"
        >
          {isConnecting ? "Connecting..." : walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
        </button>
      </header>

      {/* Main Content Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Onchain Portfolio Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Onchain Value</h2>
          {/* Numbers only show up IF a wallet is connected */}
          <p className="text-4xl font-bold mb-4">
            {walletAddress ? "$12,450.00" : "$0.00"}
          </p>
          <div className="flex items-center gap-2 text-[#00D12E] font-medium">
            <span>{walletAddress ? "↑ +5.2%" : "---"}</span>
            <span className="text-gray-400 text-sm">this week</span>
          </div>
        </div>

        {/* Social Influence Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Bags.fm Social Capital</h2>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-4xl font-bold mb-1">{walletAddress ? "4,205" : "0"}</p>
              <p className="text-sm text-gray-500 font-medium">Followers</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold mb-1">{walletAddress ? "1.2k" : "0"}</p>
              <p className="text-sm text-gray-500 font-medium">Weekly Engagement</p>
            </div>
          </div>
        </div>

        {/* Flex Card Generator Prompt */}
        <div className="col-span-1 md:col-span-2 bg-black text-white p-8 rounded-2xl flex flex-col items-center text-center mt-4">
          <h2 className="text-2xl font-bold mb-3">Ready to flex your growth?</h2>
          <p className="text-gray-400 mb-6 max-w-md">Generate a verified, shareable graphic of your weekly portfolio and social growth to post on your timeline.</p>
          <button 
            onClick={() => alert("Connecting to Bags.fm API... (Hackathon feature coming soon!)")}
            className="bg-[#00D12E] text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-green-400 transition w-full md:w-auto"
          >
            Generate Flex Card
          </button>
        </div>

      </div>
    </main>
  );
}
