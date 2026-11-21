"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function AdminDashboard() {
  const { publicKey, connected } = useWallet();
  const [isSessionActive, setIsSessionActive] = useState(false); // جلسة مؤقتة
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    totalFees: 0,
    uniqueUsers: 0,
    isPaused: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 👑 عنوان محفظة المالك
  const OWNER_WALLET = "HXbcGYiYFPuq41oCL8wo232J6cA8v7XH2gYoHr1kBF9r";

  useEffect(() => {
    // إذا كانت المحفظة متصلة وغير مصرح، لا نفعل شيئاً
    // المستخدم يجب أن يضغط على زر "تأكيد الدخول" يدوياً
    setIsLoading(false);
  }, [connected, publicKey]);

  const handleConfirmLogin = () => {
    if (connected && publicKey && publicKey.toBase58() === OWNER_WALLET) {
      setIsSessionActive(true);
    } else {
      alert("Access Denied: You are not the owner.");
    }
  };

  // 📊 جلب الإحصائيات (فقط عندما تكون الجلسة نشطة)
  useEffect(() => {
    if (!isSessionActive) return;
    
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error("Failed to load stats:", err));
  }, [isSessionActive]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  // 🔒 صفحة تسجيل الدخول
  if (!isSessionActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl shadow-2xl text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white">🔐 Owner Access Only</h1>
            <p className="text-sm text-slate-400 mt-2">
              {connected 
                ? "Please confirm your identity to access the dashboard." 
                : "Please connect your owner wallet to continue."}
            </p>
          </div>
          
          <div className="flex justify-center mb-4">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-indigo-600 hover:!from-purple-500 hover:!to-indigo-500 !transition-all !duration-300 !rounded-xl !font-semibold !shadow-lg !shadow-purple-600/25" />
          </div>

          {connected && (
             <div className="mt-4">
               <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs font-mono mb-3">
                 Connected: {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
               </div>
               
               {publicKey?.toBase58() === OWNER_WALLET ? (
                 <button 
                   onClick={handleConfirmLogin}
                   className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-500 hover:to-teal-500 transition-all"
                 >
                   Confirm Admin Access
                 </button>
               ) : (
                 <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                   This wallet does not have admin privileges.
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    );
  }

  // 📊 لوحة التحكم الرئيسية
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Kinetix Admin Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">Owner Control Panel</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 mb-1">Connected as:</div>
            <div className="text-sm font-mono text-emerald-400">
              {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-bold mb-2">Total Transactions</div>
            <div className="text-3xl font-extrabold text-white">{stats.totalTransactions}</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-bold mb-2">Total Volume (SOL)</div>
            <div className="text-3xl font-extrabold text-cyan-400">{stats.totalVolume.toFixed(4)}</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-bold mb-2">Total Fees (SOL)</div>
            <div className="text-3xl font-extrabold text-emerald-400">{stats.totalFees.toFixed(4)}</div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-bold mb-2">Unique Users</div>
            <div className="text-3xl font-extrabold text-purple-400">{stats.uniqueUsers}</div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">Platform Controls</h2>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white">Platform Status</div>
              <div className="text-xs text-slate-400 mt-1">
                {stats.isPaused ? "🔴 Paused - Users cannot send batches" : "🟢 Active - Platform is live"}
              </div>
            </div>
            <button
              onClick={async () => {
                const res = await fetch("/api/admin/toggle", { method: "POST" });
                const data = await res.json();
                if (data.success) {
                  setStats({ ...stats, isPaused: data.isPaused });
                }
              }}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                stats.isPaused
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30"
              }`}
            >
              {stats.isPaused ? "Resume Platform" : "Pause Platform"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}