import React, { useState } from 'react';
import { TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import NewsFeed from './NewsFeed';
import MarketOverview from './MarketOverview';
import TradingSignals from './TradingSignals';
import FundamentalAnalysis from './FundamentalAnalysis';
import AIInsights from './AIInsights';
import Settings from './Settings';
import WorldMap from './WorldMap';
import EconomicCalendar from './EconomicCalendar';
import { useSettings } from '../context/SettingsContext';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('markets');
  const { settings } = useSettings();

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
              <WorldMap />
              <MarketOverview />
              <TradingSignals />
              <FundamentalAnalysis />
            </div>
            <div className="space-y-8">
              <NewsFeed />
              <EconomicCalendar />
              <AIInsights />
            </div>
          </div>
        );
    }
  };

  const getTabClass = (tabName: string) => `
    flex items-center space-x-2 px-4 py-2 rounded-lg transition
    ${activeTab === tabName 
      ? 'text-blue-400 bg-blue-400/10' 
      : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30'}
  `;

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark' : 'light'}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
        <header className="border-b border-blue-500/20 bg-gradient-to-r from-gray-900/50 via-blue-900/30 to-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  TradeWise
                </h1>
              </div>
              <button
                onClick={() => setActiveTab(activeTab === 'settings' ? 'markets' : 'settings')}
                className={getTabClass('settings')}
              >
                <SettingsIcon className="h-5 w-5" />
                <span className="hidden md:inline">Paramètres</span>
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {renderContent()}
        </main>
      </div>

        {/* Global styles for all cards */}
        <style jsx global>{`
          /* Base card style */
          [class*="rounded-xl"] {
            @apply bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 
                   backdrop-blur-sm border border-blue-500/20 
                   shadow-[0_0_25px_rgba(59,130,246,0.1)]
                   hover:shadow-[0_0_35px_rgba(59,130,246,0.15)]
                   transition-all duration-300;
          }

          /* Card headers */
          [class*="rounded-xl"] h2,
          [class*="rounded-xl"] h3,
          [class*="rounded-xl"] .card-title {
            @apply text-white font-semibold;
          }

          /* Inner content areas */
          [class*="rounded-lg"]:not([class*="rounded-xl"]) {
            @apply bg-gradient-to-br from-gray-800/50 to-gray-900/50
                   border border-blue-500/10
                   hover:border-blue-500/20
                   transition-all duration-300;
          }

          /* Primary buttons */
          button:not([class*="hover\\:bg-"]):not([disabled]) {
            @apply hover:bg-blue-600 transition-colors duration-300;
          }

          /* Text colors */
          .text-emerald-400 {
            @apply text-blue-400;
          }

          .text-emerald-500 {
            @apply text-blue-500;
          }

          /* Content text */
          p, span, div:not([class*="bg-"]) {
            @apply text-gray-200;
          }

          /* Badges and tags */
          [class*="rounded-full"] {
            @apply bg-gradient-to-r from-blue-500/10 to-cyan-500/10 
                   border border-blue-500/20
                   shadow-[0_0_15px_rgba(59,130,246,0.2)]
                   hover:shadow-[0_0_20px_rgba(59,130,246,0.3)];
          }

          /* Inputs */
          input, select, textarea {
            @apply bg-gray-900/50 border border-blue-500/20 
                   focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                   text-white;
          }

          /* Dividers */
          hr, [class*="border-t"] {
            @apply border-blue-500/20;
          }

          /* Hover effects */
          [class*="hover\\:bg-gray-700"] {
            @apply hover:bg-blue-900/30;
          }

          /* Active states */
          [class*="active\\:"] {
            @apply active:bg-blue-500/20;
          }

          /* Links */
          a:not([class]) {
            @apply text-blue-400 hover:text-blue-300 transition-colors duration-300;
          }

          /* List items */
          li {
            @apply text-gray-200;
          }

          /* Animations */
          [class*="animate-pulse"] {
            @apply from-blue-400/10 to-transparent;
          }

          /* Tables */
          th {
            @apply text-gray-300 font-semibold;
          }

          td {
            @apply text-gray-200;
          }

          /* Code blocks */
          code {
            @apply bg-gray-800/50 text-blue-300 px-1 rounded;
          }

          /* Scrollbar */
          ::-webkit-scrollbar {
            @apply w-2;
          }

          ::-webkit-scrollbar-track {
            @apply bg-gray-900/50;
          }

          ::-webkit-scrollbar-thumb {
            @apply bg-blue-500/50 rounded-full hover:bg-blue-500/70;
          }
        `}</style>
    </div>
  );
}