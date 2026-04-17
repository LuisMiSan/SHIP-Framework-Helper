import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Ocurrió un error inesperado.";
      
      try {
        // Check if it's a Firestore error JSON as per critical instructions
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.operationType) {
           if (parsed.error.includes("insufficient permissions")) {
             errorMessage = "No tienes permisos suficientes para realizar esta operación en la base de datos.";
           } else {
             errorMessage = `Error de Base de Datos: ${parsed.error}`;
           }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-sky-950 p-6">
          <div className="bg-sky-900 border border-red-500 p-8 rounded-2xl max-w-lg shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-red-400 mb-4">¡Ups! Algo salió mal</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              onClick={() => window.location.reload()}
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
