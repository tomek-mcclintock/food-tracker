'use client'

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TimeRangeButton = ({ selected, onClick, children }) => (
  <Button
    variant={selected ? "default" : "outline"}
    onClick={onClick}
    className="px-3 py-2"
  >
    {children}
  </Button>
);

const WellnessTrends = ({ history }) => {
  const [timeRange, setTimeRange] = useState('week');

  const wellnessToNumber = {
    'Very Poor': 1,
    'Poor': 2,
    'Okay': 3,
    'Good': 4,
    'Excellent': 5,
    'Very Low': 1,
    'Low': 2,
    'Moderate': 3,
    'High': 4,
    'Very High': 5
  };

  const filteredAndProcessedData = useMemo(() => {
    if (!history) return [];

    // Calculate start date based on selected time range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate = new Date(0);
    }

    const wellnessEntries = history
      .filter(entry => 
        entry.type === 'wellness' && 
        new Date(entry.date) > startDate
      )
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit'
        }),
        stomach: wellnessToNumber[entry.stomach],
        energy: wellnessToNumber[entry.energy],
        tooltipDate: new Date(entry.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return wellnessEntries;
  }, [history, timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const getLabel = (value) => {
        const ratings = [
          'Very Poor/Low', 
          'Poor/Low', 
          'Okay/Moderate', 
          'Good/High', 
          'Excellent/Very High'
        ];
        return ratings[value - 1];
      };

      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-medium mb-2">{payload[0]?.payload.tooltipDate}</p>
          <p className="text-blue-500">
            Stomach: {getLabel(payload[0]?.value)}
          </p>
          <p className="text-green-500">
            Energy: {getLabel(payload[1]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getYAxisLabel = (value) => {
    const labels = ['Very Poor', 'Poor', 'Okay', 'Good', 'Excellent'];
    return labels[value - 1] || '';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-2 mb-6">
          <TimeRangeButton
            selected={timeRange === 'week'}
            onClick={() => setTimeRange('week')}
          >
            Week
          </TimeRangeButton>
          <TimeRangeButton
            selected={timeRange === 'month'}
            onClick={() => setTimeRange('month')}
          >
            Month
          </TimeRangeButton>
          <TimeRangeButton
            selected={timeRange === '3months'}
            onClick={() => setTimeRange('3months')}
          >
            3 Months
          </TimeRangeButton>
          <TimeRangeButton
            selected={timeRange === 'all'}
            onClick={() => setTimeRange('all')}
          >
            All
          </TimeRangeButton>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredAndProcessedData}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveEnd"
                tickMargin={10}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={getYAxisLabel}
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="stomach"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Stomach Comfort"
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Energy Level"
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessTrends;