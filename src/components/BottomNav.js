"use client"

import { useState } from 'react';
import { History, Plus, User, LineChart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AddOptionsMenu from './AddOptionsMenu';
import WellnessCheck from './WellnessCheck';
import { useFoodHistory } from '@/hooks/useFoodHistory';

const BottomNav = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWellnessCheck, setShowWellnessCheck] = useState(false);
  const { addEntry } = useFoodHistory();

  // Add this check to hide navbar on login and signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <>
      <AddOptionsMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onCheckIn={() => setShowWellnessCheck(true)}
      />
      
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t z-40">
        <div className="max-w-lg mx-auto h-full flex items-center justify-between px-4">
          <Link 
            href="/features" 
            className={`flex flex-col items-center w-16 p-2 ${pathname === '/features' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Sparkles className="w-6 h-6" />
            <span className="text-xs mt-0.5">Features</span>
          </Link>
          
          <Link 
            href="/history" 
            className={`flex flex-col items-center w-16 p-2 ${pathname === '/history' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <History className="w-6 h-6" />
            <span className="text-xs mt-0.5">History</span>
          </Link>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`relative -mt-6 rounded-full bg-blue-500 p-4 text-white shadow-lg transition-transform ${
              isMenuOpen ? 'rotate-45' : ''
            }`}
          >
            <Plus className="w-6 h-6" />
          </button>
          
          <Link 
            href="/insights" 
            className={`flex flex-col items-center w-16 p-2 ${pathname === '/insights' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <LineChart className="w-6 h-6" />
            <span className="text-xs mt-0.5">Insights</span>
          </Link>
          
          <Link 
            href="/profile" 
            className={`flex flex-col items-center w-16 p-2 ${pathname === '/profile' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-0.5">Profile</span>
          </Link>
        </div>
        </div>

      {showWellnessCheck && (
        <WellnessCheck
          onClose={() => setShowWellnessCheck(false)}
          onSubmit={(entry) => {
            addEntry(entry);
            setShowWellnessCheck(false);;
          }}
        />
      )}
    </>
  );
};

export default BottomNav;