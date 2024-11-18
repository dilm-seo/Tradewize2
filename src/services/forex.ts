import { format, addDays } from 'date-fns';
import type { EconomicEvent } from '../types';

function getMockEvents(startDate: Date): EconomicEvent[] {
  const events: EconomicEvent[] = [
    {
      date: format(startDate, 'yyyy-MM-dd'),
      time: '14:30',
      currency: 'USD',
      impact: 'high',
      event: 'Rapport sur l\'emploi non-agricole',
      actual: '353K',
      forecast: '180K',
      previous: '216K'
    },
    {
      date: format(startDate, 'yyyy-MM-dd'),
      time: '16:00',
      currency: 'USD',
      impact: 'high',
      event: 'ISM Services PMI',
      actual: '53.4',
      forecast: '52.0',
      previous: '50.6'
    },
    {
      date: format(addDays(startDate, 1), 'yyyy-MM-dd'),
      time: '10:00',
      currency: 'EUR',
      impact: 'medium',
      event: 'Ventes au détail Zone Euro',
      forecast: '-1.3%',
      previous: '-1.1%'
    },
    {
      date: format(addDays(startDate, 2), 'yyyy-MM-dd'),
      time: '13:30',
      currency: 'GBP',
      impact: 'high',
      event: 'Décision taux BoE',
      forecast: '5.25%',
      previous: '5.25%'
    },
    {
      date: format(addDays(startDate, 2), 'yyyy-MM-dd'),
      time: '15:00',
      currency: 'USD',
      impact: 'medium',
      event: 'Stocks de pétrole brut',
      forecast: '2.1M',
      previous: '1.2M'
    },
    {
      date: format(addDays(startDate, 3), 'yyyy-MM-dd'),
      time: '09:00',
      currency: 'EUR',
      impact: 'high',
      event: 'PIB préliminaire Zone Euro',
      forecast: '0.1%',
      previous: '0.0%'
    },
    {
      date: format(addDays(startDate, 4), 'yyyy-MM-dd'),
      time: '14:30',
      currency: 'CAD',
      impact: 'high',
      event: 'Rapport sur l\'emploi',
      forecast: '15.0K',
      previous: '-24.8K'
    }
  ];

  return events;
}

export async function fetchForexFactoryCalendar(startDate: Date): Promise<EconomicEvent[]> {
  try {
    const response = await fetch('https://www.forexfactory.com/calendar.php', {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calendar data');
    }

    // For now, return mock data as we need to implement proper parsing
    return getMockEvents(startDate);
  } catch (error) {
    console.error('Error fetching Forex Factory calendar:', error);
    return getMockEvents(startDate);
  }
}