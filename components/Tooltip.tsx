import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  tip: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, tip }) => {
  return (
    <div className="relative inline-block group">
      {children}
      <div 
        className="absolute bottom-full mb-2 w-max max-w-xs p-3 text-sm bg-gray-700 text-gray-100 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 transform -translate-x-1/2 left-1/2"
        role="tooltip"
      >
        {tip}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700"></div>
      </div>
    </div>
  );
};

export default Tooltip;