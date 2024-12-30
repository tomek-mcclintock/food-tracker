// src/components/food/modes/UploadMode.js
"use client"

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const UploadMode = ({ onFileSelect, onCancel }) => {
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Automatically trigger file dialog when component mounts
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image too large. Please choose an image under 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => onFileSelect(reader.result);
      reader.readAsDataURL(file);
    } else {
      onCancel();
    }
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/jpeg,image/png"
      className="hidden"
      onChange={handleFileChange}
      onCancel={onCancel}
    />
  );
};

export default UploadMode;