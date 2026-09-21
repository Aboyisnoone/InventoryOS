"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { UPDATE_TELEGRAM_CONFIG } from "@/graphql/operations";
import { Save, Bell, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [updateTelegramConfig, { loading }] = useMutation(UPDATE_TELEGRAM_CONFIG);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSaved(false);

    try {
      const { data } = await updateTelegramConfig({
        variables: { botToken, chatId }
      });
      if (data?.updateTelegramConfig) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg("Failed to update config");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your business preferences and integrations.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 bg-zinc-50 flex items-center space-x-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">Telegram Notifications</h3>
            <p className="text-sm text-zinc-500">Receive instant alerts when stock runs low.</p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6 max-w-lg">
            {errorMsg && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}
            
            {saved && (
              <div className="p-4 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2" />
                Settings saved successfully!
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Telegram Bot Token
              </label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz..."
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono text-sm"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Create a bot via @BotFather on Telegram to get your token.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Chat ID
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="-1001234567890 or 12345678"
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono text-sm"
              />
              <p className="mt-2 text-xs text-zinc-500">
                The group or personal Chat ID where the bot should send alerts.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !botToken || !chatId}
              className="flex items-center justify-center w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
