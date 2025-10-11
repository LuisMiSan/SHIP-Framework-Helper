import React from 'react';

interface WelcomeScreenProps {
  onStartNew: () => void;
  onViewArchive: () => void;
  hasArchive: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartNew, onViewArchive, hasArchive }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in-up" style={{ minHeight: '60vh' }}>
      <p className="text-xl font-semibold text-indigo-400 mb-2">Tu Asistente de IA para Productos</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 max-w-2xl">
        Estructura, refina y planifica tus ideas con el framework SHIP.
      </h2>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onStartNew}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg text-xl hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20"
        >
          🚀 Empezar un Nuevo Proyecto
        </button>
        {hasArchive && (
          <button
            onClick={onViewArchive}
            className="px-8 py-4 bg-gray-700 text-white font-bold rounded-lg text-xl hover:bg-gray-600 transition-colors"
          >
            📂 Ver Proyectos Guardados
          </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;