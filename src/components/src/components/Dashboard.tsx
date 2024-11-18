// ... [previous imports remain the same]

export default function Dashboard() {
  // ... [previous code until handleGlobalAnalysis remains the same]

  const handleGlobalAnalysis = async () => {
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

      const prompt = `En tant qu'expert en day trading avec plus de 20 ans d'expérience, analysez les données suivantes et identifiez la meilleure opportunité de trading intraday.

DONNÉES DE MARCHÉ ACTUELLES:
${marketContext}

ACTUALITÉS RÉCENTES:
${newsContext}

Votre analyse doit :

1. Identifier la meilleure opportunité de day trading parmi toutes les paires de devises
2. Évaluer le momentum et la volatilité intraday
3. Détecter les niveaux de support/résistance clés pour la journée
4. Analyser l'impact immédiat des actualités sur les mouvements de prix
5. Fournir une recommandation de trading précise avec :
   - Points d'entrée spécifiques
   - Stop loss serré adapté au day trading
   - Objectifs de prix réalistes pour la journée
   - Durée estimée de la position (en heures)

Format de réponse souhaité :
<div class="space-y-4">
  <div class="mb-4">
    <h3 class="text-lg font-semibold text-blue-400 mb-2">Opportunité Day Trading</h3>
    [Paire sélectionnée et justification]
  </div>

  <div class="mb-4">
    <h4 class="font-medium text-blue-400 mb-2">Configuration Technique</h4>
    [Analyse technique détaillée]
  </div>

  <div class="mb-4">
    <h4 class="font-medium text-blue-400 mb-2">Niveaux de Trading</h4>
    <ul class="list-disc list-inside space-y-1 text-gray-300">
      <li>Point d'entrée : [niveau]</li>
      <li>Stop loss : [niveau]</li>
      <li>Objectif 1 : [niveau]</li>
      <li>Objectif 2 : [niveau]</li>
    </ul>
  </div>

  <div>
    <h4 class="font-medium text-blue-400 mb-2">Timing et Gestion</h4>
    [Détails sur le timing et la gestion de la position]
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

  // ... [rest of the component remains the same]
}