"use client";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

export default function AboutPage() {
  const router = useRouter();
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              About Kinetix
            </h1>
            <p className="text-xs text-slate-400 mt-1">Our Mission & Vision</p>
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
          
          {/* Section 1: Who We Are */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">Who We Are</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Kinetix is a decentralized, non-custodial platform built on Solana. We are a team of
              developers and crypto enthusiasts who believe that sending bulk payments should be
              fast, cheap, and secure. Whether you are a small business paying salaries, a project
              distributing tokens, or an individual sending funds to friends, Kinetix is designed
              to make your life easier.
            </p>
          </section>

          {/* Section 2: Our Vision */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">🚀 Our Vision</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We envision a world where sending money is as easy as sending an email. Solana's
              high-speed, low-cost blockchain makes this possible. Kinetix is our contribution to
              this vision: a tool that empowers anyone to send payments to hundreds of recipients
              in seconds, without intermediaries, and without losing control of their funds.
            </p>
          </section>

          {/* Section 3: Why Kinetix */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">💡 Why Kinetix?</h2>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
              <li><strong>Non-Custodial:</strong> We never hold your funds. You sign every transaction.</li>
              <li><strong>Transparent:</strong> 0% platform fees during launch, with real-time network fees.</li>
              <li><strong>Fast:</strong> Powered by Solana's high-performance blockchain.</li>
              <li><strong>Multi-Language:</strong> Supports 9 languages, including Arabic.</li>
              <li><strong>Open Source:</strong> Our code is public and auditable.</li>
            </ul>
          </section>

          {/* Section 4: Contact */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <h2 className="text-xl font-bold text-white mb-3">📞 Get in Touch</h2>
            <p className="text-sm text-slate-300">Join our community for support and updates.</p>
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