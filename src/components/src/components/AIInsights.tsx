import React, { useState } from 'react';
import { Brain, MessageSquare, Loader2 } from 'lucide-react';
import { useOpenAI } from '../services/openai';
import { useSettings } from '../context/SettingsContext';

export default function AIInsights() {
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { analyzeMarket } = useOpenAI();
  const { settings } = useSettings();

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !settings.apiKey) return;

    setIsAnalyzing(true);
    try {
      const context = `
        En tant qu'expert en trading et analyse des marchés financiers, veuillez analyser la question suivante :
        
        "${question}"
        
        Fournissez une réponse détaillée qui :
        1. Identifie les facteurs clés pertinents
        2. Analyse l'impact potentiel sur les marchés
        3. Propose des stratégies ou recommandations concrètes
        4. Inclut des niveaux techniques importants si pertinent
        5. Considère les risques potentiels
        
        La réponse doit être structurée, claire et actionnable.
      `;
      
      const result = await analyzeMarket(context);
      setAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
    setQuestion('');
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">AI Insights</h2>
        <Brain className="h-6 w-6 text-purple-400" />
      </div>
      
      <div className="space-y-4">
        {analysis && (
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-purple-400 mt-1" />
              <div>
                <p className="text-sm whitespace-pre-line">{analysis}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleAnalysis} className="p-4 bg-gray-700/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <MessageSquare className="h-5 w-5 text-emerald-400 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-300 mb-3">
                Posez une question à l'IA pour obtenir une analyse personnalisée des marchés...
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ex: Quel est l'impact de l'inflation sur EUR/USD ?"
                  disabled={isAnalyzing || !settings.apiKey}
                  className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !settings.apiKey || !question.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:hover:bg-purple-500"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Analyser'
                  )}
                </button>
              </div>
              {!settings.apiKey && (
                <p className="text-sm text-red-400 mt-2">
                  Veuillez configurer votre clé API OpenAI dans les paramètres
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}