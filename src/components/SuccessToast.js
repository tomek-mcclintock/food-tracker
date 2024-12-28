// src/components/SuccessToast.js
import { CheckCircle2 } from 'lucide-react';

export default function SuccessToast({ message }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-50 text-green-600 px-6 py-4 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
      <CheckCircle2 className="w-5 h-5" />
      <span className="font-medium">{message}</span>
    </div>
  );
}