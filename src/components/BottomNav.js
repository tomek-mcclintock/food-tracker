"use client"

import { History, PlusCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around">
      <Link 
        href="/history" 
        className={`flex flex-col items-center p-2 ${pathname === '/history' ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <History size={24} />
        <span className="text-xs">History</span>
      </Link>
      
      <Link 
        href="/add" 
        className={`flex flex-col items-center p-2 ${pathname === '/add' ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <PlusCircle size={32} />
        <span className="text-xs">Add</span>
      </Link>
      
      <Link 
        href="/profile" 
        className={`flex flex-col items-center p-2 ${pathname === '/profile' ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <User size={24} />
        <span className="text-xs">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNav;