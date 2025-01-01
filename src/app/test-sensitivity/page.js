import React from 'react';
import SensitivityCorrelation from '@/components/SensitivityCorrelation';

const TestPage = () => {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sensitivity Analysis</h1>
      <SensitivityCorrelation />
    </div>
  );
};

export default TestPage;