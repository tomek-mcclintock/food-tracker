"use client";

import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstallButton = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

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
    if (isIOS) {
      alert('To install:\n\n1. Tap the ⎙ share button in Safari\'s menu bar\n2. Scroll down and tap "Add to Home Screen"');
      return;
    }
    
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  // Don't show if already installed
  if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      className="w-full"
      disabled={!installPrompt && !isIOS}
    >
      <Download className="w-4 h-4 mr-2" />
      {isIOS ? 'Add to Home Screen' : 'Install App'}
    </Button>
  );
};

export default InstallButton;