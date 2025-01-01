'use client'

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
  { type: 'wellness', date: '2024-01-16T14:00', stomach: 'Poor' },

  // Soy entries with low correlation
  { type: 'food', date: '2024-01-07T13:00', sensitivities: ['soy'] },
  { type: 'wellness', date: '2024-01-08T15:00', stomach: 'Good' },
  { type: 'food', date: '2024-01-12T13:00', sensitivities: ['soy'] },
  { type: 'wellness', date: '2024-01-13T15:00', stomach: 'Good' },
  { type: 'food', date: '2024-01-18T13:00', sensitivities: ['soy'] },
  { type: 'wellness', date: '2024-01-19T15:00', stomach: 'Poor' }
];

export default function SensitivityCorrelation({ history = demoHistory }) {
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, percentage, total } = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium capitalize">{name}</p>
          <p className="text-sm text-gray-600">
            {percentage}% correlation with low stomach comfort
          </p>
          <p className="text-sm text-gray-600">
            Based on {total} {total === 1 ? 'occurrence' : 'occurrences'}
          </p>
        </div>
      );
    }
    return null;
  };

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
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="percentage" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Percentage of times each sensitivity was followed by low stomach comfort within 48 hours
        </div>
      </CardContent>
    </Card>
  );
}