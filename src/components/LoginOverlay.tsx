import React from 'react';
import { LogIn, Sparkles } from 'lucide-react';

interface LoginOverlayProps {
  onLogin: () => void;
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ onLogin }) => {
  return (
    <div className="fixed inset-0 bg-white z-[200] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 relative inline-block">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center transform rotate-12 shadow-2xl shadow-blue-200">
            <Sparkles className="text-white transform -rotate-12" size={48} />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white border-4 border-white">
            <LogIn size={16} />
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
          S.H.I.P. Helper
        </h1>
        <p className="text-gray-500 font-medium mb-12 leading-relaxed">
          Para guardar tus proyectos en la nube y acceder a las funciones avanzadas de IA, necesitas iniciar sesión.
        </p>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 py-4 px-8 rounded-2xl font-bold text-gray-800 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-xl shadow-gray-100 hover:shadow-blue-50 group hover:-translate-y-1"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/instrumentation/google_signin_portal.svg" 
            alt="Google" 
            className="w-6 h-6"
          />
          Continuar con Google
        </button>

        <p className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
          Al continuar aceptas nuestros términos de servicio <br /> 
          y política de privacidad de datos.
        </p>
      </div>
    </div>
  );
};

export default LoginOverlay;
