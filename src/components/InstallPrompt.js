"use client";

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has dismissed or installed before
    const hasInteractedWithInstall = localStorage.getItem('installBannerInteracted');
    if (hasInteractedWithInstall) return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Store the install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    // Mark as interacted regardless of outcome
    localStorage.setItem('installBannerInteracted', 'true');
    setShowBanner(false);
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('installBannerInteracted', 'true');
    setShowBanner(false);
  };

  if (!showBanner || (!installPrompt && !isIOS)) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border p-4 animate-slide-up">
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