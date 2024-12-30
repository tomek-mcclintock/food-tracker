"use client"

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/features/FeatureCard';
import NewFeatureModal from '@/components/features/NewFeatureModal';
import { useFeatures } from '@/hooks/useFeatures';

export default function Features() {
  const [showNewFeature, setShowNewFeature] = useState(false);
  const { features, loading, handleVote, addFeature } = useFeatures();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto pb-24 px-4">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Feature Requests</h1>
        <Button
          onClick={() => setShowNewFeature(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <div className="space-y-3">
        {features
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(feature => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onVote={handleVote}
            />
          ))}
      </div>

      {showNewFeature && (
        <NewFeatureModal
          onClose={() => setShowNewFeature(false)}
          onSubmit={(newFeature) => {
            addFeature(newFeature);
            setShowNewFeature(false);
          }}
        />
      )}
    </div>
  );
}