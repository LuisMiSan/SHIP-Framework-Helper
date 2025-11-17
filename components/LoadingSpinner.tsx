import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="text-center py-4">
      <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-2 text-sm text-slate-400">La IA está trabajando...</p>
    </div>
  );
};

export default LoadingSpinner;