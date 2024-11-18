import React, { useState } from 'react';
import { TrendingUp, Settings as SettingsIcon, Brain, Loader2 } from 'lucide-react';
import NewsFeed from './NewsFeed';
import MarketOverview from './MarketOverview';
import TradingSignals from './TradingSignals';
import FundamentalAnalysis from './FundamentalAnalysis';
import AIInsights from './AIInsights';
import Settings from './Settings';
import WorldMap from './WorldMap';
import EconomicCalendar from './EconomicCalendar';
import { useSettings } from '../context/SettingsContext';
import { useOpenAI } from '../services/openai';
import { useNews } from '../hooks/useNews';
import { useMarketData } from '../hooks/useMarketData';
import { useQuery } from 'react-query';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('markets');
  const { settings } = useSettings();
  const { analyzeMarket } = useOpenAI();
  const { data: news } = useNews();
  const { data: marketData } = useMarketData();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [globalAnalysis, setGlobalAnalysis] = useState<string | null>(null);

  const handleGlobalAnalysis = async () => {
    if (!settings.apiKey || isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      // Collecter toutes les données pertinentes
      const newsContext = (news || [])
        .slice(0, 5)
        .map(item => `- ${item.title}`)
        .join('\n');

      const marketContext = (marketData || [])
        .map(data => `${data.symbol}: ${data.price} (${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`)
        .join('\n');

      const prompt = `En tant qu'expert en trading avec plus de 20 ans d'expérience, analysez les données suivantes et fournissez une recommandation de trading claire et détaillée.

DONNÉES DE MARCHÉ ACTUELLES:
${marketContext}

ACTUALITÉS RÉCENTES:
${newsContext}

Votre analyse doit :

1. Évaluer le sentiment global du marché
2. Identifier les corrélations entre les paires de devises
3. Détecter les divergences significatives
4. Analyser l'impact des actualités sur les mouvements de prix
5. Fournir des recommandations de trading concrètes

Pour chaque recommandation :
- Indiquer la paire de devises
- Spécifier la direction (achat/vente)
- Justifier la recommandation
- Évaluer le ratio risque/rendement
- Identifier les principaux risques

Format de réponse souhaité :
<div class="space-y-4">
  <div class="mb-4">
    <h3 class="text-lg font-semibold text-blue-400 mb-2">Sentiment Global</h3>
    [Analyse du sentiment]
  </div>

  <div class="mb-4">
    <h4 class="font-medium text-blue-400 mb-2">Opportunités Principales</h4>
    [Liste des meilleures opportunités]
  </div>

  <div>
    <h4 class="font-medium text-blue-400 mb-2">Risques à Surveiller</h4>
    [Liste des risques principaux]
  </div>
</div>`;

      const analysis = await analyzeMarket(prompt);
      setGlobalAnalysis(analysis);
    } catch (error) {
      console.error('Erreur lors de l\'analyse globale:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
          <>
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

            {/* Bouton d'analyse globale */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleGlobalAnalysis}
                disabled={isAnalyzing || !settings.apiKey}
                className="group flex items-center space-x-3 px-8 py-4 
                         bg-gradient-to-r from-blue-500 to-cyan-500 
                         hover:from-blue-600 hover:to-cyan-600
                         text-white rounded-xl
                         transform transition-all duration-300
                         hover:scale-105 hover:shadow-xl
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Brain className="h-5 w-5 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-lg font-medium">
                  {isAnalyzing ? 'Analyse en cours...' : 'Analyser toutes les données'}
                </span>
              </button>
            </div>

            {/* Résultat de l'analyse globale */}
            {globalAnalysis && (
              <div className="mt-8 max-w-4xl mx-auto">
                <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-semibold">Analyse Globale du Marché</h2>
                  </div>
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: globalAnalysis }}
                  />
                </div>
              </div>
            )}
          </>
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

      <style jsx global>{`
        [class*="rounded-xl"] {
          @apply bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 
                 backdrop-blur-sm border border-blue-500/20 
                 shadow-[0_0_25px_rgba(59,130,246,0.1)]
                 hover:shadow-[0_0_35px_rgba(59,130,246,0.15)]
                 transition-all duration-300;
        }

        [class*="rounded-xl"] h2,
        [class*="rounded-xl"] h3,
        [class*="rounded-xl"] .card-title {
          @apply text-white font-semibold;
        }

        [class*="rounded-lg"]:not([class*="rounded-xl"]) {
          @apply bg-gradient-to-br from-gray-800/50 to-gray-900/50
                 border border-blue-500/10
                 hover:border-blue-500/20
                 transition-all duration-300;
        }

        button:not([class*="hover\\:bg-"]):not([disabled]) {
          @apply hover:bg-blue-600 transition-colors duration-300;
        }

        .text-emerald-400 {
          @apply text-blue-400;
        }

        .text-emerald-500 {
          @apply text-blue-500;
        }

        p, span, div:not([class*="bg-"]) {
          @apply text-gray-200;
        }

        [class*="rounded-full"] {
          @apply bg-gradient-to-r from-blue-500/10 to-cyan-500/10 
                 border border-blue-500/20
                 shadow-[0_0_15px_rgba(59,130,246,0.2)]
                 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)];
        }

        input, select, textarea {
          @apply bg-gray-900/50 border border-blue-500/20 
                 focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                 text-white;
        }

        hr, [class*="border-t"] {
          @apply border-blue-500/20;
        }

        [class*="hover\\:bg-gray-700"] {
          @apply hover:bg-blue-900/30;
        }

        [class*="active\\:"] {
          @apply active:bg-blue-500/20;
        }

        a:not([class]) {
          @apply text-blue-400 hover:text-blue-300 transition-colors duration-300;
        }

        li {
          @apply text-gray-200;
        }

        [class*="animate-pulse"] {
          @apply from-blue-400/10 to-transparent;
        }

        th {
          @apply text-gray-300 font-semibold;
        }

        td {
          @apply text-gray-200;
        }

        code {
          @apply bg-gray-800/50 text-blue-300 px-1 rounded;
        }

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