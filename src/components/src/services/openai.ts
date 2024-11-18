import OpenAI from 'openai';
import { useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import type { TradingSignal } from '../types';

export function useOpenAI() {
  const { settings, updateSettings } = useSettings();
  
  const openai = new OpenAI({
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true
  });

  const checkDailyLimit = (cost: number): boolean => {
    const newTotal = settings.apiCosts + cost;
    return newTotal <= settings.dailyLimit;
  };

  const analyzeMarket = useCallback(async (context: string): Promise<string> => {
    if (!settings.apiKey) {
      throw new Error("Clé API OpenAI non configurée");
    }

    try {
      const estimatedCost = 0.03;
      if (!checkDailyLimit(estimatedCost)) {
        throw new Error("Limite de dépense journalière atteinte. Veuillez réessayer demain ou augmenter votre limite.");
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: `Vous êtes un expert en analyse des marchés Forex avec plus de 20 ans d'expérience. 
          Votre objectif est d'identifier la meilleure opportunité de trading sur les principales paires de devises.
          
          Pour chaque analyse :
          1. Évaluez les facteurs macroéconomiques clés (politique monétaire, données économiques, événements géopolitiques)
          2. Analysez les niveaux techniques importants
          3. Évaluez le sentiment du marché et le positionnement des traders
          4. Identifiez les catalyseurs potentiels à court terme
          5. Fournissez une recommandation claire avec :
             - La paire de devises la plus prometteuse
             - La direction du trade (long/short)
             - Les niveaux d'entrée, stop-loss et take-profit
             - L'horizon temporel recommandé
          
          Structurez votre réponse de manière claire et concise, en français.`
        }, {
          role: "user",
          content: context
        }],
        temperature: 0.7,
        max_tokens: 1000
      });

      const totalTokens = response.usage?.total_tokens || 0;
      const cost = (totalTokens / 1000) * 0.03;
      updateSettings({ apiCosts: settings.apiCosts + cost });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Pas de réponse de l'API");
      }

      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur d'analyse: ${error.message}`);
      }
      throw new Error("Une erreur inattendue s'est produite");
    }
  }, [settings.apiKey, settings.apiCosts, settings.dailyLimit, updateSettings]);

  const generateTradingSignals = useCallback(async (): Promise<TradingSignal[]> => {
    if (!settings.apiKey) {
      throw new Error("Clé API OpenAI non configurée");
    }

    try {
      const estimatedCost = 0.05;
      if (!checkDailyLimit(estimatedCost)) {
        throw new Error("Limite de dépense journalière atteinte");
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "Vous êtes un analyste professionnel du trading Forex. Générez 3 signaux de trading avec des points d'entrée, stops et objectifs réalistes. Retournez les données au format JSON strict avec la structure suivante : [{symbol, direction, entryPrice, stopLoss, takeProfit, timeframe, analysis}]. Le champ analysis doit être en français."
        }, {
          role: "user",
          content: "Générer des signaux de trading actuels basés sur les principales paires Forex"
        }],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const totalTokens = response.usage?.total_tokens || 0;
      const cost = (totalTokens / 1000) * 0.03;
      updateSettings({ apiCosts: settings.apiCosts + cost });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Pas de réponse de l'API");
      }

      return JSON.parse(content).signals || [];
    } catch (error) {
      console.error('Erreur de génération des signaux:', error);
      return [];
    }
  }, [settings.apiKey, settings.apiCosts, settings.dailyLimit, updateSettings]);

  return { analyzeMarket, generateTradingSignals };
}