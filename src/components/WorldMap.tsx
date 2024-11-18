import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TradingSession {
  name: string;
  status: 'active' | 'inactive';
  pairs: string[];
  color: string;
}

const TRADING_SESSIONS: Record<string, { start: number; end: number; pairs: string[] }> = {
  'Sydney': { start: 22, end: 7, pairs: ['AUD/USD', 'NZD/USD'] },
  'Tokyo': { start: 0, end: 9, pairs: ['USD/JPY', 'EUR/JPY', 'GBP/JPY'] },
  'Londres': { start: 8, end: 17, pairs: ['GBP/USD', 'EUR/GBP', 'EUR/USD'] },
  'New York': { start: 13, end: 22, pairs: ['EUR/USD', 'USD/CAD', 'USD/CHF'] }
};

export default function WorldMap() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSessions, setActiveSessions] = useState<TradingSession[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const parisHour = currentTime.getUTCHours() + 1; // Paris is UTC+1
    
    const sessions = Object.entries(TRADING_SESSIONS).map(([name, session]) => {
      let isActive = false;
      
      if (session.start < session.end) {
        isActive = parisHour >= session.start && parisHour < session.end;
      } else {
        isActive = parisHour >= session.start || parisHour < session.end;
      }

      return {
        name,
        status: isActive ? 'active' : 'inactive',
        pairs: session.pairs,
        color: isActive ? 'bg-emerald-500' : 'bg-gray-600'
      };
    });

    setActiveSessions(sessions);
  }, [currentTime]);

  const getActivePairs = () => {
    const pairs = new Set<string>();
    activeSessions
      .filter(session => session.status === 'active')
      .forEach(session => session.pairs.forEach(pair => pairs.add(pair)));
    return Array.from(pairs);
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Sessions de Trading</h2>
        <div className="flex items-center space-x-2 text-emerald-400">
          <Clock className="h-5 w-5" />
          <span className="font-medium">
            {currentTime.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}
          </span>
        </div>
      </div>

      <div className="relative">
        {/* World Map SVG - Simple representation */}
        <div className="w-full h-48 bg-gray-700/30 rounded-lg overflow-hidden">
          <svg viewBox="0 0 1000 500" className="w-full h-full opacity-30">
            <path
              d="M150,100 Q400,50 600,100 T1000,150 L1000,400 Q750,350 500,400 T0,350 L0,100"
              fill="currentColor"
              className="text-gray-600"
            />
          </svg>
          
          {/* Trading Session Indicators */}
          <div className="absolute top-0 left-0 w-full h-full grid grid-cols-4 gap-4 p-4">
            {activeSessions.map((session, index) => (
              <div
                key={session.name}
                className="flex flex-col items-center justify-center"
                style={{
                  gridColumn: index + 1,
                  opacity: session.status === 'active' ? 1 : 0.5
                }}
              >
                <div className={`w-4 h-4 rounded-full ${session.color} mb-2`} />
                <span className="text-sm font-medium">{session.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          Paires actives pour les sessions en cours :
        </h3>
        <div className="flex flex-wrap gap-2">
          {getActivePairs().map(pair => (
            <span
              key={pair}
              className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm"
            >
              {pair}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {activeSessions.map(session => (
          <div
            key={session.name}
            className={`p-3 rounded-lg ${
              session.status === 'active'
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-gray-700/30 border-gray-600/20'
            } border`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{session.name}</span>
              <div className={`w-2 h-2 rounded-full ${session.color}`} />
            </div>
            <div className="text-xs text-gray-400">
              {TRADING_SESSIONS[session.name].start}:00 - {TRADING_SESSIONS[session.name].end}:00
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}