"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { Fee } from "@/lib/batch";

export default function Admin() {
  const { publicKey, signMessage } = useWallet();
  const [cfg, setCfg] = useState<Fee | null>(null); 
  const [stats, setStats] = useState<any>(null); 
  const [msg, setMsg] = useState("");

  async function login() {
    try {
      if (!publicKey || !signMessage) {
        throw new Error("Connect a wallet that supports message signing.");
      }
      
      const resNonce = await fetch("/api/admin");
      if (!resNonce.ok) throw new Error("Failed to fetch login nonce.");
      const { nonce, message } = await resNonce.json();

      const sig = await signMessage(new TextEncoder().encode(message));
      
      const r = await fetch("/api/admin", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          publicKey: publicKey.toBase58(), 
          signature: Buffer.from(sig).toString("base64"), 
          nonce 
        }) 
      });
      
      if (!r.ok) {
        const errData = await r.json();
        throw new Error(errData.error || "Authentication failed.");
      }

      const [cfgRes, statsRes] = await Promise.all([
        fetch("/api/config"),
        fetch("/api/record")
      ]);

      if (!cfgRes.ok || !statsRes.ok) throw new Error("Failed to load dashboard data.");

      setCfg(await cfgRes.json()); 
      setStats(await statsRes.json()); 
      setMsg("");
    } catch (e: any) { 
      setMsg(e.message || "An error occurred during login."); 
    }
  }

  async function save() {
    try {
      const r = await fetch("/api/config", { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(cfg) 
      });
      const j = await r.json(); 
      if (r.ok) {
        setCfg(j); 
        setMsg("Settings saved successfully.");
      } else {
        setMsg(j.error || "Failed to save settings.");
      }
    } catch (err) {
      setMsg("Network error while saving settings.");
    }
  }

  const set = (p: Partial<Fee>) => setCfg((c) => ({ ...c!, ...p }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Owner dashboard</h1>
        <WalletMultiButton />
      </div>
      
      {!cfg ? (
        <div className="card space-y-3">
          <p className="text-sm text-slate-400">Sign a message with the owner wallet to unlock settings. Nothing is sent on-chain.</p>
          <button className="btn" onClick={login}>Sign in</button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["Batches", stats?.batches], 
              ["Active users", stats?.users], 
              ["Fee revenue (SOL)", ((stats?.revenueLamports ?? 0) / 1e9).toFixed(4)], 
              ["SOL volume", (stats?.volume?.SOL ?? 0).toFixed(2)]
            ].map(([k, v]) => (
              <div key={k as string} className="card">
                <div className="text-sm text-slate-400">{k}</div>
                <div className="mt-1 text-2xl">{v ?? 0}</div>
              </div>
            ))}
          </div>
          
          <div className="card grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Fee type
              <select 
                className="field mt-1" 
                value={cfg.mode} 
                onChange={(e) => set({ mode: e.target.value as Fee["mode"] })}
              >
                <option value="flat">Flat SOL per batch</option>
                <option value="percent">Percentage of batch</option>
              </select>
            </label>
            
            <label className="text-sm">
              {cfg.mode === "flat" ? "Flat fee (SOL)" : "Percentage (max 5%)"}
              <input 
                className="field mt-1" 
                type="number" 
                step="0.001" 
                value={cfg.mode === "flat" ? cfg.flatLamports / 1e9 : cfg.bps / 100}
                onChange={(e) => set(cfg.mode === "flat" ? { flatLamports: Math.round(Number(e.target.value) * 1e9) } : { bps: Math.round(Number(e.target.value) * 100) })} 
              />
            </label>
            
            <label className="text-sm sm:col-span-2">
              Treasury wallet
              <input 
                className="field mt-1 font-mono" 
                value={cfg.treasury} 
                onChange={(e) => set({ treasury: e.target.value })} 
              />
            </label>
            
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={cfg.free} 
                onChange={(e) => set({ free: e.target.checked })} 
              />
              Free promo mode
            </label>
            
            <label className="flex items-center gap-2 text-sm text-red-300">
              <input 
                type="checkbox" 
                checked={cfg.paused} 
                onChange={(e) => set({ paused: e.target.checked })} 
              />
              Emergency pause
            </label>
            
            <button className="btn sm:col-span-2" onClick={save}>Save settings</button>
          </div>
        </>
      )}
      
      {msg && <p className="text-sm text-slate-300">{msg}</p>}
    </div>
  );
}