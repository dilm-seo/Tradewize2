import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Settings, SettingsContextType } from '../types';

const defaultPrompts = {
  fundamentalAnalysis: `En tant qu'analyste forex professionnel, analysez les actualités fournies pour identifier les meilleures opportunités de trading.

Contexte des actualités :
{newsContext}

Instructions d'analyse :
1. Identifiez les thèmes majeurs dans les actualités qui impactent les devises
2. Évaluez l'impact sur différents horizons temporels :
   - Court terme (1-5 jours)
   - Moyen terme (1-4 semaines)
   - Long terme (1-6 mois)

3. Pour chaque horizon, déterminez :
   - La paire de devises la plus impactée
   - Le sens probable du mouvement
   - Les facteurs clés justifiant l'analyse
   - Les niveaux techniques importants à surveiller

4. Structurez la réponse avec :
   - Une vue d'ensemble des thèmes majeurs
   - Les opportunités par horizon temporel
   - Les risques principaux à surveiller

Format : Réponse structurée en HTML avec classes Tailwind CSS appropriées.`,

  tradingSignals: `En tant qu'analyste technique, générez des signaux de trading basés sur les données de marché et l'actualité.

Données de marché actuelles :
{marketContext}

Actualités récentes :
{newsContext}

Instructions :
1. Analysez la corrélation entre les mouvements de prix et les actualités
2. Identifiez les configurations techniques prometteuses
3. Générez 3 signaux de trading avec :
   - Justification fondamentale ET technique
   - Points d'entrée précis
   - Stop loss et take profit réalistes
   - Horizon temporel recommandé

Format : JSON strict avec la structure :
[{
  symbol: string,
  direction: "buy" | "sell",
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  timeframe: string,
  analysis: string (en français)
}]`,

  aiInsights: `En tant qu'expert des marchés financiers, adaptez votre analyse selon le type de question.

{Si la question concerne l'actualité ou les marchés actuels, utilisez :}
Données de marché : {marketContext}
Actualités récentes : {newsContext}

{Si la question est théorique/éducative, utilisez vos connaissances générales}

Instructions d'analyse :
1. Déterminez si la question nécessite des données en temps réel
2. Pour les questions actuelles :
   - Reliez votre analyse aux données de marché
   - Citez les actualités pertinentes
   - Fournissez des niveaux techniques précis
3. Pour les questions théoriques :
   - Expliquez les concepts clés
   - Donnez des exemples concrets
   - Fournissez des conseils pratiques

Format : Réponse claire et structurée, adaptée au niveau technique de la question.`,

  mascot: `En tant qu'expert des marchés forex, analysez les événements économiques à fort impact et les mouvements de marché majeurs.

Données de marché actuelles :
{marketContext}

Actualités récentes :
{newsContext}

Événements économiques :
{calendarContext}

Instructions :
1. Identifiez uniquement :
   - Les actualités à très fort impact sur les devises
   - Les événements économiques majeurs à venir
   - Les mouvements de prix significatifs

2. Fournissez une analyse concise :
   - Quelle paire de devises est la plus impactée
   - Quel est l'impact probable sur la direction du marché
   - Pourquoi cet événement est important

Format : Réponse courte et directe en 2-3 phrases maximum, focalisée uniquement sur l'événement le plus important du moment.`
};

const defaultSettings: Settings = {
  apiKey: '',
  refreshInterval: 60,
  demoMode: true,
  apiCosts: 0,
  dailyLimit: 5,
  lastResetDate: new Date().toISOString().split('T')[0],
  theme: 'dark',
  prompts: defaultPrompts
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        ...parsed,
        prompts: {
          ...defaultPrompts,
          ...parsed.prompts
        }
      };
    }
    return defaultSettings;
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (settings.lastResetDate !== today) {
      setSettings(prev => ({
        ...prev,
        apiCosts: 0,
        lastResetDate: today
      }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    
    const htmlElement = document.documentElement;
    if (settings.theme === 'dark') {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    } else {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.prompts) {
        updated.prompts = {
          ...defaultPrompts,
          ...newSettings.prompts
        };
      }
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}