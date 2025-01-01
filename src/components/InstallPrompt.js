"use client";

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const pathname = usePathname();

  // Check if we're on login/signup pages
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    const checkInstallState = () => {
      // Check if already installed as PWA
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return false;
      }

      // Always show on login/signup pages unless dismissed in current session
      if (pathname === '/login' || pathname === '/signup') {
        return true;
      }

      // For other pages, check localStorage
      const hasInteracted = localStorage.getItem('installBannerInteracted');
      return !hasInteracted;
    };

    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Only show if not previously interacted
    if (checkInstallState()) {
      // Store the install prompt event
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setInstallPrompt(e);
        setShowBanner(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      // For iOS or when no install prompt is triggered immediately
      if (isIOSDevice || !installPrompt) {
        setShowBanner(true);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, [pathname]); // Add pathname to dependencies

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    // Only store in localStorage if not on login/signup pages
    if (pathname !== '/login' && pathname !== '/signup') {
      localStorage.setItem('installBannerInteracted', 'true');
    }
    setShowBanner(false);
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    // Only store in localStorage if not on login/signup pages
    if (pathname !== '/login' && pathname !== '/signup') {
      localStorage.setItem('installBannerInteracted', 'true');
    }
    setShowBanner(false);
  };

  if (!showBanner || (!installPrompt && !isIOS)) return null;

  return (
    <div className={`fixed left-4 right-4 bg-white rounded-lg shadow-lg border p-4 animate-slide-up z-50 
      ${isAuthPage ? 'bottom-4' : 'bottom-20'}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-medium mb-1">Install Food Tracker</h3>
          {isIOS ? (
            <p className="text-sm text-gray-600">
              Tap the share button and select "Add to Home Screen" to install
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Install this app on your device for easy access anytime
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!isIOS && (
            <Button onClick={handleInstallClick} className="shrink-0">
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
