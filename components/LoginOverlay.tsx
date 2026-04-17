import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn } from 'lucide-react';

const LoginOverlay: React.FC = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-sky-950 flex flex-col items-center justify-center p-4 z-[100] text-center">
      <div className="max-w-md w-full animate-fade-in-up">
        <h1 className="text-6xl font-extrabold text-slate-100 mb-6 font-sans">
          S.H.I.P.
        </h1>
        <p className="text-xl text-slate-300 mb-10 leading-relaxed font-sans">
          Bienvenido al Framework Helper. Por favor, inicia sesión para gestionar tus proyectos de forma segura.
        </p>
        
        <button
          onClick={handleLogin}
          className="flex items-center justify-center gap-3 w-full bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all transform hover:scale-105 shadow-xl"
        >
          <LogIn className="w-6 h-6" />
          Continuar con Google
        </button>
        
        <p className="mt-8 text-slate-500 text-sm italic">
          Tus datos se guardan de forma privada en la nube.
        </p>
      </div>
    </div>
  );
};

export default LoginOverlay;
