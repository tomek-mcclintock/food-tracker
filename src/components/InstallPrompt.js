"use client"

import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Store the install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
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
    
    // Clear the saved prompt
    setInstallPrompt(null);
  };

  if (!installPrompt && !isIOS) return null;

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
        {!isIOS && (
          <Button onClick={handleInstallClick} className="shrink-0">
            <Download className="w-4 h-4 mr-2" />
            Install
          </Button>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;