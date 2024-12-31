import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, subDays, subMonths, startOfDay, isAfter } from 'date-fns';

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

  // Convert wellness ratings to numbers for the graph
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

    // Calculate the start date based on selected time range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Filter and process wellness entries
    return history
      .filter(entry => 
        entry.type === 'wellness' && 
        isAfter(new Date(entry.date), startOfDay(startDate))
      )
      .map(entry => ({
        date: format(new Date(entry.date), 'MMM d'),
        stomach: wellnessToNumber[entry.stomach],
        energy: wellnessToNumber[entry.energy],
        tooltipDate: format(new Date(entry.date), 'MMM d, yyyy h:mm a')
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [history, timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const getLabel = (value) => {
        const ratings = ['Very Poor/Low', 'Poor/Low', 'Okay/Moderate', 'Good/High', 'Excellent/Very High'];
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

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredAndProcessedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="stomach"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Stomach Comfort"
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Energy Level"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessTrends;