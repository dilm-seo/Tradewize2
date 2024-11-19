import React, { useState } from 'react';
import { BarChart2, RefreshCw, Loader2, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { useOpenAI } from '../services/openai';
import { useSettings } from '../context/SettingsContext';
import { useMarketData } from '../hooks/useMarketData';
import { useNews } from '../hooks/useNews';

interface SentimentResult {
  pair: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  confidence: number;
  strength: 'strong' | 'moderate' | 'weak';
  timeframe: 'short' | 'medium' | 'long';
  reasoning: string;
  catalysts: string[];
}

const SENTIMENT_PROMPT = `En tant qu'analyste quantitatif forex, analysez le sentiment de marché avec une approche statistique rigoureuse.

Données de marché actuelles :
{marketContext}

Actualités récentes :
{newsContext}

Instructions d'analyse :
1. Pour chaque paire majeure (EUR/USD, GBP/USD, USD/JPY) :
   - Évaluez le sentiment (bullish/bearish/neutral)
   - Calculez un score de sentiment (-100 à +100)
   - Déterminez la force du signal (strong/moderate/weak)
   - Identifiez l'horizon temporel (short/medium/long)
   - Évaluez la confiance (0-100%)
   - Listez les catalyseurs clés (max 3)

2. Critères d'évaluation :
   - Impact des données macro
   - Positionnement des banques centrales
   - Flux institutionnels
   - Momentum technique
   - Corrélations inter-marchés

3. Pondération des facteurs :
   - Actualités récentes : 40%
   - Données techniques : 30%
   - Contexte macro : 30%

Format JSON :
{
  "analysis": [{
    "pair": string,
    "sentiment": "bullish" | "bearish" | "neutral",
    "score": number (-100 à +100),
    "confidence": number (0-100),
    "strength": "strong" | "moderate" | "weak",
    "timeframe": "short" | "medium" | "long",
    "reasoning": string,
    "catalysts": string[]
  }]
}`;

export default function SentimentAnalysis() {
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { analyzeMarket } = useOpenAI();
  const { settings } = useSettings();
  const { data: marketData } = useMarketData();
  const { data: news } = useNews();

  const handleAnalysis = async () => {
    if (!settings.apiKey || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      if (!marketData || !news) {
        throw new Error("Données de marché ou actualités non disponibles");
      }

      const marketContext = marketData
        .map(data => 
          `${data.symbol}: ${data.price} (${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`
        )
        .join('\n');

      const newsContext = news
        .slice(0, 10)
        .map(item => `- ${item.translatedTitle || item.title}`)
        .join('\n');

      const response = await analyzeMarket(SENTIMENT_PROMPT, {
        marketContext,
        newsContext
      });

      const parsed = JSON.parse(response);
      setResults(parsed.analysis);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur analyse sentiment:', err);
      setError("Erreur lors de l'analyse du sentiment");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'bearish': return <TrendingDown className="h-5 w-5 text-red-400" />;
      default: return <Minus className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'weak': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'short': return 'bg-purple-400/20 text-purple-400';
      case 'medium': return 'bg-blue-400/20 text-blue-400';
      case 'long': return 'bg-green-400/20 text-green-400';
      default: return 'bg-gray-400/20 text-gray-400';
    }
  };

  const getSentimentGradient = (score: number) => {
    if (score > 0) {
      return 'from-green-500/20 to-green-500/5';
    } else if (score < 0) {
      return 'from-red-500/20 to-red-500/5';
    }
    return 'from-blue-500/20 to-blue-500/5';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Analyse du Sentiment</h2>
          <p className="text-sm text-gray-400 mt-1">
            Analyse quantitative multi-facteurs
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <BarChart2 className="h-6 w-6 text-purple-400" />
          <button
            onClick={handleAnalysis}
            disabled={isAnalyzing || !settings.apiKey}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg 
                     hover:bg-purple-600 transition disabled:opacity-50 disabled:hover:bg-purple-500"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyse...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                <span>Analyser</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm mb-4">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {results.map((result) => (
          <div 
            key={result.pair}
            className={`p-4 rounded-lg bg-gradient-to-r ${getSentimentGradient(result.score)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-medium">{result.pair}</span>
                  {getSentimentIcon(result.sentiment)}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTimeframeColor(result.timeframe)}`}>
                    {result.timeframe === 'short' ? 'Court terme' : 
                     result.timeframe === 'medium' ? 'Moyen terme' : 'Long terme'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-sm ${getStrengthColor(result.strength)}`}>
                    Signal {result.strength === 'strong' ? 'fort' : 
                           result.strength === 'moderate' ? 'modéré' : 'faible'}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className={`text-sm ${getConfidenceColor(result.confidence)}`}>
                    Confiance {result.confidence}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-right">
                <span className={result.score > 0 ? 'text-green-400' : 
                               result.score < 0 ? 'text-red-400' : 'text-blue-400'}>
                  {result.score > 0 ? '+' : ''}{result.score}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-300">{result.reasoning}</p>
              
              <div className="flex flex-wrap gap-2">
                {result.catalysts.map((catalyst, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-700/30 rounded-full text-xs text-gray-300"
                  >
                    {catalyst}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {results.length === 0 && !isAnalyzing && (
          <div className="text-center py-8 text-gray-400">
            Cliquez sur Analyser pour obtenir une analyse du sentiment
          </div>
        )}
      </div>

      {lastUpdate && (
        <p className="text-xs text-gray-400 mt-4 text-right">
          Dernière mise à jour : {lastUpdate.toLocaleString()}
        </p>
      )}

      {!settings.apiKey && (
        <p className="text-sm text-red-400 mt-4">
          Veuillez configurer votre clé API OpenAI dans les paramètres
        </p>
      )}
    </div>
  );
}