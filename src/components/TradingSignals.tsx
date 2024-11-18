import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { useSettings } from '../context/SettingsContext';
import { translateText } from '../services/translate';

interface TechnicalAnalysis {
  title: string;
  content: string;
  pubDate: string;
  link: string;
  translatedTitle?: string;
  translatedContent?: string;
}

const mockSignals = [
  {
    title: "EUR/USD : Support technique majeur à 1.0850",
    content: "Le prix teste un support majeur avec une divergence positive du RSI...",
    pubDate: new Date().toISOString(),
    link: "#",
    translatedTitle: "EUR/USD : Support technique majeur à 1.0850",
    translatedContent: "Le prix teste un support majeur avec une divergence positive du RSI..."
  }
];

function stripHTML(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

function truncateText(text: string, maxLength: number): string {
  const stripped = stripHTML(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength).trim() + '...';
}

export default function TradingSignals() {
  const { settings } = useSettings();
  const [isTranslating, setIsTranslating] = useState(false);

  const { data: signals, isLoading, refetch } = useQuery<TechnicalAnalysis[]>(
    'technicalAnalysis',
    async () => {
      if (settings.demoMode) return mockSignals;

      const response = await fetch(
        'https://corsproxy.io/?' + 
        encodeURIComponent('https://www.forexlive.com/feed/technicalanalysis')
      );
      
      if (!response.ok) throw new Error('Failed to fetch technical analysis');
      
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/xml');
      const items = Array.from(doc.querySelectorAll('item'));
      
      const analyses = await Promise.all(items.map(async (item) => {
        const title = stripHTML(item.querySelector('title')?.textContent?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '');
        const content = truncateText(
          item.querySelector('description')?.textContent?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '',
          200
        );
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';

        setIsTranslating(true);
        const translatedTitle = await translateText(title);
        const translatedContent = await translateText(content);
        setIsTranslating(false);

        return {
          title,
          content,
          pubDate,
          link,
          translatedTitle,
          translatedContent
        };
      }));

      return analyses.slice(0, 5);
    },
    {
      refetchInterval: settings.refreshInterval * 1000,
      enabled: !settings.demoMode
    }
  );

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Signaux de Trading</h2>
          <div className="animate-pulse w-24 h-8 bg-gray-700 rounded-lg"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-700/30 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Signaux de Trading</h2>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isTranslating}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:hover:bg-blue-500"
        >
          {isLoading || isTranslating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{isTranslating ? 'Traduction...' : 'Chargement...'}</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5" />
              <span>Actualiser</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {(signals || []).map((signal, index) => (
          <div key={index} className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition">
            <a href={signal.link} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-blue-400 hover:text-blue-300 transition">
                  {signal.translatedTitle || signal.title}
                </h3>
                {signal.title.toLowerCase().includes('buy') ? (
                  <ArrowUpCircle className="h-6 w-6 text-blue-400" />
                ) : signal.title.toLowerCase().includes('sell') ? (
                  <ArrowDownCircle className="h-6 w-6 text-red-400" />
                ) : null}
              </div>
              <p className="text-sm text-gray-300 mb-3">
                {signal.translatedContent || signal.content}
              </p>
              <div className="text-sm text-gray-400">
                {format(new Date(signal.pubDate), 'HH:mm dd/MM/yyyy')}
              </div>
            </a>
          </div>
        ))}

        {signals?.length === 0 && !settings.demoMode && (
          <p className="text-sm text-gray-400 text-center py-4">
            Aucune analyse technique disponible pour le moment
          </p>
        )}
      </div>
    </div>
  );
}