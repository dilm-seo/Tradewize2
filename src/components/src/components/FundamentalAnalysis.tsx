import React, { useState } from 'react';
import { LineChart, RefreshCw, Loader2 } from 'lucide-react';
import { useOpenAI } from '../services/openai';
import { useSettings } from '../context/SettingsContext';
import { useNews } from '../hooks/useNews';

const mockAnalysis = `<div class="space-y-4">
  <div class="mb-4">
    <h3 class="text-lg font-semibold text-blue-400 mb-2">Analyse EUR/USD</h3>
    <p>La paire est influencée par une divergence croissante entre les politiques monétaires de la BCE et de la Fed, avec un biais accommodant progressif aux États-Unis contrastant avec la position plus restrictive en Europe.</p>
  </div>

  <div class="mb-4">
    <h4 class="font-medium text-emerald-400 mb-2">Contexte Macroéconomique</h4>
    <ul class="list-disc list-inside space-y-1 text-gray-300">
      <li>Zone Euro : Croissance modérée, inflation en baisse progressive</li>
      <li>États-Unis : Économie résiliente, marché du travail dynamique</li>
    </ul>
  </div>

  <div class="mb-4">
    <h4 class="font-medium text-emerald-400 mb-2">Facteurs Clés</h4>
    <ul class="list-disc list-inside space-y-1 text-gray-300">
      <li>BCE : Maintien d'une position restrictive</li>
      <li>FED : Anticipations de baisse des taux en 2024</li>
      <li>Différentiel de taux favorable au dollar</li>
    </ul>
  </div>

  <div>
    <h4 class="font-medium text-emerald-400 mb-2">Perspective</h4>
    <p>Le différentiel de politique monétaire devrait continuer à influencer la dynamique de la paire à moyen terme, avec un biais baissier sur l'euro face au dollar.</p>
  </div>
</div>`;

export default function FundamentalAnalysis() {
  const [analysis, setAnalysis] = useState(mockAnalysis);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { analyzeMarket } = useOpenAI();
  const { settings } = useSettings();
  const { data: news } = useNews();

  const handleGenerateAnalysis = async () => {
    if (!settings.apiKey || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const relevantNews = (news || [])
        .filter(item => 
          item.category.toLowerCase().includes('central bank') ||
          item.category.toLowerCase().includes('news') ||
          item.title.toLowerCase().includes('fed') ||
          item.title.toLowerCase().includes('bce') ||
          item.title.toLowerCase().includes('inflation') ||
          item.title.toLowerCase().includes('pib') ||
          item.title.toLowerCase().includes('gdp')
        )
        .slice(0, 3);

      const newsContext = relevantNews.map(item => 
        `- ${item.title} (Source: ${item.author || 'ForexLive'}, ${new Date(item.pubDate).toLocaleDateString()})`
      ).join('\n');

      const prompt = `En tant qu'analyste forex professionnel, fournissez une analyse fondamentale approfondie des principales paires de devises (EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CHF, USD/CAD). L'objectif de cette analyse est de soutenir la prise de décision en matière de trading à court et moyen terme, en identifiant les risques potentiels et les opportunités.

Actualités récentes à prendre en compte :
${newsContext}

Votre analyse doit être structurée en HTML avec les classes Tailwind CSS appropriées et inclure :

<div class="space-y-6 p-6 text-white bg-transparent border border-gray-600 rounded-lg shadow-md">
  <!-- Titre de l'Analyse -->
  <div class="mb-6">
    <h3 class="text-2xl font-bold text-blue-400 mb-4 flex items-center">
      <svg class="w-6 h-6 mr-2 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-3-3v6m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      Analyse Fondamentale
    </h3>
    <p class="text-gray-300 leading-relaxed">
      Rédige une analyse fondamentale (200 mots)
    </p>
  </div>

  <!-- Contexte Macroéconomique -->
  <div class="mb-6 p-4 bg-gray-700/40 rounded-lg border border-gray-600 shadow-sm">
    <h4 class="text-xl font-semibold text-emerald-400 mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8m-4-4h8" /></svg>
      Contexte Macroéconomique
    </h4>
    <ul class="list-disc list-inside space-y-3 text-gray-300">
      <li>Contexte Macroéconomique 1</li>
      <li>Contexte Macroéconomique 2</li>
    </ul>
  </div>

  <!-- Facteurs Clés -->
  <div class="mb-6 p-4 bg-gray-700/40 rounded-lg border border-gray-600 shadow-sm">
    <h4 class="text-xl font-semibold text-emerald-400 mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      Facteurs Clés
    </h4>
    <ul class="list-disc list-inside space-y-3 text-gray-300">
      <li>facteur clé 1</li>
      <li>facteur clé 2</li>
      <li>facteur clé 3</li>
    </ul>
  </div>

  <!-- Perspective -->
  <div class="p-4 bg-gray-700/40 rounded-lg border border-gray-600 shadow-sm">
    <h4 class="text-xl font-semibold text-emerald-400 mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
      Perspective
    </h4>
    <p class="text-gray-300 leading-relaxed">Rédige les perspectives</p>
  </div>
</div>

  [Sections suivantes...]
</div>`;

      const result = await analyzeMarket(prompt);
      
      if (result.includes("erreur") || result.includes("Erreur")) {
        throw new Error(result);
      }
      
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite lors de l'analyse.");
      setAnalysis(mockAnalysis);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Analyse Fondamentale</h2>
        <button
          onClick={handleGenerateAnalysis}
          disabled={isGenerating || !settings.apiKey}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:hover:bg-blue-500"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Génération...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5" />
              <span>Générer</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 bg-gray-700/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <LineChart className="h-5 w-5 text-blue-400 mt-1" />
          <div className="flex-1">
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: analysis }}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 mt-2">
          {error}
        </p>
      )}

      {!settings.apiKey && (
        <p className="text-sm text-red-400 mt-2">
          Veuillez configurer votre clé API OpenAI dans les paramètres pour générer une analyse
        </p>
      )}
    </div>
  );
}
