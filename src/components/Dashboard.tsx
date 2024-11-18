import React, { useState } from 'react';
import { TrendingUp, BarChart2, BookOpen, Bell, Brain, Settings as SettingsIcon } from 'lucide-react';
import NewsFeed from './NewsFeed';
import MarketOverview from './MarketOverview';
import TradingSignals from './TradingSignals';
import FundamentalAnalysis from './FundamentalAnalysis';
import AIInsights from './AIInsights';
import Settings from './Settings';
import WorldMap from './WorldMap';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('markets');

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return (
          <div className="max-w-3xl mx-auto">
            <Settings />
          </div>
        );
      case 'markets':
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <MarketOverview />
              <WorldMap />
              <TradingSignals />
              <FundamentalAnalysis />
            </div>
            <div className="space-y-8">
              <NewsFeed />
              <AIInsights />
            </div>
          </div>
        );
    }
  };

  const getTabClass = (tabName: string) => `
    flex items-center space-x-2 px-4 py-2 rounded-lg transition
    ${activeTab === tabName 
      ? 'text-emerald-400 bg-emerald-400/10' 
      : 'text-gray-400 hover:text-emerald-400 hover:bg-gray-700/30'}
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
              <h1 className="text-2xl font-bold">TradeWise</h1>
            </div>
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('markets')}
                className={getTabClass('markets')}
              >
                <BarChart2 className="h-5 w-5" />
                <span className="hidden md:inline">Marchés</span>
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={getTabClass('education')}
              >
                <BookOpen className="h-5 w-5" />
                <span className="hidden md:inline">Formation</span>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={getTabClass('alerts')}
              >
                <Bell className="h-5 w-5" />
                <span className="hidden md:inline">Alertes</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={getTabClass('ai')}
              >
                <Brain className="h-5 w-5" />
                <span className="hidden md:inline">IA Insights</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={getTabClass('settings')}
              >
                <SettingsIcon className="h-5 w-5" />
                <span className="hidden md:inline">Paramètres</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}