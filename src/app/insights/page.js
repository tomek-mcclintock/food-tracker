"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import { useInsights } from '@/hooks/useInsights';
import WellnessTrends from '@/components/WellnessTrends';
import SensitivityCorrelation from '@/components/SensitivityCorrelation';
import HealthHeatCalendar from '@/components/HealthHeatCalendar';

export default function Insights() {
  const { history } = useFoodHistory();
  const { insights, loading, error, generateInsights } = useInsights();

  const handleRefresh = () => {
    if (history && history.length > 0) {
      generateInsights(history);
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto pb-24 px-4">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
              <p className="text-gray-500">
                Start logging your meals and wellness checks to get personalized insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4">
      <h1 className="text-2xl font-bold mb-4">Your Insights</h1>

      <Tabs defaultValue="ai-review">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="ai-review" className="flex-1">AI Review</TabsTrigger>
          <TabsTrigger value="data" className="flex-1">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-review">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <p>Error generating insights. Please try again later.</p>
                </div>
              </CardContent>
            </Card>
          ) : insights ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg font-medium text-blue-600 mb-4">
                    {insights.mainInsight}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Recent Pattern</h3>
                      <p className="text-gray-600">{insights.recentPattern}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Historical Pattern</h3>
                      <p className="text-gray-600">{insights.historicalPattern}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Suggestion</h3>
                      <p className="text-gray-600">{insights.suggestion}</p>
                    </div>
                    {insights.ingredients && insights.ingredients.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Ingredients to Watch</h3>
                        <div className="flex flex-wrap gap-2">
                          {insights.ingredients.map((ingredient, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                            >
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Click refresh to generate insights from your food diary.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <div>
            <h2 className="font-medium text-gray-900 mb-3">Overview</h2>
            <HealthHeatCalendar history={history} />
          </div>

          <div>
            <h2 className="font-medium text-gray-900 mb-3">Wellness Trends</h2>
            <WellnessTrends history={history} />
          </div>
          
          <div>
            <h2 className="font-medium text-gray-900 mb-3">Sensitivity Correlations</h2>
            <SensitivityCorrelation history={history} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}