"use client"

import { useState } from 'react';
import { History, Plus, User, LineChart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AddOptionsMenu from './AddOptionsMenu';

const BottomNav = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <AddOptionsMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around">
        <Link 
          href="/history" 
          className={`flex flex-col items-center p-2 ${pathname === '/history' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <History size={24} />
          <span className="text-xs">History</span>
        </Link>
        
        {/* Center Add Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`relative -mt-6 rounded-full bg-blue-500 p-4 text-white shadow-lg transition-transform ${
            isMenuOpen ? 'rotate-45' : ''
          }`}
        >
          <Plus size={24} />
        </button>
        
        <Link 
          href="/insights" 
          className={`flex flex-col items-center p-2 ${pathname === '/insights' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <LineChart size={24} />
          <span className="text-xs">Insights</span>
        </Link>
        
        <Link 
          href="/profile" 
          className={`flex flex-col items-center p-2 ${pathname === '/profile' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <User size={24} />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </>
  );
};

export default BottomNav;