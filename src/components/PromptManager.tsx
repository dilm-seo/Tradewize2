import React, { useState } from 'react';
import { Save, RefreshCw, Code } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface Prompt {
  id: string;
  name: string;
  content: string;
  description: string;
}

const defaultPrompts: Prompt[] = [
  {
    id: 'fundamental',
    name: 'Analyse Fondamentale',
    description: 'Prompt pour l\'analyse fondamentale des paires de devises',
    content: `En tant qu'analyste forex professionnel, fournissez une analyse fondamentale approfondie des principales paires de devises.

Votre analyse doit inclure :

1. Sélection de la paire la plus intéressante basée sur :
   - Impact des actualités récentes
   - Divergences de politiques monétaires
   - Données macroéconomiques
   - Facteurs géopolitiques
   - Sentiment de marché

2. Pour la paire sélectionnée, analyser :
   - Contexte économique comparé
   - Positions des banques centrales
   - Catalyseurs potentiels
   - Forces et faiblesses relatives

3. Conclusion :
   - Biais directionnel général
   - Horizon temporel
   - Risques à surveiller`
  },
  {
    id: 'ai-insights',
    name: 'AI Insights',
    description: 'Prompt pour les réponses aux questions des utilisateurs',
    content: `En tant qu'expert en trading et analyse des marchés financiers, analysez la question en :

1. Identifiant les facteurs clés pertinents
2. Analysant l'impact potentiel sur les marchés
3. Proposant des stratégies concrètes
4. Incluant des niveaux techniques si pertinent
5. Considérant les risques potentiels

La réponse doit être structurée, claire et actionnable.`
  },
  {
    id: 'signals',
    name: 'Signaux de Trading',
    description: 'Prompt pour la génération des signaux de trading',
    content: `Générez des signaux de trading précis avec :

1. Identification des meilleures opportunités
2. Analyse technique détaillée
3. Niveaux d'entrée, stop-loss et take-profit
4. Horizon temporel recommandé
5. Justification du signal

Format JSON attendu pour chaque signal :
{
  "symbol": "XXX/XXX",
  "direction": "buy/sell",
  "entryPrice": 0.0000,
  "stopLoss": 0.0000,
  "takeProfit": 0.0000,
  "timeframe": "H4",
  "analysis": "Justification..."
}`
  },
  {
    id: 'mascot',
    name: 'Assistant Trading',
    description: 'Prompt pour l\'analyse de la mascotte',
    content: `Données de marché actuelles:
[Prix et variations des paires]

Actualités récentes:
[Liste des actualités]

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
</div>`
  }
];

// ... [Le reste du composant PromptManager reste inchangé]