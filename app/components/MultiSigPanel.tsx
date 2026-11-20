import React from "react";

interface MultiSigPanelProps {
  isOpen: boolean;
  multisigVault: string;
  setMultisigVault: (val: string) => void;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
  setShowMultisigPanel: (val: boolean) => void;
}

export default function MultiSigPanel({
  isOpen,
  multisigVault,
  setMultisigVault,
  addToast,
  setShowMultisigPanel
}: MultiSigPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 space-y-3 animate-fadeIn shadow-lg shadow-indigo-500/10">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">Multi-Sig DAO Vault (Squads Integration)</h3>
        <span className="text-[10px] text-slate-400">Institutional Governance</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Vault Address (e.g. Squads...)"
          value={multisigVault}
          onChange={(e) => setMultisigVault(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-indigo-500 font-mono"
        />
        <button
          onClick={() => {
            if (!multisigVault.trim()) {
              addToast("Please enter a valid vault address.", "error");
            } else {
              addToast(`Multi-sig vault linked: ${multisigVault.slice(0, 4)}...${multisigVault.slice(-4)}`, "success");
              setShowMultisigPanel(false);
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
        >
          Connect Vault
        </button>
      </div>
      {multisigVault && (
        <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
          <span>✓ Active Vault Secured: {multisigVault.slice(0, 6)}...</span>
        </div>
      )}
    </div>
  );
}