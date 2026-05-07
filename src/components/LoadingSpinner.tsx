import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin shadow-inner"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-gray-900 font-black tracking-tight text-xl mb-1">Cargando...</p>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">S.H.I.P. Framework Helper</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
