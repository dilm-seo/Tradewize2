import React, { useState } from 'react';
import { Calendar, Clock, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from 'react-query';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { EconomicEvent } from '../types';
import { useSettings } from '../context/SettingsContext';
import { fetchForexFactoryCalendar } from '../services/forex';

function getImpactColor(impact: string): string {
  switch (impact.toLowerCase()) {
    case 'high':
      return 'text-red-400';
    case 'medium':
      return 'text-yellow-400';
    default:
      return 'text-blue-400';
  }
}

function getValueColor(actual?: string, forecast?: string): string {
  if (!actual || !forecast) return '';
  const actualNum = parseFloat(actual);
  const forecastNum = parseFloat(forecast);
  if (isNaN(actualNum) || isNaN(forecastNum)) return '';
  return actualNum > forecastNum ? 'text-emerald-400' : 'text-red-400';
}

export default function EconomicCalendar() {
  const { settings } = useSettings();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const { data: events = [], isLoading } = useQuery<EconomicEvent[]>(
    ['economicCalendar', weekStart.toISOString()],
    () => fetchForexFactoryCalendar(weekStart),
    {
      refetchInterval: settings.refreshInterval * 1000,
      staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
      cacheTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    }
  );

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(current => addDays(current, direction === 'next' ? 7 : -7));
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Calendrier Économique</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Calendar className="h-6 w-6 text-blue-400" />
          <button
            onClick={() => navigateWeek('next')}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {weekDays.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`px-4 py-2 rounded-lg transition flex-shrink-0 ${
              isSameDay(date, selectedDate)
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-700/50'
            }`}
          >
            {format(date, 'EEE dd/MM', { locale: fr })}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {events
          .filter(event => isSameDay(new Date(event.date), selectedDate))
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((event, index) => (
            <div
              key={index}
              className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/40 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-medium">
                    {event.currency}
                  </span>
                  <span className={`ml-2 text-sm ${getImpactColor(event.impact)}`}>
                    {event.impact.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {event.time}
                </div>
              </div>

              <h3 className="text-sm font-medium mb-2">
                {event.event}
              </h3>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Précédent</span>
                  <div className="font-medium">
                    {event.previous || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Prévision</span>
                  <div className="font-medium">
                    {event.forecast || '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Actuel</span>
                  <div className="flex items-center">
                    <span className={`font-medium ${getValueColor(event.actual, event.forecast)}`}>
                      {event.actual || '-'}
                    </span>
                    {event.actual && event.forecast && (
                      <>
                        {parseFloat(event.actual) > parseFloat(event.forecast) ? (
                          <TrendingUp className="h-4 w-4 ml-1 text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 ml-1 text-red-400" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

        {events.filter(event => isSameDay(new Date(event.date), selectedDate)).length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">
            Aucun événement économique majeur ce jour
          </p>
        )}
      </div>
    </div>
  );
}