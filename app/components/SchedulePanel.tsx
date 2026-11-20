import React from "react";

interface SchedulePanelProps {
  isOpen: boolean;
  scheduleTitleInput: string;
  setScheduleTitleInput: (val: string) => void;
  scheduleIntervalInput: "weekly" | "monthly";
  setScheduleIntervalInput: (val: "weekly" | "monthly") => void;
  saveScheduledPayroll: () => void;
}

export default function SchedulePanel({
  isOpen,
  scheduleTitleInput,
  setScheduleTitleInput,
  scheduleIntervalInput,
  setScheduleIntervalInput,
  saveScheduledPayroll
}: SchedulePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 space-y-3 animate-fadeIn shadow-lg shadow-cyan-500/10">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">Scheduled & Recurring Payrolls</h3>
        <span className="text-[10px] text-slate-400">Automated Enterprise Cycles</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Schedule Title (e.g. Monthly Dev Salaries)"
          value={scheduleTitleInput}
          onChange={(e) => setScheduleTitleInput(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
        />
        <div className="flex gap-2">
          <select
            value={scheduleIntervalInput}
            onChange={(e) => setScheduleIntervalInput(e.target.value as "weekly" | "monthly")}
            className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
          <button
            onClick={saveScheduledPayroll}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs transition-all shadow-md"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}