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

    return history
      .filter(entry => 
        entry.type === 'wellness' && 
        new Date(entry.date) > startDate
      )
      .map(entry => ({
        timestamp: new Date(entry.date).getTime(),
        date: new Date(entry.date).toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short'
        }),
        stomach: wellnessToNumber[entry.stomach],
        energy: wellnessToNumber[entry.energy],
        tooltipDate: new Date(entry.date).toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [history, timeRange]);

  const CustomTooltip = ({ active, payload }) => {
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
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-xs font-medium mb-1">{payload[0]?.payload.tooltipDate}</p>
          <p className="text-xs text-blue-500">
            Stomach: {getLabel(payload[0]?.value)}
          </p>
          <p className="text-xs text-green-500">
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

  // Format tick based on position
  const formatXAxisTick = (timestamp, index, array) => {
    if (index === 0 || index === array.length - 1 || index === Math.floor(array.length / 2)) {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
    return '';
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

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredAndProcessedData}
              margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="timestamp"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(val, index) => formatXAxisTick(val, index, filteredAndProcessedData)}
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={getYAxisLabel}
                tick={{ fontSize: 11 }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={30}
                wrapperStyle={{
                  fontSize: '11px',
                  marginTop: '10px'
                }}
              />
              <Line
                type="monotone"
                dataKey="stomach"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Stomach Comfort"
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Energy Level"
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessTrends;