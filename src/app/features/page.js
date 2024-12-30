// src/app/features/page.js
"use client"

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/features/FeatureCard';
import NewFeatureModal from '@/components/features/NewFeatureModal';

const initialFeatures = [
  {
    id: 1,
    title: "Meal Planning Based on Sensitivities",
    description: "Get personalized meal suggestions based on your identified food sensitivities and preferences. Including recipe alternatives and ingredient substitutions.",
    votes: 42,
    hasVoted: false
  },
  {
    id: 2,
    title: "Share Food Diary with Healthcare Provider",
    description: "Export or directly share your food diary and sensitivity patterns with your doctor, nutritionist, or other healthcare providers.",
    votes: 38,
    hasVoted: false
  },
  {
    id: 3,
    title: "Restaurant Menu Scanner",
    description: "Scan restaurant menus to instantly identify dishes that match your sensitivity profile, with warnings for potentially problematic ingredients.",
    votes: 35,
    hasVoted: false
  },
  {
    id: 4,
    title: "Symptom Severity Tracking",
    description: "Add detailed symptom tracking with customizable severity scales and the ability to note duration and specific symptoms.",
    votes: 31,
    hasVoted: false
  },
  {
    id: 5,
    title: "Barcode Scanner for Packaged Foods",
    description: "Scan product barcodes to instantly check ingredients against your sensitivity profile and get alternatives suggestions.",
    votes: 29,
    hasVoted: false
  },
  {
    id: 6,
    title: "Cross-Contamination Warnings",
    description: "Get alerts about potential cross-contamination risks when logging meals, especially useful for severe allergies.",
    votes: 27,
    hasVoted: false
  },
  {
    id: 7,
    title: "Weekly/Monthly Sensitivity Reports",
    description: "Receive detailed reports showing patterns in your sensitivities, including most problematic ingredients and improvement trends.",
    votes: 24,
    hasVoted: false
  },
  {
    id: 8,
    title: "Shopping List Generator",
    description: "Create shopping lists based on your safe foods and get warnings about products that might contain trigger ingredients.",
    votes: 22,
    hasVoted: false
  },
  {
    id: 9,
    title: "Multiple Profiles for Family Members",
    description: "Add multiple profiles to track sensitivities for different family members, with separate logs and analyses.",
    votes: 19,
    hasVoted: false
  },
  {
    id: 10,
    title: "Recipe Import & Analysis",
    description: "Import recipes from popular cooking websites and automatically analyze them for potential trigger ingredients.",
    votes: 17,
    hasVoted: false
  }
];

export default function Features() {
  const [features, setFeatures] = useState(initialFeatures);
  const [showNewFeature, setShowNewFeature] = useState(false);

  const handleVote = (id) => {
    setFeatures(features.map(feature => {
      if (feature.id === id) {
        if (feature.hasVoted) {
          return { ...feature, votes: feature.votes - 1, hasVoted: false };
        } else {
          return { ...feature, votes: feature.votes + 1, hasVoted: true };
        }
      }
      return feature;
    }));
  };

  const handleNewFeature = (newFeature) => {
    const featureWithId = {
      ...newFeature,
      id: Math.max(...features.map(f => f.id)) + 1
    };
    setFeatures([...features, featureWithId]);
    setShowNewFeature(false);
  };

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
          .sort((a, b) => b.votes - a.votes)
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
          onSubmit={handleNewFeature}
        />
      )}
    </div>
  );
}