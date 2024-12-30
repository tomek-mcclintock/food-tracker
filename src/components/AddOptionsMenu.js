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
      }, 300);
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
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bottom-16 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Menu */}
      <div 
        className={`fixed bottom-24 left-1/2 z-30 ${
          isOpen ? 'animate-slide-up' : 'translate-y-full opacity-0'
        } transition-all duration-300 ease-out`}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-3 w-72">
          <div className="grid gap-2">
            {options.map((option, index) => (
              <Link
                key={index}
                href={option.href}
                className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-md active:scale-98"
                onClick={onClose}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
                  <div className="text-blue-600">
                    {option.icon}
                  </div>
                </div>
                <span className="font-medium text-gray-700">{option.label}</span>
              </Link>
            ))}
          </div>
        </div>
        {/* Decorative bottom notch */}
        <div className="w-4 h-4 bg-white transform rotate-45 translate-y-1/2 mx-auto -mt-2 shadow-lg" />
      </div>
    </>
  );
};

export default AddOptionsMenu;