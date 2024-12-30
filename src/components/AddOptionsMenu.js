// src/components/AddOptionsMenu.js
"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera, ImagePlus, Type, Barcode, History } from 'lucide-react';

const AddOptionsMenu = ({ isOpen, onClose }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timeout = setTimeout(() => {
        setIsRendered(false);
      }, 300); // Match this with CSS transition duration
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const options = [
    { icon: <Camera className="w-6 h-6" />, label: 'Take Photo', href: '/add?mode=camera' },
    { icon: <ImagePlus className="w-6 h-6" />, label: 'Upload Photo', href: '/add?mode=upload' },
    { icon: <Type className="w-6 h-6" />, label: 'Describe Food', href: '/add?mode=text' },
    { icon: <Barcode className="w-6 h-6" />, label: 'Scan Barcode', href: '/add?mode=barcode' },
    { icon: <History className="w-6 h-6" />, label: 'From History', href: '/add?mode=previous' },
  ];

  if (!isRendered && !isOpen) return null;

  return (
    <>
      {/* Backdrop with fade transition */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Menu with slide-up animation */}
      <div 
        className={`fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl p-2 w-64 transition-transform duration-300 ${
          isOpen ? 'animate-slide-up' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="grid gap-2">
          {options.map((option, index) => (
            <Link
              key={index}
              href={option.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                {option.icon}
              </div>
              <span className="font-medium">{option.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default AddOptionsMenu;