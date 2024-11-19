import { format, addDays, parseISO } from 'date-fns';
import type { EconomicEvent } from '../types';

const CORS_PROXY = 'https://corsproxy.io/?';
const DAILYFOREX_RSS = 'https://fr.dailyforex.com/rss/fr/forexnews.xml';

function parseEventImpact(title: string, description: string): 'high' | 'medium' | 'low' {
  const text = (title + ' ' + description).toLowerCase();
  
  // Mots-clés indiquant un impact élevé
  const highImpactKeywords = [
    'pib', 'taux directeur', 'inflation', 'emploi', 'nfp', 'fomc',
    'bce', 'fed', 'décision', 'powell', 'lagarde', 'critique',
    'important', 'majeur', 'crucial'
  ];
  
  // Mots-clés indiquant un impact moyen
  const mediumImpactKeywords = [
    'ipc', 'pmi', 'retail', 'ventes', 'production', 'confiance',
    'balance commerciale', 'modéré', 'moyen'
  ];
  
  for (const keyword of highImpactKeywords) {
    if (text.includes(keyword)) return 'high';
  }
  
  for (const keyword of mediumImpactKeywords) {
    if (text.includes(keyword)) return 'medium';
  }
  
  return 'low';
}

function extractEventDetails(description: string): {
  forecast?: string;
  previous?: string;
  actual?: string;
  event?: string;
} {
  const details: {
    forecast?: string;
    previous?: string;
    actual?: string;
    event?: string;
  } = {};

  // Nettoyer la description
  const cleanDesc = description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');

  // Extraire l'événement
  const eventMatch = cleanDesc.match(/^([^:]+):/);
  if (eventMatch) {
    details.event = eventMatch[1].trim();
  }

  // Extraire les valeurs avec gestion des formats différents
  const patterns = {
    forecast: [/[Pp]révision\s*:?\s*([-\d.,]+)%?/, /[Aa]ttendu\s*:?\s*([-\d.,]+)%?/],
    previous: [/[Pp]récédent\s*:?\s*([-\d.,]+)%?/, /[Aa]ntérieur\s*:?\s*([-\d.,]+)%?/],
    actual: [/[Aa]ctuel\s*:?\s*([-\d.,]+)%?/, /[Pp]ublié\s*:?\s*([-\d.,]+)%?/]
  };

  Object.entries(patterns).forEach(([key, regexList]) => {
    for (const regex of regexList) {
      const match = cleanDesc.match(regex);
      if (match) {
        details[key as keyof typeof patterns] = match[1].replace(',', '.');
        break;
      }
    }
  });

  return details;
}

function extractCurrency(title: string, description: string): string {
  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
  const text = (title + ' ' + description).toUpperCase();
  
  // Rechercher les paires de devises
  for (const currency of currencies) {
    if (text.includes(currency)) {
      return currency;
    }
  }

  // Rechercher les zones économiques
  const regionMap: { [key: string]: string } = {
    'ZONE EURO': 'EUR',
    'ÉTATS-UNIS': 'USD',
    'ETATS-UNIS': 'USD',
    'ROYAUME-UNI': 'GBP',
    'JAPON': 'JPY',
    'AUSTRALIE': 'AUD',
    'CANADA': 'CAD',
    'SUISSE': 'CHF'
  };

  for (const [region, currency] of Object.entries(regionMap)) {
    if (text.includes(region)) {
      return currency;
    }
  }

  return 'EUR';
}

export async function fetchForexFactoryCalendar(startDate: Date): Promise<EconomicEvent[]> {
  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(DAILYFOREX_RSS));
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar data');
    }

    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item'));

    const events: EconomicEvent[] = items
      .map(item => {
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        
        // Vérifier si c'est une annonce économique
        if (!description.includes('Précédent') && !description.includes('Prévision')) {
          return null;
        }

        const date = new Date(pubDate);
        const details = extractEventDetails(description);

        return {
          date: format(date, 'yyyy-MM-dd'),
          time: format(date, 'HH:mm'),
          currency: extractCurrency(title, description),
          impact: parseEventImpact(title, description),
          event: details.event || title.replace(/\([^\)]+\)/g, '').trim(),
          forecast: details.forecast,
          previous: details.previous,
          actual: details.actual
        };
      })
      .filter((event): event is EconomicEvent => 
        event !== null && 
        event.event !== null &&
        (event.forecast !== undefined || event.previous !== undefined || event.actual !== undefined)
      );

    // Filtrer les événements pour la semaine en cours
    const endDate = addDays(startDate, 5);
    return events
      .filter(event => {
        const eventDate = parseISO(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      })
      .sort((a, b) => {
        const dateA = parseISO(`${a.date}T${a.time}`);
        const dateB = parseISO(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

  } catch (error) {
    console.error('Error fetching economic calendar:', error);
    return [];
  }
}