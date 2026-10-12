import React from 'react';
import { Lock, LogOut } from 'lucide-react';

interface PendingApprovalScreenProps {
  email: string | null;
  checkFailed: boolean;
  onLogout: () => void;
}

const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({ email, checkFailed, onLogout }) => {
  return (
    <div className="fixed inset-0 bg-white z-[200] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 inline-flex w-20 h-20 bg-amber-500 rounded-3xl items-center justify-center shadow-2xl shadow-amber-100">
          <Lock className="text-white" size={40} />
        </div>

        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">
          {checkFailed ? 'No pudimos comprobar tu acceso' : 'Cuenta pendiente de aprobación'}
        </h1>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
          {checkFailed
            ? 'Revisa tu conexión y vuelve a intentarlo en unos minutos.'
            : <>Tu cuenta <strong className="text-gray-800">{email}</strong> todavía no tiene acceso. Pide al administrador que la apruebe y vuelve a entrar.</>}
        </p>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 px-8 rounded-2xl font-bold text-gray-800 hover:border-blue-200 hover:bg-blue-50 transition-all"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default PendingApprovalScreen;
