import React, { useEffect, useState, useCallback } from 'react';
import { Clock, Tag, User, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useNews } from '../hooks/useNews';
import { useSettings } from '../context/SettingsContext';
import { translateText } from '../services/translate';
import type { NewsItem } from '../types';

const mockNews: NewsItem[] = Array.from({ length: 20 }, (_, i) => ({
  title: `Actualité Forex ${i + 1}`,
  link: "#",
  pubDate: new Date().toISOString(),
  content: `Contenu de l'actualité Forex ${i + 1}...`,
  category: i % 2 === 0 ? "Central Bank" : "News",
  author: i % 2 === 0 ? "Jean Dupont" : "Marie Martin"
}));

interface TranslatedNewsItem extends NewsItem {
  translatedTitle: string;
  translatedContent: string;
}

export default function NewsFeed() {
  const { settings } = useSettings();
  const { data: news, isLoading } = useNews();
  const [translatedNews, setTranslatedNews] = useState<TranslatedNewsItem[]>([]);
  const [displayCount, setDisplayCount] = useState(10);
  const [animatingItems, setAnimatingItems] = useState<number[]>([]);

  const translateNewsItems = useCallback(async () => {
    if (settings.demoMode) {
      setTranslatedNews(mockNews.map(item => ({
        ...item,
        translatedTitle: item.title,
        translatedContent: item.content
      })));
      return;
    }

    if (!news?.length) return;

    const uniqueNews = news.filter((item, index, self) =>
      index === self.findIndex((t) => t.title === item.title)
    );

    const translated = await Promise.all(
      uniqueNews.map(async (item) => ({
        ...item,
        content: item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content,
        translatedTitle: await translateText(item.title),
        translatedContent: await translateText(
          item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content
        )
      }))
    );

    setTranslatedNews(translated);
  }, [news, settings.demoMode]);

  useEffect(() => {
    translateNewsItems();
  }, [translateNewsItems]);

  const handleShowMore = () => {
    const newCount = displayCount + 10;
    const newItems = Array.from(
      { length: Math.min(newCount - displayCount, translatedNews.length - displayCount) },
      (_, i) => displayCount + i
    );
    setAnimatingItems(newItems);
    setDisplayCount(newCount);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setAnimatingItems([]);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Actualités Forex</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-700/30 rounded-lg">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-full mb-3"></div>
              <div className="h-3 bg-gray-600 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayedNews = translatedNews.slice(0, displayCount);
  const hasMore = translatedNews.length > displayCount;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <h2 className="text-xl font-semibold mb-4">
        Actualités Forex
        <span className="text-sm font-normal text-gray-400 ml-2">
          ({displayedNews.length}/{translatedNews.length})
        </span>
      </h2>
      <div className="space-y-4">
        {displayedNews.map((item, index) => (
          <article 
            key={index} 
            className={`
              p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all duration-500
              ${animatingItems.includes(index) ? 'animate-slide-in' : ''}
            `}
          >
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
              <h3 className="font-medium mb-2 hover:text-emerald-400 transition">
                {item.translatedTitle}
              </h3>
              <p className="text-sm text-gray-400 mb-3">{item.translatedContent}</p>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(item.pubDate), 'HH:mm dd/MM')}</span>
                  </div>
                  {item.author && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{item.author}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>{item.category}</span>
                </div>
              </div>
            </a>
          </article>
        ))}

        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleShowMore}
              className="group flex items-center space-x-2 px-6 py-3 
                       bg-gradient-to-r from-blue-500/10 to-cyan-500/10 
                       hover:from-blue-500/20 hover:to-cyan-500/20 
                       border border-blue-500/20 hover:border-blue-500/30 
                       rounded-full text-blue-400 transition-all duration-300
                       transform hover:scale-105 hover:shadow-lg"
            >
              <span>Voir plus</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}