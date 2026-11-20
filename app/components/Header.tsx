import React, { useState, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Locale } from "@/lib/i18n";

interface FeeStats {
  min: number; max: number; avg: number; median: number;
  p75: number; p90: number; p95: number;
  sampleSize: number; lastUpdate: string;
}

interface HeaderProps {
  t: any;
  netHealth: string;
  solPrice: number | null;
  locale: string;
  changeLocale: (l: Locale) => void;
  aiFeeMode: string;
  setAiFeeMode: (mode: any) => void;
  estimatedMicroLamports: number;
  feeStats: FeeStats | null;
}

export default function Header({ 
  t, netHealth, solPrice, locale, changeLocale,
  aiFeeMode, setAiFeeMode, estimatedMicroLamports, feeStats
}: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => setMounted(true), []);

  const rpcStyles = {
    Fast: { bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.3)", text: "#34d399", dot: "#34d399" },
    Normal: { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)", text: "#fcd34d", dot: "#fbbf24" },
    Congested: { bg: "rgba(244, 63, 94, 0.1)", border: "rgba(244, 63, 94, 0.3)", text: "#fb7185", dot: "#fb7185" },
  };
  
  const currentStyle = rpcStyles[netHealth as keyof typeof rpcStyles] || rpcStyles.Congested;

  const languages = [
    { code: "en", label: "English (EN)" },
    { code: "ar", label: "العربية (AR)" },
    { code: "zh", label: "中文 (ZH)" },
    { code: "ru", label: "Русский (RU)" },
    { code: "es", label: "Español (ES)" },
    { code: "ko", label: "한국어 (KO)" },
    { code: "ja", label: "日本語 (JA)" },
    { code: "tr", label: "Türkçe (TR)" },
    { code: "vi", label: "Tiếng Việt (VI)" },
  ];

  const currentLangLabel = languages.find(l => l.code === locale)?.label || "English (EN)";

  const modeLabel = aiFeeMode === "Eco" ? "P50 (Median)" : aiFeeMode === "Balanced" ? "P75" : "P90";

  // 🧮 دالة لحساب التكلفة التقريبية بناءً على 200,000 CU
  const calculateCost = (microLamports: number) => {
    const lamports = (microLamports * 200000) / 1000000;
    const sol = lamports / 1000000000;
    const usd = sol * (solPrice || 0);
    return {
      sol: sol.toFixed(6),
      usd: usd === 0 ? "0.00" : (usd < 0.01 ? usd.toFixed(5) : usd.toFixed(4))
    };
  };

  const activeCost = calculateCost(estimatedMicroLamports);

  return (
    <header className="relative z-50 flex flex-col lg:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-900/10">
      
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl overflow-hidden border border-purple-500/30 shadow-lg shadow-purple-500/20">
          <img src="/logo.png" alt="Kinetix Logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xs text-slate-400 font-medium">{t.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 relative w-full lg:w-auto">
        
        {/* زر الشبكة */}
        <div className="relative">
          <button 
            onClick={() => { setShowNetworkDetails(!showNetworkDetails); setShowLangMenu(false); }}
            className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{ backgroundColor: currentStyle.bg, borderColor: currentStyle.border, color: currentStyle.text }}
          >
            <span className={`w-2 h-2 rounded-full ${netHealth === "Fast" ? "animate-ping" : ""}`} style={{ backgroundColor: currentStyle.dot }}></span>
            <span>RPC: {netHealth}</span>
            <span className="text-[10px] opacity-70 ml-1">▼</span>
          </button>

          {showNetworkDetails && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-72 bg-[#0B1120] border border-slate-700 rounded-2xl shadow-2xl z-[100] p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Network Status */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Network Status</h4>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Status:</span> <span className="font-bold" style={{ color: currentStyle.text }}>{netHealth}</span>
                </div>
              </div>

              {/* Real Network Fees Data */}
              {feeStats && feeStats.sampleSize > 0 ? (
                <div className="border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Live Priority Fees</h4>
                    <span className="text-[9px] text-emerald-400 font-mono animate-pulse">● LIVE</span>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="bg-slate-950/50 rounded-lg p-2 space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between"><span className="text-slate-500">Min:</span><span className="text-slate-300">{feeStats.min.toLocaleString()} µL</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">P50:</span><span className="text-cyan-400">{feeStats.median.toLocaleString()} µL</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">P75:</span><span className="text-amber-400">{feeStats.p75.toLocaleString()} µL</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">P90:</span><span className="text-rose-400">{feeStats.p90.toLocaleString()} µL</span></div>
                    <div className="flex justify-between border-t border-slate-800 pt-1 mt-1"><span className="text-slate-500">Max:</span><span className="text-slate-300">{feeStats.max.toLocaleString()} µL</span></div>
                  </div>
                  
                  <div className="mt-2 flex justify-between text-[9px] text-slate-500">
                    <span>Sample: {feeStats.sampleSize} tx</span>
                    <span>Updated: {feeStats.lastUpdate}</span>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-800 pt-3">
                  <p className="text-[10px] text-amber-400 text-center">⚠️ No live data. Using fallback values.</p>
                </div>
              )}

              {/* Mode Selector */}
              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Your Fee Mode</h4>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {(["Eco", "Balanced", "Turbo"] as const).map((mode) => (
                    <button key={mode} onClick={() => setAiFeeMode(mode)} className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${aiFeeMode === mode ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md" : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"}`}>
                      {mode}
                    </button>
                  ))}
                </div>
                
                {/* تم التعديل هنا لعرض التكلفة بالدولار */}
                <div className="text-center bg-cyan-500/10 border border-cyan-500/30 rounded-lg py-2 flex flex-col items-center justify-center">
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">Active Fee ({modeLabel})</div>
                  
                  <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                    {solPrice ? `~$${activeCost.usd}` : "Loading..."}
                  </div>
                  
                  <div className="text-[10px] text-cyan-500/80 font-mono">
                    ≈ {activeCost.sol} SOL
                  </div>
                  
                  <div className="text-[8px] text-slate-500 font-mono border-t border-cyan-500/20 pt-1 mt-1 w-4/5">
                    ({estimatedMicroLamports.toLocaleString()} µL)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {solPrice && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-cyan-400">
            SOL: ${solPrice.toFixed(2)}
          </div>
        )}

        {/* قائمة اللغات */}
        <div className="relative">
          <button 
            onClick={() => { setShowLangMenu(!showLangMenu); setShowNetworkDetails(false); }}
            className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none hover:border-purple-500 font-semibold cursor-pointer shadow-md flex items-center gap-2"
          >
            {currentLangLabel} <span className="text-[10px] opacity-70">▼</span>
          </button>

          {showLangMenu && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-40 bg-[#0B1120] border border-slate-700 rounded-2xl shadow-2xl z-[100] py-2 max-h-64 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { changeLocale(lang.code as Locale); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-slate-800 ${locale === lang.code ? 'text-purple-400 font-bold bg-slate-800/50' : 'text-slate-300'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="wallet-adapter-dropdown-wrapper relative z-50">
          {mounted ? (
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-indigo-600 hover:!from-purple-500 hover:!to-indigo-500 !transition-all !duration-300 !rounded-xl !font-semibold !shadow-lg !shadow-purple-600/25" />
          ) : (
            <button className="!bg-gradient-to-r !from-purple-600 !to-indigo-600 !rounded-xl !font-semibold !shadow-lg !px-4 !py-2 !text-sm">Select Wallet</button>
          )}
        </div>
      </div>
    </header>
  );
}