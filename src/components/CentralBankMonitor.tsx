import React, { useMemo } from 'react';
import { Building2, Calendar } from 'lucide-react';
import { useNews } from '../hooks/useNews';

export default function CentralBankMonitor() {
  const { data: news } = useNews();

  const centralBankInfo = useMemo(() => {
    if (!news) return [];

    const bankKeywords = {
      'BCE': ['bce', 'lagarde', 'banque centrale européenne'],
      'FED': ['fed', 'powell', 'federal reserve'],
      'BOE': ['boe', 'bailey', 'bank of england']
    };

    return Object.entries(bankKeywords).map(([bank, keywords]) => {
      const relevantNews = news.filter(item => 
        keywords.some(keyword => 
          item.title.toLowerCase().includes(keyword) || 
          item.content.toLowerCase().includes(keyword)
        )
      );

      if (relevantNews.length === 0) return null;

      const latestNews = relevantNews[0];
      const content = latestNews.content.toLowerCase();
      
      // Détermine la stance basée sur le contenu des news
      let stance = 'Neutre';
      if (content.includes('hawkish') || content.includes('restrictif') || content.includes('hausse des taux')) {
        stance = 'Hawkish';
      } else if (content.includes('dovish') || content.includes('accommodant') || content.includes('baisse des taux')) {
        stance = 'Dovish';
      }

      return {
        name: bank,
        latestNews: latestNews.translatedTitle || latestNews.title,
        pubDate: latestNews.pubDate,
        stance,
        newsCount: relevantNews.length
      };
    }).filter(Boolean);
  }, [news]);

  if (!centralBankInfo.length) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Actualités Banques Centrales</h2>
        <Building2 className="h-6 w-6 text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {centralBankInfo.map((bank) => (
          <div key={bank.name} className="p-4 bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{bank.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium
                ${bank.stance === 'Hawkish' ? 'bg-red-400/20 text-red-400' :
                  bank.stance === 'Dovish' ? 'bg-green-400/20 text-green-400' :
                  'bg-blue-400/20 text-blue-400'}`}>
                {bank.stance}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-300 line-clamp-2">{bank.latestNews}</p>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-gray-400">
                    {new Date(bank.pubDate).toLocaleString()}
                  </span>
                  <span className="text-blue-400">
                    {bank.newsCount} actualité{bank.newsCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}