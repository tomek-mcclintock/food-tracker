// src/components/features/FeatureCard.js
"use client"

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeatureCard = ({ feature, onVote }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div 
        className="p-4 flex gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Vote Button */}
        <div className="flex flex-col items-center min-w-[60px]">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onVote(feature.id);
            }}
            variant="ghost"
            className={`px-3 py-2 h-auto flex flex-col gap-1 ${
              feature.hasVoted ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
            }`}
          >
            <ChevronUp className="w-5 h-5" />
            <span className="text-sm font-semibold">{feature.votes}</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 line-clamp-2">{feature.title}</h3>
          {isExpanded && (
            <p className="mt-2 text-gray-600 text-sm">{feature.description}</p>
          )}
        </div>

        {/* Expand indicator */}
        <div className="flex items-center text-gray-400">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;