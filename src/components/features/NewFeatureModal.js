// src/components/features/NewFeatureModal.js
"use client"

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NewFeatureModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (title.length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    if (description.length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }
    
    onSubmit({
      title,
      description,
      votes: 0,
      hasVoted: false,
      createdAt: new Date().toISOString(),
    });
  };

  return (
<div className="fixed inset-0 z-50 bg-red-500">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl animate-fade-in">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Suggest a Feature</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border rounded-xl"
                placeholder="Brief title for your feature idea"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1">
                {title.length}/100 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border rounded-xl resize-none"
                rows={4}
                placeholder="Explain your idea in detail..."
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Submit
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewFeatureModal;
