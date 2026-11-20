import React from "react";

interface WebhookPanelProps {
  isOpen: boolean;
  telegramToken: string;
  setTelegramToken: (val: string) => void;
  telegramChatId: string;
  setTelegramChatId: (val: string) => void;
  discordWebhookUrl: string;
  setDiscordWebhookUrl: (val: string) => void;
  saveWebhookSettings: () => void;
}

export default function WebhookPanel({
  isOpen,
  telegramToken,
  setTelegramToken,
  telegramChatId,
  setTelegramChatId,
  discordWebhookUrl,
  setDiscordWebhookUrl,
  saveWebhookSettings
}: WebhookPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="p-4 rounded-2xl bg-slate-950/90 border border-pink-500/40 space-y-3 animate-fadeIn shadow-lg shadow-pink-500/10">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-pink-300 uppercase tracking-wider">Telegram & Discord Alerts</h3>
        <span className="text-[10px] text-slate-400">Automated Bot Reports</span>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Telegram Bot Token"
          value={telegramToken}
          onChange={(e) => setTelegramToken(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-pink-500"
        />
        <input
          type="text"
          placeholder="Telegram Chat ID"
          value={telegramChatId}
          onChange={(e) => setTelegramChatId(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-pink-500"
        />
        <input
          type="text"
          placeholder="Discord Webhook URL"
          value={discordWebhookUrl}
          onChange={(e) => setDiscordWebhookUrl(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-pink-500"
        />
        <button
          onClick={saveWebhookSettings}
          className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-all"
        >
          Save Webhook Settings
        </button>
      </div>
    </div>
  );
}