import React, { useState } from 'react';
import { X, Brain, Loader2 } from 'lucide-react';
import { useOpenAI } from '../services/openai';
import { useNews } from '../hooks/useNews';
import { useMarketData } from '../hooks/useMarketData';
import { useSettings } from '../context/SettingsContext';

export default function TradingMascot() {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { analyzeMarket } = useOpenAI();
  const { data: news } = useNews();
  const { data: marketData } = useMarketData();
  const { settings } = useSettings();

  const handleAnalysis = async () => {
    if (!settings.apiKey || isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      const newsContext = (news || [])
        .slice(0, 5)
        .map(item => `- ${item.title}`)
        .join('\n');

      const marketContext = (marketData || [])
        .map(data => `${data.symbol}: ${data.price} (${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`)
        .join('\n');

      const result = await analyzeMarket(`
Données de marché actuelles:
${marketContext}

Actualités récentes:
${newsContext}

En tant qu'expert en trading avec plus de 20 ans d'expérience, analysez ces données et identifiez la meilleure opportunité de trading. Votre analyse doit :

1. Évaluer le contexte macro-économique global
2. Identifier la paire de devises la plus prometteuse
3. Analyser les facteurs techniques et fondamentaux
4. Fournir une recommandation claire avec :
   - Points d'entrée
   - Stop loss
   - Objectifs
   - Horizon temporel
   - Justification détaillée

Format de réponse souhaité :
<div class="space-y-4">
  <div class="mb-4">
    <h3 class="text-lg font-semibold text-blue-400 mb-2">Opportunité de Trading</h3>
    [Paire et contexte]
  </div>

  <div class="mb-4">
    <h4 class="font-medium text-emerald-400 mb-2">Analyse</h4>
    [Analyse détaillée]
  </div>

  <div class="mb-4">
    <h4 class="font-medium text-emerald-400 mb-2">Niveaux</h4>
    <ul class="list-disc list-inside space-y-1">
      <li>Entrée : [niveau]</li>
      <li>Stop Loss : [niveau]</li>
      <li>Objectif 1 : [niveau]</li>
      <li>Objectif 2 : [niveau]</li>
    </ul>
  </div>

  <div>
    <h4 class="font-medium text-emerald-400 mb-2">Gestion</h4>
    [Détails sur la gestion et le timing]
  </div>
</div>`);

      setAnalysis(result);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      {/* Mascotte */}
      <button
        onClick={() => {
          setIsOpen(true);
          if (!analysis) handleAnalysis();
        }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 
                   rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
                   hover:scale-110 z-50 flex items-center justify-center
                   border-4 border-white dark:border-gray-800
                   animate-bounce"
      >
        <img
          src="https://em-content.zobj.net/source/microsoft-teams/337/robot_1f916.png"
          alt="Trading Assistant"
          className="w-10 h-10"
        />
      </button>

      {/* Modal d'analyse */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4 p-6 
                        bg-gray-800/90 rounded-xl border border-gray-700 shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-700/50 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <img
                src="https://em-content.zobj.net/source/microsoft-teams/337/robot_1f916.png"
                alt="Trading Assistant"
                className="w-8 h-8"
              />
              <h2 className="text-xl font-semibold">Assistant Trading</h2>
            </div>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <p className="text-gray-400">Analyse en cours...</p>
              </div>
            ) : analysis ? (
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: analysis }}
              />
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                <p>Cliquez sur la mascotte pour lancer l'analyse</p>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={handleAnalysis}
                disabled={isAnalyzing || !settings.apiKey}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white 
                         rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Actualiser l'analyse</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}