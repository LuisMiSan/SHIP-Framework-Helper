import React from 'react';

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-8 md:mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex items-center text-center flex-col sm:flex-row">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                index <= currentStep ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {index + 1}
            </div>
            <p
              className={`mt-2 sm:ml-3 sm:mr-6 font-semibold transition-colors duration-300 text-sm sm:text-base ${
                index <= currentStep ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              {step}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 rounded transition-colors duration-500 mx-2 hidden sm:block ${
                index < currentStep ? 'bg-indigo-500' : 'bg-slate-200'
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressBar;