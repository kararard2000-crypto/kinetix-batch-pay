import React from "react";

interface FeeStats {
  min: number; max: number; avg: number; median: number;
  p75: number; p90: number; p95: number;
  sampleSize: number; lastUpdate: string;
}

interface AiFeePanelProps {
  isOpen: boolean;
  onClose: () => void;
  aiFeeMode: string;
  setAiFeeMode: (mode: any) => void;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
  estimatedMicroLamports: number;
  feeStats: FeeStats | null;
  solPrice: number | null; // 👈 أضفنا سعر SOL هنا
  t: any;
}

export default function AiFeePanel({ 
  isOpen, onClose, aiFeeMode, setAiFeeMode, addToast, 
  estimatedMicroLamports, feeStats, solPrice, t 
}: AiFeePanelProps) {
  if (!isOpen) return null;

  // 🧮 دالة لحساب التكلفة التقريبية بناءً على 200,000 CU
  const calculateCost = (microLamports: number) => {
    const lamports = (microLamports * 200000) / 1000000;
    const sol = lamports / 1000000000;
    const usd = sol * (solPrice || 0);
    
    // إذا كان السعر غير متوفر بعد، نرجع 0
    return {
      sol: sol.toFixed(6),
      usd: usd === 0 ? "0.00" : (usd < 0.01 ? usd.toFixed(5) : usd.toFixed(4))
    };
  };

  const activeCost = calculateCost(estimatedMicroLamports);

  return (
    <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-3 animate-fadeIn shadow-lg shadow-amber-500/10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">Priority Fee Optimizer</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Real-time data from Solana network</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
      </div>

      {/* Live Network Data */}
      {feeStats && feeStats.sampleSize > 0 ? (
        <div className="grid grid-cols-5 gap-1 p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-center">
            <div className="text-[8px] text-slate-500 uppercase">Min</div>
            <div className="text-[10px] font-mono text-slate-400">{feeStats.min.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-cyan-500 uppercase">P50</div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold">{feeStats.median.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-amber-500 uppercase">P75</div>
            <div className="text-[10px] font-mono text-amber-400 font-bold">{feeStats.p75.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-rose-500 uppercase">P90</div>
            <div className="text-[10px] font-mono text-rose-400 font-bold">{feeStats.p90.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 uppercase">Max</div>
            <div className="text-[10px] font-mono text-slate-400">{feeStats.max.toLocaleString()}</div>
          </div>
        </div>
      ) : (
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] text-center">
          ⚠️ No live data available. Using fallback values.
        </div>
      )}

      {/* Mode Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {(["Eco", "Balanced", "Turbo"] as const).map((mode) => {
          const desc = mode === "Eco" ? "P50" : mode === "Balanced" ? "P75" : "P90";
          return (
            <button
              key={mode}
              onClick={() => {
                setAiFeeMode(mode);
                addToast(`Fee mode set to ${mode}`, "info");
              }}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                aiFeeMode === mode
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <div>{mode}</div>
              <div className={`text-[9px] font-mono ${aiFeeMode === mode ? "text-slate-800" : "text-slate-500"}`}>{desc}</div>
            </button>
          );
        })}
      </div>

      {/* Active Fee Display - تم تعديله ليعرض الدولار والـ SOL */}
      <div className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex flex-col items-center justify-center">
        <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Estimated Priority Fee</div>
        
        {/* الدولار */}
        <div className="text-2xl font-mono font-bold text-cyan-400 flex items-center gap-1">
          {solPrice ? `~$ ${activeCost.usd}` : "Loading..."}
        </div>
        
        {/* السول */}
        <div className="text-[10px] text-cyan-500/80 font-mono mb-1">
          ≈ {activeCost.sol} SOL
        </div>
        
        {/* المايكرو لامبورت (صغير جداً في الأسفل) */}
        <div className="text-[8px] text-slate-600 font-mono border-t border-cyan-500/20 pt-1 mt-1 w-full">
          ({estimatedMicroLamports.toLocaleString()} µL per CU)
        </div>
      </div>

      {/* Sample info */}
      {feeStats && feeStats.sampleSize > 0 && (
        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
          <span>Sample: {feeStats.sampleSize} tx</span>
          <span>Updated: {feeStats.lastUpdate}</span>
        </div>
      )}
    </div>
  );
}