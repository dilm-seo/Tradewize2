import React from 'react';
import { Settings as SettingsIcon, DollarSign, Clock, Database } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Settings() {
  const { settings, updateSettings } = useSettings();

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ apiKey: e.target.value });
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ refreshInterval: parseInt(e.target.value, 10) });
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ demoMode: e.target.checked });
  };

  const handleDailyLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ dailyLimit: parseFloat(e.target.value) });
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Paramètres</h2>
        <SettingsIcon className="h-6 w-6 text-blue-400" />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Clé API OpenAI
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="password"
              value={settings.apiKey}
              onChange={handleApiKeyChange}
              placeholder="sk-..."
              className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Intervalle de rafraîchissement
          </label>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <select
              value={settings.refreshInterval}
              onChange={handleIntervalChange}
              className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
            >
              <option value="30">30 secondes</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
              <option value="900">15 minutes</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Limite de dépense journalière
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={settings.dailyLimit}
              onChange={handleDailyLimitChange}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-sm font-medium w-16 text-right">
              {settings.dailyLimit.toFixed(1)} €
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>1€</span>
            <span>20€</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-400">Dépense aujourd'hui:</span>
            <span className={`font-medium ${settings.apiCosts > settings.dailyLimit ? 'text-red-400' : 'text-emerald-400'}`}>
              {settings.apiCosts.toFixed(2)} € / {settings.dailyLimit.toFixed(2)} €
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-400" />
            <span className="text-sm">Mode démo</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.demoMode}
              onChange={handleModeChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <span className="text-sm">Coût API OpenAI</span>
          </div>
          <span className="text-lg font-medium">{settings.apiCosts.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
}