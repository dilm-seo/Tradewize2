import React, { useState } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function EconomicCalendar() {
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);

  const calendarUrl = `https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=110,17,25,34,32,6,37,26,5,22,39,93,14,48,10,35,105,43,38,4,36,12,72&calType=week&timeZone=58&lang=5`;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-semibold">Calendrier Économique</h2>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 1000);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg 
                   hover:bg-blue-500/20 transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-white">
        <iframe
          src={calendarUrl}
          className="w-full h-[600px] border-0"
          title="Calendrier économique"
        />
        
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-100 text-xs text-gray-600 border-t">
          <span>
            Calendrier économique fourni par{' '}
            <a
              href="https://fr.investing.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Investing.com France
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}