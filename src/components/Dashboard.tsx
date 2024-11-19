import React from 'react';
import { Cog, LayoutDashboard } from 'lucide-react';
import MarketOverview from './MarketOverview';
import NewsFeed from './NewsFeed';
import Settings from './Settings';
import WorldMap from './WorldMap';
import TradingSignals from './TradingSignals';
import FundamentalAnalysis from './FundamentalAnalysis';
import AIInsights from './AIInsights';
import EconomicCalendar from './EconomicCalendar';
import PromptManager from './PromptManager';
import TradingMascot from './TradingMascot';
import { useSettings } from '../context/SettingsContext';

export default function Dashboard() {
  const [showSettings, setShowSettings] = React.useState(false);
  const [showPrompts, setShowPrompts] = React.useState(false);
  const { settings } = useSettings();

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors ${
      settings.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LayoutDashboard className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold">TradeWise</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-700/70 transition"
            >
              Prompts
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition"
            >
              <Cog className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Settings or Prompts Panel */}
        {showSettings && <Settings />}
        {showPrompts && <PromptManager />}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Première colonne */}
          <div className="space-y-6">
            <WorldMap />
            <TradingSignals />
            <AIInsights />
          </div>

          {/* Deuxième colonne */}
          <div className="space-y-6">
            <MarketOverview />
            <FundamentalAnalysis />
          </div>

          {/* Troisième colonne */}
          <div className="space-y-6">
            <EconomicCalendar />
            <NewsFeed />
          </div>
        </div>

        {/* Mascotte */}
        <TradingMascot />
      </div>
    </div>
  );
}