"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ImagePlus, Type, Barcode, History, CheckCircle } from 'lucide-react';

const AddOptionsMenu = ({ isOpen, onClose, onCheckIn }) => {
  const [isRendered, setIsRendered] = useState(false);
  const router = useRouter();
  
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

  const handleOptionClick = (option) => {
    onClose();
    if (option.action) {
      option.action();
    } else if (option.href) {
      router.push(option.href);
    }
  };

  const options = [
    { 
      icon: <Camera className="w-6 h-6" />, 
      label: 'Take Photo',
      href: '/add?mode=camera',
    },
    { 
      icon: <ImagePlus className="w-6 h-6" />, 
      label: 'Upload Photo',
      href: '/add?mode=upload',
    },
    { 
      icon: <Type className="w-6 h-6" />, 
      label: 'Describe Food',
      href: '/add',
    },
    { 
      icon: <Barcode className="w-6 h-6" />, 
      label: 'Scan Barcode',
      disabled: true,
      comingSoon: true,
    },
    { 
      icon: <History className="w-6 h-6" />, 
      label: 'From History',
      disabled: true,
      comingSoon: true,
    },
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
      <div className="fixed bottom-24 left-0 right-0 z-30">
        <div 
          className={`relative mx-auto w-72 ${
            isOpen ? 'animate-slide-up' : 'translate-y-full opacity-0'
          } transition-all duration-300 ease-out`}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-2">
            <div className="grid gap-1">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 w-full text-left
                    ${option.disabled 
                      ? 'opacity-70 cursor-default' 
                      : 'hover:bg-gray-50 hover:shadow-md active:scale-98'
                    }`}
                  onClick={() => !option.disabled && handleOptionClick(option)}
                  disabled={option.disabled}
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
                    <div className="text-blue-600">
                      {option.icon}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block">{option.label}</span>
                    {option.comingSoon && (
                      <span className="text-xs text-gray-400">Coming soon</span>
                    )}
                  </div>
                </button>
              ))}

              {/* Separate Check In option */}
              <button
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-green-50 transition-all duration-200 hover:shadow-md active:scale-98 mt-1 border-t border-gray-100 pt-3 w-full text-left wellness-button"
                onClick={() => {
                  onClose();
                  onCheckIn();
                }}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-sm">
                  <div className="text-green-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <span className="font-medium text-green-700">Check In</span>
              </button>
            </div>
          </div>
          {/* Decorative bottom notch */}
          <div className="absolute w-4 h-4 bg-white transform rotate-45 bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 shadow-lg" />
        </div>
      </div>
    </>
  );
};

export default AddOptionsMenu;
