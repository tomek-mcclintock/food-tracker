// src/components/AddOptionsMenu.js
"use client"

import React from 'react';
import Link from 'next/link';
import { Camera, ImagePlus, Type, Barcode, History } from 'lucide-react';

const AddOptionsMenu = ({ isOpen, onClose }) => {
  const options = [
    { icon: <Camera className="w-6 h-6" />, label: 'Take Photo', href: '/add?mode=camera' },
    { icon: <ImagePlus className="w-6 h-6" />, label: 'Upload Photo', href: '/add?mode=upload' },
    { icon: <Type className="w-6 h-6" />, label: 'Describe Food', href: '/add?mode=text' },
    { icon: <Barcode className="w-6 h-6" />, label: 'Scan Barcode', href: '/add?mode=barcode' },
    { icon: <History className="w-6 h-6" />, label: 'Previous Foods', href: '/add?mode=previous' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl p-2 w-64 animate-fade-in">
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