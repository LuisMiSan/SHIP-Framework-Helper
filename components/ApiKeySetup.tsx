import React from 'react';

interface ApiKeySetupProps {
  reason: 'missing' | 'invalid';
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ reason }) => {
  const isInvalid = reason === 'invalid';

  const title = isInvalid
    ? 'Error: API Key de Gemini Inválida o Inactiva'
    : 'Configuración Requerida: API Key de Gemini';

  const description = isInvalid
    ? 'La llamada a la API de Gemini falló. Esto suele ocurrir porque la clave proporcionada no es válida, ha sido revocada o el proyecto asociado tiene algún problema de configuración.'
    : 'Para utilizar las funciones de IA de esta aplicación, necesitas configurar tu propia API key de Google Gemini.';


  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-2xl border border-red-300 text-center animate-fade-in-up">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="text-3xl font-bold text-red-700 mb-4">{title}</h1>
        <p className="text-lg text-slate-600 mb-6">
          {description}
        </p>
        
        {isInvalid && (
          <div className="text-left bg-slate-50/50 p-6 rounded-md border border-slate-200 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Guía de Solución de Problemas</h2>
            <ul className="list-disc list-inside space-y-3 text-slate-600">
              <li>
                <strong>Clave mal copiada:</strong> Asegúrate de haber copiado la clave completa sin espacios adicionales al principio o al final.
              </li>
              <li>
                <strong>Permisos incorrectos:</strong> Verifica que tu API Key tiene los permisos necesarios para usar los modelos de Gemini.
              </li>
              <li>
                <strong>API no habilitada:</strong> Confirma que la "Generative Language API" está habilitada en tu proyecto de Google Cloud.
              </li>
              <li>
                <strong>Consulta la documentación:</strong> Para más ayuda, visita la <a href="https://ai.google.dev/gemini-api/docs/troubleshooting" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 underline">guía oficial de solución de problemas</a>.
              </li>
            </ul>
          </div>
        )}

        <div className="text-left bg-slate-100 p-6 rounded-md border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">Pasos para Configurar tu API Key:</h2>
          <ol className="list-decimal list-inside space-y-3 text-slate-600">
            <li>
              Obtén una nueva API key desde <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 underline">Google AI Studio</a>.
            </li>
            <li>
              En el panel de configuración de esta herramienta, busca la sección de "Secret Keys" o "Variables de Entorno".
            </li>
            <li>
              Crea o actualiza el "secret" con el nombre exacto <code className="bg-slate-200 text-purple-700 px-2 py-1 rounded-md text-sm font-mono">API_KEY</code>.
            </li>
            <li>
              Pega la nueva clave que obtuviste de AI Studio como valor del secret.
            </li>
            <li>
              Guarda los cambios y refresca esta página. La aplicación debería funcionar correctamente.
            </li>
          </ol>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Tu API key se almacena de forma segura y solo se utiliza para comunicarse con la API de Gemini desde tu navegador.
        </p>
      </div>
    </div>
  );
};

export default ApiKeySetup;