// src/components/food/modes/CameraMode.js
"use client"

import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

const CameraMode = ({ onCapture, onCancel }) => {
  const webcamRef = useRef(null);

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: { exact: "environment" }
        }}
        className="h-full w-full object-cover"
      />
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
        <Button 
          onClick={handleCapture}
          size="lg"
          className="w-32 h-32 rounded-full bg-white text-black hover:bg-gray-100"
        >
          <Camera className="w-8 h-8" />
        </Button>
        <Button 
          onClick={onCancel}
          size="lg"
          className="absolute top-4 right-4 rounded-full w-12 h-12 bg-black/50 hover:bg-black/70"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default CameraMode;