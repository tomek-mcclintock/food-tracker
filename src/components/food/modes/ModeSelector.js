// src/components/food/modes/ModeSelector.js
"use client"

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TextMode from './TextMode';
import CameraMode from './CameraMode';
import UploadMode from './UploadMode';

const ModeSelector = ({ onImageCapture, onAnalyze }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode');

  const handleCancel = () => {
    router.push('/add');
  };

  switch (mode) {
    case 'camera':
      return (
        <CameraMode 
          onCapture={onImageCapture}
          onCancel={handleCancel}
        />
      );
    
    case 'upload':
      return (
        <UploadMode 
          onFileSelect={onImageCapture}
          onCancel={handleCancel}
        />
      );
    
    default:
      return (
        <TextMode onAnalyze={onAnalyze} />
      );
  }
};

export default ModeSelector;