// src/components/food/CameraSection.js
"use client"


import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Webcam from 'react-webcam';

export default function CameraSection({ webcamRef, onCapture, onClose }) {
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
          onClick={onCapture}
          size="lg"
          className="w-32 h-32 rounded-full bg-white text-black hover:bg-gray-100"
        >
          <Camera className="w-8 h-8" />
        </Button>
        <Button 
          onClick={onClose}
          size="lg"
          className="absolute top-4 right-4 rounded-full w-12 h-12 bg-black/50 hover:bg-black/70"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}