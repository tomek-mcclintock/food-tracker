import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Demo data
const demoHistory = [
  // Dairy entries with mixed outcomes
  { type: 'food', date: '2024-01-01T08:00', sensitivities: ['dairy'] },
  { type: 'wellness', date: '2024-01-02T10:00', stomach: 'Poor' },
  { type: 'food', date: '2024-01-05T08:00', sensitivities: ['dairy'] },
  { type: 'wellness', date: '2024-01-06T10:00', stomach: 'Good' },
  { type: 'food', date: '2024-01-10T08:00', sensitivities: ['dairy'] },
  { type: 'wellness', date: '2024-01-11T10:00', stomach: 'Poor' },

  // Gluten entries with high correlation
  { type: 'food', date: '2024-01-03T12:00', sensitivities: ['gluten'] },
  { type: 'wellness', date: '2024-01-04T14:00', stomach: 'Poor' },
  { type: 'food', date: '2024-01-08T12:00', sensitivities: ['gluten'] },
  { type: 'wellness', date: '2024-01-09T14:00', stomach: 'Poor' },
  { type: 'food', date: '2024-01-15T12:00', sensitivities: ['gluten'] },
  { type: 'wellness', date: '2024-01-16T14:00', stomach: 'Poor' }
];

const SensitivityCorrelation = ({ history = demoHistory }) => {
  const calculateSensitivityCorrelations = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const dailySensitivities = new Map();
    const wellnessScores = new Map();
    
    data.forEach(entry => {
      if (!entry || !entry.date) return;
      
      const date = entry.date.split('T')[0];
      
      if (entry.type === 'food' && Array.isArray(entry.sensitivities)) {
        if (!dailySensitivities.has(date)) {
          dailySensitivities.set(date, new Set());
        }
        entry.sensitivities.forEach(s => 
          dailySensitivities.get(date).add(s)
        );
      } else if (entry.type === 'wellness' && entry.stomach) {
        wellnessScores.set(date, entry.stomach);
      }
    });

    const stats = new Map();

    dailySensitivities.forEach((sensitivities, date) => {
      sensitivities.forEach(sensitivity => {
        if (!stats.has(sensitivity)) {
          stats.set(sensitivity, { total: 0, lowScores: 0 });
        }
        
        stats.get(sensitivity).total++;
        
        const dateObj = new Date(date);
        let hasLowScore = false;
        
        for (let i = 0; i < 2; i++) {
          dateObj.setDate(dateObj.getDate() + 1);
          const checkDate = dateObj.toISOString().split('T')[0];
          const score = wellnessScores.get(checkDate);
          if (score === 'Poor' || score === 'Very Poor') {
            hasLowScore = true;
            break;
          }
        }
        
        if (hasLowScore) {
          stats.get(sensitivity).lowScores++;
        }
      });
    });

    return Array.from(stats.entries())
      .map(([sensitivity, counts]) => ({
        name: sensitivity,
        percentage: Math.round((counts.lowScores / counts.total) * 100),
        total: counts.total
      }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.percentage - a.percentage);
  };

  const data = calculateSensitivityCorrelations(history);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            No sensitivity data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {data.map(item => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium capitalize">{item.name}</span>
                <span className="text-sm text-gray-600">
                  {item.total} {item.total === 1 ? 'occurrence' : 'occurrences'}
                </span>
              </div>
              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                >
                  <div className="h-full flex items-center justify-end pr-2">
                    <span className="text-white text-sm font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-sm text-gray-600 text-center">
          Percentage of times each sensitivity was followed by low stomach comfort within 48 hours
        </div>
      </CardContent>
    </Card>
  );
};

export default SensitivityCorrelation;