import React, { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";

interface BatchInputSectionProps {
  t: any;
  mint: string;
  setMint: (val: string) => void;
  inputMode: "rows" | "csv";
  setInputMode: (mode: "rows" | "csv") => void;
  recipientRows: any[];
  updateRow: (id: string, field: "address" | "amount", value: string) => void;
  removeRow: (id: string) => void;
  addRow: () => void;
  text: string;
  setText: (val: string) => void;
  busy: boolean;
  plan: any;
  msg: string;
  preview: () => void;
  downloadTemplate: () => void;
  loadGroupToRows: (content: string) => void;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
  solPrice: number | null;
  setShowAiFeePanel: React.Dispatch<React.SetStateAction<boolean>>;
  setShowWebhookPanel: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSchedulePanel: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMultisigPanel: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAddressBook: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
}

export default function BatchInputSection({
  t, mint, setMint, inputMode, setInputMode, recipientRows, updateRow, removeRow, addRow,
  text, setText, busy, plan, msg, preview, downloadTemplate, loadGroupToRows, addToast,
  solPrice,
  setShowAiFeePanel, setShowWebhookPanel, setShowSchedulePanel, setShowMultisigPanel, setShowAddressBook,
  children
}: BatchInputSectionProps) {
  
  const [stats, setStats] = useState({ valid: 0, invalid: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let valid = 0;
    let invalid = 0;
    recipientRows.forEach((row) => {
      if (row.address.trim() !== "") {
        try {
          new PublicKey(row.address.trim());
          valid++;
        } catch (e) {
          invalid++;
        }
      }
    });
    setStats({ valid, invalid });
  }, [recipientRows]);

  const isBatchReady = recipientRows.length > 0 && recipientRows.every((row) => {
    if (!row.address.trim() || !row.amount.trim()) return false;
    try {
      new PublicKey(row.address.trim());
    } catch {
      return false;
    }
    const amt = parseFloat(row.amount);
    return !isNaN(amt) && amt > 0;
  });

  const totalAmount = recipientRows.reduce((sum, row) => {
    const amt = parseFloat(row.amount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);
  
  const isLargeAmount = !mint && totalAmount > 100;

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      file.text().then((content) => {
        loadGroupToRows(content);
        addToast(t.successFileLoad || "File dropped and loaded successfully!", "success");
      });
    }
  };

  return (
    <section 
      className={`md:col-span-3 p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-900/10 transition-all ${isDragging ? "border-dashed border-cyan-400 bg-slate-800/80" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      dir={t.dir}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            {t.newBatch}
          </h2>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button onClick={() => setShowAiFeePanel(prev => !prev)} className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all">⚡ {t.aiGasBtn}</button>
            <button onClick={() => setShowWebhookPanel(prev => !prev)} className="text-xs px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 transition-all">🔔 {t.alertsBtn}</button>
            <button onClick={() => setShowSchedulePanel(prev => !prev)} className="text-xs px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all">📅 {t.payrollsBtn}</button>
            <button onClick={() => setShowMultisigPanel(prev => !prev)} className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all">🏛️ {t.multiSigBtn}</button>
            <button onClick={() => setShowAddressBook(prev => !prev)} className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all">📖 {t.contactsBtn}</button>
          </div>
        </div>

        {children}

        <div className="space-y-1 mt-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.mintLabel}</label>
          <input
            className="w-full min-w-0 bg-slate-950/80 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 text-slate-200 outline-none transition-all font-mono text-sm"
            placeholder={t.mintPlaceholder}
            value={mint}
            onChange={(e) => setMint(e.target.value)}
          />
        </div>

        <div className="space-y-3 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.recipientsLabel} ({recipientRows.length})
            </label>
            <div className="flex items-center gap-3">
              <button onClick={() => setInputMode(inputMode === "rows" ? "csv" : "rows")} className="text-xs text-purple-400 hover:text-purple-300 underline font-semibold transition-colors">
                {inputMode === "rows" ? t.switchToCsv : t.switchToRows}
              </button>
              {inputMode === "csv" && (
                <button onClick={downloadTemplate} type="button" className="text-xs text-purple-400 hover:text-purple-300 underline font-medium transition-colors">
                  {t.downloadTemplate}
                </button>
              )}
            </div>
          </div>

          {recipientRows.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold bg-slate-950/50 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400">{t.validationLabel}:</span>
              <span className="text-emerald-400">{stats.valid} {t.validLabel}</span>
              {stats.invalid > 0 && <span className="text-rose-400">{stats.invalid} {t.invalidLabel}</span>}
              {totalAmount > 0 && !mint && solPrice && (
                <span className="text-cyan-400 ms-auto">
                  {t.totalLabel}: {totalAmount.toFixed(2)} SOL ≈ ${(totalAmount * solPrice).toFixed(2)}
                </span>
              )}
            </div>
          )}

          {inputMode === "rows" ? (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {recipientRows.map((row, idx) => {
                let isValid = true;
                if (row.address.trim() !== "") {
                  try { new PublicKey(row.address.trim()); } catch (e) { isValid = false; }
                }
                
                const rowAmount = parseFloat(row.amount);
                const rowUSD = !mint && solPrice && !isNaN(rowAmount) ? rowAmount * solPrice : null;

                return (
                  <div key={row.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs font-bold text-slate-500 w-6 text-center">#{idx + 1}</span>
                    <input 
                      type="text" 
                      placeholder={t.addressPlaceholder}
                      value={row.address} 
                      onChange={(e) => updateRow(row.id, "address", e.target.value)} 
                      className={`w-full min-w-0 flex-1 bg-slate-900 border text-xs rounded-xl px-3 py-2 text-slate-200 outline-none transition-colors ${
                        row.address.trim() !== "" && !isValid ? "border-rose-500 focus:border-rose-400" : "border-slate-800 focus:border-purple-500"
                      }`} 
                    />
                    <div className="flex flex-col gap-0.5 w-full sm:w-auto">
                      <input 
                        type="text" 
                        placeholder={t.amountPlaceholder}
                        value={row.amount} 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val)) {
                            updateRow(row.id, "amount", val);
                          }
                        }} 
                        className="w-full sm:w-24 bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-purple-500" 
                      />
                      {rowUSD !== null && rowUSD > 0 && (
                        <span className="text-[9px] text-slate-500 text-end font-mono">
                          ≈ ${rowUSD.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button onClick={() => removeRow(row.id)} className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all text-xs" title="Remove Row">✕</button>
                  </div>
                );
              })}
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-1 gap-2">
                <button onClick={addRow} className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all text-xs font-semibold">+ {t.addRecipientBtn}</button>
                <span className="text-[11px] text-slate-500 italic">{t.separateFieldsHint}</span>
              </div>
            </div>
          ) : (
            <textarea
              className="w-full h-52 bg-slate-950/80 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 text-slate-200 outline-none transition-all font-mono text-sm"
              placeholder={"address,amount\nAbc...xyz,1.5\nDef...uvw,20"}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </div>

        {isLargeAmount && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <span className="text-base">⚠️</span>
            <span>
              <strong>{t.largeAmountWarning}</strong> {totalAmount.toFixed(2)} SOL 
              (≈ ${(totalAmount * (solPrice || 0)).toFixed(0)} USD). {t.doubleCheckWarning}
            </span>
          </div>
        )}

        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="cursor-pointer w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all text-sm font-medium flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              {t.uploadBtn}
              <input type="file" accept=".csv,.json,.txt" hidden onChange={(e) => {
                e.target.files?.[0]?.text().then((content) => {
                  loadGroupToRows(content);
                  addToast(t.successFileLoad || "File loaded successfully!", "success");
                });
              }} />
            </label>

            <button
              className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition-all"
              disabled={busy || !isBatchReady}
              onClick={preview}
            >
              {busy && !plan ? t.analyzing || "Analyzing..." : t.reviewBtn}
            </button>
          </div>

          {msg && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm whitespace-pre-wrap">
              {msg}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}