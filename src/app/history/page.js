"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('foodHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

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
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr className="border-b">
                    <td className="p-2" colSpan={3}>No entries yet</td>
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
                                {entry.sensitivities.map((item, index) => (
                                  <span
                                    key={index}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;