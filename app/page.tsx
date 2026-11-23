"use client";
import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Fee, Status, buildBatch, finalize, parseInput, priorityFee, resolveAsset, send, validate } from "@/lib/batch";
import { translations, Locale } from "@/lib/i18n";
import ToastContainer, { type Toast } from "./components/ToastContainer";
import ConfirmModal from "./components/ConfirmModal";
import Header from "./components/Header";
import SummaryDashboard from "./components/SummaryDashboard";
import AiFeePanel from "./components/AiFeePanel";
import WebhookPanel from "./components/WebhookPanel";
import SchedulePanel from "./components/SchedulePanel";
import MultiSigPanel from "./components/MultiSigPanel";
import AddressBookModal from "./components/AddressBookModal";
import BatchInputSection from "./components/BatchInputSection";

type Job = { status: Status | "Queued"; sig?: string; err?: string };
type HistoryItem = { id: string; date: string; count: number; signatures: string[] };
type SavedGroup = { id: string; name: string; content: string };
type ScheduledPayroll = { id: string; title: string; interval: "weekly" | "monthly"; nextRun: string; content: string; active: boolean };
type RecipientRow = { id: string; address: string; amount: string };

const CL = process.env.NEXT_PUBLIC_CLUSTER === "devnet" ? "?cluster=devnet" : "";
const solscan = (s: string) => `https://solscan.io/tx/${s}${CL}`;
const sol = (l: number | bigint) => (Number(l) / 1e9).toFixed(6);

const tone: Record<string, string> = {
  Queued: "text-slate-400 bg-slate-800/50 border-slate-700/50",
  Pending: "text-amber-300 bg-amber-500/10 border-amber-500/30 animate-pulse",
  Confirmed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Finalized: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  Failed: "text-rose-400 bg-rose-500/10 border-rose-500/30"
};

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, signAllTransactions } = useWallet();
  const [text, setText] = useState("");
  const [mint, setMint] = useState("");
  const [plan, setPlan] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [locale, setLocale] = useState<Locale>("en");

  const [solPrice, setSolPrice] = useState<number | null>(null);
  const tousd = (val: number | bigint) => (Number(val) / 1e9 * (solPrice || 0)).toFixed(2);
  const [netHealth, setNetHealth] = useState<"Fast" | "Normal" | "Congested">("Fast");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [addressGroups, setAddressGroups] = useState<SavedGroup[]>([]);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [showAddressBook, setShowAddressBook] = useState(false);

  const [multisigVault, setMultisigVault] = useState("");
  const [showMultisigPanel, setShowMultisigPanel] = useState(false);

  const [scheduledPayrolls, setScheduledPayrolls] = useState<ScheduledPayroll[]>([]);
  const [scheduleTitleInput, setScheduleTitleInput] = useState("");
  const [scheduleIntervalInput, setScheduleIntervalInput] = useState<"weekly" | "monthly">("monthly");
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);

  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [showWebhookPanel, setShowWebhookPanel] = useState(false);

  const [aiFeeMode, setAiFeeMode] = useState<"Eco" | "Balanced" | "Turbo">("Balanced");
  const [estimatedMicroLamports, setEstimatedMicroLamports] = useState<number>(1000);

  const [feeStats, setFeeStats] = useState<{
    min: number; max: number; avg: number; median: number;
    p75: number; p90: number; p95: number;
    sampleSize: number; lastUpdate: string;
  } | null>(null);

  useEffect(() => {
    if (!connection) return;
    const fetchPriorityFees = async () => {
      try {
        const fees = await connection.getRecentPrioritizationFees();
        if (!fees || fees.length === 0) { setFeeStats(null); return; }
        const currentSlot = await connection.getSlot();
        const recentFees = fees.filter((f) => f.slot > currentSlot - 150).map((f) => f.prioritizationFee || 0).sort((a, b) => a - b);
        if (recentFees.length === 0) {
          setFeeStats({ min: 0, max: 0, avg: 0, median: 0, p75: 0, p90: 0, p95: 0, sampleSize: 0, lastUpdate: new Date().toLocaleTimeString() });
          const fallback = aiFeeMode === "Eco" ? 1000 : aiFeeMode === "Balanced" ? 5000 : 25000;
          setEstimatedMicroLamports(fallback);
          return;
        }
        const sum = recentFees.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / recentFees.length);
        const min = recentFees[0];
        const max = recentFees[recentFees.length - 1];
        const median = recentFees[Math.floor(recentFees.length / 2)];
        const p75 = recentFees[Math.floor(recentFees.length * 0.75)];
        const p90 = recentFees[Math.floor(recentFees.length * 0.90)];
        const p95 = recentFees[Math.floor(recentFees.length * 0.95)];
        setFeeStats({ min, max, avg, median, p75, p90, p95, sampleSize: recentFees.length, lastUpdate: new Date().toLocaleTimeString() });
        let recommendedFee = 1000;
        if (aiFeeMode === "Eco") recommendedFee = Math.max(median, 1000);
        else if (aiFeeMode === "Balanced") recommendedFee = Math.max(p75, 5000);
        else if (aiFeeMode === "Turbo") recommendedFee = Math.max(p90, 25000);
        recommendedFee = Math.min(recommendedFee, 10_000_000);
        setEstimatedMicroLamports(recommendedFee);
      } catch (error) { setFeeStats(null); }
    };
    fetchPriorityFees();
    const interval = setInterval(fetchPriorityFees, 10000);
    return () => clearInterval(interval);
  }, [connection, aiFeeMode]);

  useEffect(() => {
    if (!connection) return;
    const checkHealth = async () => {
      const start = performance.now();
      try {
        await connection.getSlot();
        const latency = performance.now() - start;
        if (latency < 500) setNetHealth("Fast");
        else if (latency < 1500) setNetHealth("Normal");
        else setNetHealth("Congested");
      } catch (e) { setNetHealth("Congested"); }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [connection]);

  const [showAiFeePanel, setShowAiFeePanel] = useState(false);
  const [recipientRows, setRecipientRows] = useState<RecipientRow[]>([{ id: "1", address: "", amount: "" }]);
  const [inputMode, setInputMode] = useState<"rows" | "csv">("rows");

  useEffect(() => {
    if (inputMode === "rows") {
      const csvLines = recipientRows.filter((r) => r.address.trim() || r.amount.trim()).map((r) => `${r.address.trim()},${r.amount.trim()}`);
      setText("address,amount\n" + csvLines.join("\n"));
    }
  }, [recipientRows, inputMode]);

  useEffect(() => {
    const saved = localStorage.getItem("kntx_locale") as Locale;
    if (saved && translations[saved]) setLocale(saved);
    const savedHistory = localStorage.getItem("kntx_batch_history");
    if (savedHistory) { try { setHistory(JSON.parse(savedHistory)); } catch { } }
    const savedGroups = localStorage.getItem("kntx_address_groups");
    if (savedGroups) { try { setAddressGroups(JSON.parse(savedGroups)); } catch { } }
    const savedSchedules = localStorage.getItem("kntx_scheduled_payrolls");
    if (savedSchedules) { try { setScheduledPayrolls(JSON.parse(savedSchedules)); } catch { } }
    const savedTgToken = localStorage.getItem("kntx_tg_token");
    const savedTgChat = localStorage.getItem("kntx_tg_chat");
    const savedDcHook = localStorage.getItem("kntx_dc_hook");
    if (savedTgToken) setTelegramToken(savedTgToken);
    if (savedTgChat) setTelegramChatId(savedTgChat);
    if (savedDcHook) setDiscordWebhookUrl(savedDcHook);
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd").then((res) => res.json()).then((data) => { if (data?.solana?.usd) setSolPrice(data.solana.usd); }).catch(() => { });
  }, []);

  const changeLocale = (l: Locale) => { setLocale(l); localStorage.setItem("kntx_locale", l); };
  const t = translations[locale];
  useEffect(() => {
    const currentDir = (t as any)?.dir || (locale === "ar" ? "rtl" : "ltr");
    document.documentElement.dir = currentDir;
    document.documentElement.lang = locale;
  }, [locale]);

  const patch = (i: number, p: Partial<Job>) => setJobs((j) => j.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const addToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 4500);
  };
  const toUsd = (lamports: number | bigint) => {
    if (!solPrice) return "";
    const usd = (Number(lamports) / 1e9) * solPrice;
    return ` (~$${usd < 0.01 && usd > 0 ? "<0.01" : usd.toFixed(2)} USD)`;
  };
  const addRow = () => { setRecipientRows((prev) => [...prev, { id: Math.random().toString(36).substring(2, 9), address: "", amount: "" }]); };
  const updateRow = (id: string, field: "address" | "amount", value: string) => { setRecipientRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r)); };
  const removeRow = (id: string) => {
    if (recipientRows.length === 1) setRecipientRows([{ id: Math.random().toString(36).substring(2, 9), address: "", amount: "" }]);
    else setRecipientRows((prev) => prev.filter((r) => r.id !== id));
  };

  function downloadTemplate() {
    const csvContent = "address,amount\n7V3v...exampleWalletAddress1,1.5\n9xQ8...exampleWalletAddress2,0.25";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url); link.setAttribute("download", "kinetix-batch-template.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    addToast(t.successTemplate, "success");
  }
  function exportReport() {
    let csv = "TransactionIndex,Status,Signature,ExplorerLink\n";
    jobs.forEach((j, i) => { csv += `${i + 1},${j.status},${j.sig || "N/A"},${j.sig ? solscan(j.sig) : "N/A"}\n`; });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url); link.setAttribute("download", `kinetix-batch-report-${Date.now()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    addToast("Batch report exported successfully!", "success");
  }
  const saveCurrentGroup = () => {
    if (!text.trim() || recipientRows.every((r) => !r.address)) { addToast("Please add recipient data before saving.", "error"); return; }
    if (!groupNameInput.trim()) { addToast("Please enter a group name.", "error"); return; }
    const newGroup: SavedGroup = { id: Math.random().toString(36).substring(2, 9), name: groupNameInput.trim(), content: text };
    const updated = [newGroup, ...addressGroups];
    setAddressGroups(updated); localStorage.setItem("kntx_address_groups", JSON.stringify(updated));
    setGroupNameInput(""); addToast(`Group "${newGroup.name}" saved to Address Book!`, "success");
  };
  const deleteGroup = (id: string) => {
    const updated = addressGroups.filter((g) => g.id !== id);
    setAddressGroups(updated); localStorage.setItem("kntx_address_groups", JSON.stringify(updated));
    addToast("Group removed from Address Book.", "info");
  };
  const loadGroupToRows = (groupContent: string) => {
    setText(groupContent);
    const lines = groupContent.split("\n").slice(1);
    const newRows: RecipientRow[] = [];
    lines.forEach((line) => {
      const parts = line.split(",");
      if (parts.length >= 2) newRows.push({ id: Math.random().toString(36).substring(2, 9), address: parts[0].trim(), amount: parts[1].trim() });
    });
    if (newRows.length > 0) { setRecipientRows(newRows); setInputMode("rows"); }
  };
  const saveScheduledPayroll = () => {
    if (!scheduleTitleInput.trim() || !text.trim()) { addToast("Please enter a schedule title and recipient data.", "error"); return; }
    const nextDate = new Date();
    if (scheduleIntervalInput === "weekly") nextDate.setDate(nextDate.getDate() + 7);
    else nextDate.setMonth(nextDate.getMonth() + 1);
    const newSchedule: ScheduledPayroll = { id: Math.random().toString(36).substring(2, 9), title: scheduleTitleInput.trim(), interval: scheduleIntervalInput, nextRun: nextDate.toLocaleDateString(), content: text, active: true };
    const updated = [newSchedule, ...scheduledPayrolls];
    setScheduledPayrolls(updated); localStorage.setItem("kntx_scheduled_payrolls", JSON.stringify(updated));
    setScheduleTitleInput(""); addToast(`Payroll schedule "${newSchedule.title}" created successfully!`, "success");
  };
  const toggleSchedule = (id: string) => {
    const updated = scheduledPayrolls.map((s) => s.id === id ? { ...s, active: !s.active } : s);
    setScheduledPayrolls(updated); localStorage.setItem("kntx_scheduled_payrolls", JSON.stringify(updated));
    addToast("Payroll schedule status updated.", "info");
  };
  const deleteSchedule = (id: string) => {
    const updated = scheduledPayrolls.filter((s) => s.id !== id);
    setScheduledPayrolls(updated); localStorage.setItem("kntx_scheduled_payrolls", JSON.stringify(updated));
    addToast("Payroll schedule removed.", "info");
  };
  const saveWebhookSettings = () => {
    localStorage.setItem("kntx_tg_token", telegramToken);
    localStorage.setItem("kntx_tg_chat", telegramChatId);
    localStorage.setItem("kntx_dc_hook", discordWebhookUrl);
    addToast("Notification webhooks saved successfully!", "success");
    setShowWebhookPanel(false);
  };
  const sendNotifications = async (count: number, firstSig: string) => {
    const reportText = `🚀 Kinetix Batch Pay Alert!\n✅ Successfully executed batch payment.\n👥 Total Recipients: ${count}\n🔗 First Tx: ${solscan(firstSig)}`;
    if (telegramToken && telegramChatId) {
      try { await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: telegramChatId, text: reportText }) }); } catch { }
    }
    if (discordWebhookUrl) {
      try { await fetch(discordWebhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: reportText }) }); } catch { }
    }
  };
  const saveToHistory = (sigs: string[], count: number) => {
    const newItem: HistoryItem = { id: Math.random().toString(36).substring(2, 9), date: new Date().toLocaleString(), count, signatures: sigs };
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated); localStorage.setItem("kntx_batch_history", JSON.stringify(updated));
  };
  const clearHistory = () => { setHistory([]); localStorage.removeItem("kntx_batch_history"); addToast("Batch history cleared.", "info"); };

  async function preview() {
    if (!publicKey) { addToast(t.errWalletConnect, "error"); return setMsg(t.errWalletConnect); }
    setBusy(true); setMsg(""); setPlan(null); setJobs([]);
    try {
      const cfg: Fee = await (await fetch("/api/config")).json();
      if (cfg.paused) throw new Error(t.errPaused);
      if (!cfg.free && !cfg.treasury) throw new Error(t.errTreasury);
      const asset = await resolveAsset(connection, mint.trim() || undefined);
      const { ok, errors } = validate(parseInput(text), asset.decimals);
      if (errors.length) throw new Error(errors.slice(0, 8).join("\n") + (errors.length > 8 ? `\n+${errors.length - 8} more` : ""));
      if (!ok.length) throw new Error("Add at least one recipient.");

      const micro = estimatedMicroLamports;
      const b = await buildBatch(connection, publicKey, asset, ok, cfg);
      const sims = await Promise.all(b.chunks.map((c) => finalize(connection, publicKey, c, micro)));
      const network = sims.reduce((s, x) => s + 5000 + Math.ceil((x.cu * micro) / 1e6), 0);
      const solNeed = network + b.rent + (asset.mint ? 0 : Number(b.total)) + (cfg.mode === "flat" && !cfg.free ? cfg.flatLamports : 0);
      const bal = await connection.getBalance(publicKey);
      if (bal < solNeed) throw new Error(`${t.errInsufficientSol} (Need ~${sol(solNeed)}, has ${sol(bal)})`);
      
      const addresses = ok.map((r: any) => r.address ? String(r.address) : (r.to ? String(r.to) : "")).filter(Boolean);
      
      setPlan({ ...b, asset, micro, network, cfg, n: ok.length, addresses });
      setJobs(b.chunks.map(() => ({ status: "Queued" })));
      addToast(t.successBatch, "success");
    } catch (e: any) {
      const errMsg = e.message ?? String(e);
      setMsg(errMsg); addToast(errMsg, "error");
    } finally { setBusy(false); }
  }

  const handleInitiateRun = () => {
    if (!plan) return;
    if (plan.chunks.length >= 3 || plan.n >= 10) {
      setShowConfirmModal(true);
    } else {
      run(jobs.map((_, i) => i));
    }
  };

  async function run(idx: number[]) {
    setShowConfirmModal(false);
    if (!publicKey || !signAllTransactions || !plan) return;
    setBusy(true); setMsg("");
    const landed = new Set<string>();
    try {
      const todo: number[] = [];
      for (const i of idx) {
        const old = jobs[i].sig;
        const s = old ? (await connection.getSignatureStatuses([old], { searchTransactionHistory: true })).value[0] : null;
        if (s && !s.err) { patch(i, { status: "Confirmed", err: undefined }); landed.add(old!); } else todo.push(i);
      }
      const built = await Promise.all(todo.map((i) => finalize(connection, publicKey, plan.chunks[i], plan.micro)));
      const signed = await signAllTransactions(built.map((b) => b.tx));
      await Promise.all(signed.map((tx, k) =>
        send(connection, tx, built[k].lastValid, (status, sig, err) => {
          patch(todo[k], { status, sig, err });
          if (status === "Confirmed" || status === "Finalized") { landed.add(sig); addToast(`Transaction #${todo[k] + 1} ${status.toLowerCase()}!`, "success"); }
        }).catch((e) => { patch(todo[k], { status: "Failed", err: String(e.message ?? e) }); addToast(`Transaction #${todo[k] + 1} failed.`, "error"); })
      ));
    } catch (e: any) { const errMsg = e.message ?? String(e); setMsg(errMsg); addToast(errMsg, "error"); }
    finally {
      setBusy(false);
      if (landed.size) {
        const sigsArr = [...landed];
        fetch("/api/record", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wallet: publicKey.toBase58(), signatures: sigsArr }) }).catch(() => { });
        saveToHistory(sigsArr, plan.n); sendNotifications(plan.n, sigsArr[0]);
      }
    }
  }

  const failed = jobs.flatMap((j, i) => (j.status === "Failed" ? [i] : []));
  const feeLabel = !plan ? "" : plan.cfg.free ? "Free (promo)" : plan.cfg.mode === "flat" ? `${sol(plan.cfg.flatLamports)} SOL${toUsd(plan.cfg.flatLamports)}` : `${Math.min(plan.cfg.bps, 500) / 100}%`;
  const completedCount = jobs.filter((j) => j.status === "Confirmed" || j.status === "Finalized").length;
  const progressPercent = jobs.length > 0 ? Math.round((completedCount / jobs.length) * 100) : 0;

  return (
    <div dir={t.dir} className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-purple-500 selection:text-white relative">
      <ToastContainer toasts={toasts} dir={t.dir} />
      <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={() => run(jobs.map((_, i) => i))} plan={plan} sol={sol} />
      <div className="max-w-7xl mx-auto space-y-8">
        <Header t={t} netHealth={netHealth} solPrice={solPrice} locale={locale} changeLocale={changeLocale} aiFeeMode={aiFeeMode} setAiFeeMode={setAiFeeMode} estimatedMicroLamports={estimatedMicroLamports} feeStats={feeStats} />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <BatchInputSection
            t={t} mint={mint} setMint={setMint}
            inputMode={inputMode} setInputMode={setInputMode}
            recipientRows={recipientRows} updateRow={updateRow} removeRow={removeRow} addRow={addRow}
            text={text} setText={setText}
            busy={busy} plan={plan} msg={msg}
            preview={preview} downloadTemplate={downloadTemplate} loadGroupToRows={loadGroupToRows} addToast={addToast}
            solPrice={solPrice}
            setShowAiFeePanel={setShowAiFeePanel} setShowWebhookPanel={setShowWebhookPanel} setShowSchedulePanel={setShowSchedulePanel} setShowMultisigPanel={setShowMultisigPanel} setShowAddressBook={setShowAddressBook}
          >
            <AiFeePanel isOpen={showAiFeePanel} onClose={() => setShowAiFeePanel(false)} aiFeeMode={aiFeeMode} setAiFeeMode={setAiFeeMode} addToast={addToast} estimatedMicroLamports={estimatedMicroLamports} feeStats={feeStats} solPrice={solPrice} t={t} />
            <WebhookPanel isOpen={showWebhookPanel} telegramToken={telegramToken} setTelegramToken={setTelegramToken} telegramChatId={telegramChatId} setTelegramChatId={setTelegramChatId} discordWebhookUrl={discordWebhookUrl} setDiscordWebhookUrl={setDiscordWebhookUrl} saveWebhookSettings={saveWebhookSettings} />
            <SchedulePanel 
  isOpen={showSchedulePanel} 
  scheduleTitleInput={scheduleTitleInput} 
  setScheduleTitleInput={setScheduleTitleInput} 
  scheduleIntervalInput={scheduleIntervalInput} 
  setScheduleIntervalInput={setScheduleIntervalInput} 
  saveScheduledPayroll={saveScheduledPayroll} 
  scheduledPayrolls={scheduledPayrolls} 
  toggleSchedule={toggleSchedule} 
  deleteSchedule={deleteSchedule} 
/>
            <MultiSigPanel isOpen={showMultisigPanel} multisigVault={multisigVault} setMultisigVault={setMultisigVault} addToast={addToast} setShowMultisigPanel={setShowMultisigPanel} />
            <AddressBookModal isOpen={showAddressBook} groupNameInput={groupNameInput} setGroupNameInput={setGroupNameInput} saveCurrentGroup={saveCurrentGroup} addressGroups={addressGroups} loadGroupToRows={loadGroupToRows} deleteGroup={deleteGroup} addToast={addToast} setShowAddressBook={setShowAddressBook} />
          </BatchInputSection>
          <SummaryDashboard t={t} plan={plan} feeLabel={feeLabel} sol={sol} tousd={tousd} jobs={jobs} tone={tone} solscan={solscan} />
        </div>
        {history.length > 0 && (
          <section className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2"><span>📂 Recent Batch History (Local)</span></h2>
              <button onClick={clearHistory} className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline transition-colors">Clear History</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400"><span>{item.date}</span><span className="font-bold text-purple-300">{item.count} Recipients</span></div>
                  <div className="text-slate-500 font-mono truncate">{item.signatures.length} TX Signatures saved</div>
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    {item.signatures[0] && (<a href={solscan(item.signatures[0])} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-semibold">View First Tx ↗</a>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}