"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl"; // ملاحظة: لا نستخدم next-intl، بل i18n.ts

// سنستخدم t من خلال prop أو من i18n مباشرة
export default function DocsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Kinetix Documentation
            </h1>
            <p className="text-xs text-slate-400 mt-1">Everything you need to know</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold hover:bg-slate-700 transition-all"
          >
            ← Back to App
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {/* Section 1: What is Kinetix? */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">What is Kinetix Batch Pay?</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Kinetix is a decentralized, non-custodial platform for sending bulk payments on Solana.
              Whether you are paying salaries, airdropping tokens, or distributing profits, Kinetix
              allows you to send to hundreds of recipients in a single, efficient batch.
            </p>
          </section>

          {/* Section 2: Non-Custodial */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">🔒 Non-Custodial by Design</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Kinetix never holds your funds. We do not have access to your private keys.
              You sign every transaction directly from your wallet (Phantom, Solflare, etc.).
              Your funds remain in your control at all times.
            </p>
          </section>

          {/* Section 3: Fees */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">💰 Transparent Fees</h2>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
              <li><strong>Platform Fee:</strong> 0% during launch (Free Mode).</li>
              <li><strong>Network Fee:</strong> ~0.000005 SOL per transaction (paid to Solana validators).</li>
              <li><strong>Priority Fee:</strong> Optional (Eco/Balanced/Turbo) to speed up transactions during congestion.</li>
            </ul>
          </section>

          {/* Section 4: Priority Fees */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">⚡ Priority Fees Explained</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Priority fees are optional tips paid to validators to prioritize your transaction.
              Kinetix fetches real-time data from the Solana network and offers three modes:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 mt-2 space-y-1">
              <li><strong>Eco:</strong> Lowest cost (P50).</li>
              <li><strong>Balanced:</strong> Recommended (P75).</li>
              <li><strong>Turbo:</strong> Fastest (P90).</li>
            </ul>
          </section>

          {/* Section 5: FAQ */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">❓ Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-cyan-400">How do I connect my wallet?</h3>
                <p className="text-sm text-slate-400">Click "Select Wallet" in the top right corner and choose Phantom, Solflare, or any Wallet Standard compatible wallet.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-cyan-400">What is the maximum batch size?</h3>
                <p className="text-sm text-slate-400">Solana transactions have a size limit (~1232 bytes). Kinetix automatically splits your batch into multiple transactions if needed.</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-cyan-400">Do you store my data?</h3>
                <p className="text-sm text-slate-400">Your address book and history are stored locally in your browser (localStorage). We do not store any personal data on our servers.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Contact */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <h2 className="text-xl font-bold text-white mb-3">📞 Need Help?</h2>
            <p className="text-sm text-slate-300">Join our Telegram community for support and updates.</p>
            <div className="flex justify-center gap-4 mt-4">
              <a 
                href="https://t.me/+TbozRkWWmfE4YTEy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-6 py-2 rounded-xl bg-[#229ED9] text-sm font-bold text-white hover:bg-[#1a8bc4] transition-all"
              >
                Telegram
              </a>
              <a 
                href="https://x.com/KinetixKNTX" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-6 py-2 rounded-xl bg-slate-800 text-sm font-bold text-white hover:bg-slate-700 transition-all"
              >
                X (Twitter)
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}