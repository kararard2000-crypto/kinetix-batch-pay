import React from "react";

interface SummaryDashboardProps {
  t: any;
  plan: any;
  feeLabel: string;
  sol: (val: number | bigint) => string;
  tousd: (val: number | bigint) => string;
  jobs: any[];
  tone: Record<string, string>;
  solscan: (sig: string) => string;
}

export default function SummaryDashboard({ t, plan, feeLabel, sol, tousd, jobs, tone, solscan }: SummaryDashboardProps) {
  return (
    <section className="md:col-span-2 p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-900/10">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>{t.summaryTitle}</span>
          <span className="text-xs font-normal text-slate-400">{t.liveSim}</span>
        </h2>

        {!plan ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">Review a batch to see details before signing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <dt className="text-slate-400">{t.recipients}</dt>
                <dd className="font-semibold text-slate-200 text-right">{plan.n}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <dt className="text-slate-400">{t.transactions}</dt>
                <dd className="font-semibold text-slate-200 text-right">{plan.chunks.length}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <dt className="text-slate-400">{t.platformFee}</dt>
                <dd className="font-semibold text-slate-200 text-right">{feeLabel}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <dt className="text-slate-400">{t.networkFees}</dt>
                <dd className="font-semibold text-slate-200 text-right">{`${sol(plan.network)} SOL (${tousd(plan.network)})`}</dd>
              </div>
            </dl>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              {jobs.map((j, i) => (
                <li key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">Tx #{i + 1}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${tone[j.status] || "text-slate-400"}`}>
                      {j.status}
                    </span>
                  </div>
                  {j.err && <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 font-mono break-all">{j.err}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-xs">
                    <span className="text-slate-500">Explorer</span>
                    {j.sig ? (
                      <a className="text-cyan-400 hover:underline font-semibold flex items-center gap-1" target="_blank" rel="noopener noreferrer" href={solscan(j.sig)}>
                        Solscan ↗
                      </a>
                    ) : (
                      <span className="text-slate-600 italic">Pending...</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}