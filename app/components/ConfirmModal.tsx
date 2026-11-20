import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: any;
  sol: (val: number | bigint) => string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, plan, sol }: ConfirmModalProps) {
  if (!isOpen || !plan) return null;

  // استخراج قائمة العناوين للعرض المختصر
  const addresses: string[] = (plan.addresses || []).slice(0, 8);
  const totalRecipients = plan.n || 0;
  const hiddenCount = Math.max(0, totalRecipients - addresses.length);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* الرأس */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl text-amber-500">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-100">Security Verification Required</h3>
              <p className="text-xs text-slate-400">Please review carefully before signing</p>
            </div>
          </div>
        </div>

        {/* الملخص */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Recipients:</span>
              <span className="font-bold text-slate-200">{plan.n}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Transactions Count:</span>
              <span className="font-bold text-slate-200">{plan.chunks?.length} chunks</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Estimated Network Fees:</span>
              <span className="font-bold text-slate-200">{sol(plan.network || 0)} SOL</span>
            </div>
          </div>

          {/* ⚠️ عرض العناوين المختصرة (جديد) */}
          {addresses.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <p className="text-xs font-bold text-amber-300 uppercase mb-2">
                ⚡ First & Last Recipients (Verify addresses!)
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                {addresses.map((addr, i) => {
                  const short = addr.length > 12 
                    ? `${addr.slice(0, 4)}...${addr.slice(-4)}` 
                    : addr;
                  return (
                    <div key={i} className="flex justify-between items-center gap-2 py-1 border-b border-amber-500/10 last:border-0">
                      <span className="text-amber-200/60">#{i + 1}</span>
                      <span className="text-amber-100 font-bold">{short}</span>
                    </div>
                  );
                })}
                {hiddenCount > 0 && (
                  <p className="text-center text-[10px] text-amber-400/60 italic pt-1">
                    + {hiddenCount} more recipients...
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 leading-relaxed">
            <strong>⚠️ Warning:</strong> Blockchain transactions are irreversible. Please ensure all recipient addresses are correct. Sending to a wrong address may result in permanent loss of funds.
          </p>
        </div>

        {/* الأزرار */}
        <div className="p-6 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950 font-bold text-sm transition shadow-lg"
          >
            I Understand, Sign Batch
          </button>
        </div>
      </div>
    </div>
  );
}