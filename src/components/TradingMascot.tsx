import React, { useState, useEffect } from 'react';
import { Brain, X, MessageSquare, TrendingUp, TrendingDown, Sparkles, ChevronUp } from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData';
import { useNews } from '../hooks/useNews';
import { useOpenAI } from '../services/openai';
import { useSettings } from '../context/SettingsContext';

export default function TradingMascot() {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { data: marketData } = useMarketData();
  const { data: news } = useNews();
  const { analyzeMarket } = useOpenAI();
  const { settings } = useSettings();

  const generateAnalysis = async () => {
    if (!settings.apiKey || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const marketContext = marketData
        ?.map(data => 
          `${data.symbol}: ${data.price} (${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`
        )
        .join('\n');

      const newsContext = news
        ?.slice(0, 3)
        .map(item => `- ${item.title}`)
        .join('\n');

      const result = await analyzeMarket(settings.prompts.mascot);
      setAnalysis(result);
    } catch (error) {
      console.error('Erreur d\'analyse:', error);
      setAnalysis("Désolé, je ne peux pas générer d'analyse pour le moment. Réessayez plus tard.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isOpen && !isAnalyzing && settings.apiKey) {
        generateAnalysis();
      }
    }, settings.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isOpen, isAnalyzing, settings.apiKey, settings.refreshInterval]);

  return (
    <>
      {/* Mascotte */}
      <button
        onClick={() => {
          setIsOpen(true);
          if (!analysis && !isAnalyzing && settings.apiKey) {
            generateAnalysis();
          }
        }}
        className={`
          fixed bottom-4 right-4 z-50
          group relative
          w-16 h-16 rounded-full
          bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700
          flex items-center justify-center
          shadow-lg shadow-blue-500/20
          hover:shadow-xl hover:shadow-blue-500/40
          hover:scale-110
          transition-all duration-500
          ${isAnalyzing ? 'animate-pulse' : ''}
        `}
        style={{
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #2563EB)'
        }}
      >
        {/* Anneaux lumineux animés */}
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* Effet de halo */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
        
        {isAnalyzing ? (
          <div className="relative">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-ping opacity-20" />
          </div>
        ) : (
          <Brain 
            className="w-8 h-8 text-white transform group-hover:scale-110 transition-transform duration-500"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
            }}
          />
        )}
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop avec effet de flou */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl transform transition-all">
            {/* Effet de halo derrière le modal */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20 blur-xl" />

            <div className="relative bg-gradient-to-br from-gray-900/95 via-blue-900/95 to-gray-900/95 rounded-xl p-6 shadow-2xl backdrop-blur-lg border border-blue-500/20">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Brain className="w-6 h-6 text-blue-400" />
                    <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-20 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      TradeWise Assistant
                    </h3>
                    <p className="text-sm text-gray-400">
                      Analyse en temps réel
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition p-1 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {!settings.apiKey ? (
                  <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-4 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>Configurez votre clé API OpenAI dans les paramètres pour recevoir des analyses.</p>
                  </div>
                ) : isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center space-y-4 p-8">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      <div className="absolute inset-0 w-12 h-12 border-4 border-blue-400/20 rounded-full" />
                    </div>
                    <p className="text-blue-400">Analyse des marchés en cours...</p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-4">
                    {analysis.split('\n').map((line, i) => (
                      <div 
                        key={i}
                        className="flex items-start space-x-3 bg-blue-500/5 p-4 rounded-lg hover:bg-blue-500/10 transition-colors duration-300"
                      >
                        {line.toLowerCase().includes('achat') ? (
                          <TrendingUp className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        ) : line.toLowerCase().includes('vente') ? (
                          <TrendingDown className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-gray-200">{line}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 p-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Cliquez sur la mascotte pour générer une analyse.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {analysis && (
                <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-blue-400/60 bg-blue-500/5 rounded-lg p-3">
                  <Sparkles className="w-4 h-4" />
                  <span>Prochaine mise à jour dans {settings.refreshInterval} secondes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}