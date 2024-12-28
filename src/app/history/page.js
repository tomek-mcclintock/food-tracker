// src/app/history/page.js
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import EditEntry from '@/components/EditEntry';

const History = () => {
  const { history, editEntry, deleteEntry } = useFoodHistory();
  const [editingIndex, setEditingIndex] = useState(null);

  return (
    <div className="pb-20">
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Details</th>
                  <th className="p-2 text-left w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr className="border-b">
                    <td className="p-2" colSpan={4}>No entries yet</td>
                  </tr>
                ) : (
                  history.map((entry, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{entry.date}</td>
                      <td className="p-2">
                        {entry.type === 'wellness' ? 'Daily Check' : 'Food'}
                      </td>
                      <td className="p-2">
                        {entry.type === 'wellness' ? (
                          <div>
                            <p>Stomach: {entry.stomach}</p>
                            <p>Energy: {entry.energy}</p>
                          </div>
                        ) : (
                          <div>
                            <p><strong>{entry.food}</strong></p>
                            <p className="text-sm">{entry.ingredients}</p>
                            {entry.sensitivities && entry.sensitivities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {entry.sensitivities.map((item, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingIndex(index)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEntry(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingIndex !== null && (
        <EditEntry
          entry={history[editingIndex]}
          onSave={(updatedEntry) => {
            editEntry(editingIndex, updatedEntry);
            setEditingIndex(null);
          }}
          onCancel={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
};

export default History;