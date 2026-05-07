import React from 'react';
import { X, Lightbulb, Target, Wrench, BarChart2 } from 'lucide-react';

interface TutorialOverlayProps {
    onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-sky-900 border border-sky-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-pop-in">
                <div className="flex justify-between items-center bg-sky-800 p-6 border-b border-sky-700">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Rocket className="h-6 w-6 text-orange-500" />
                        ¿Cómo usar S.H.I.P. Helper?
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        aria-label="Cerrar tutorial"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-12">
                        <section className="flex gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                                    <Lightbulb className="h-6 w-6 text-orange-500" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">1. Solve (Resolver)</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    Empieza definiendo el problema que quieres resolver. No te preocupes si no es perfecto; la IA te hará preguntas críticas para ayudarte a refinar el planteamiento y encontrar la verdadera raíz del problema.
                                </p>
                            </div>
                        </section>

                        <section className="flex gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
                                    <Target className="h-6 w-6 text-sky-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">2. Hypothesize (Hipotetizar)</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    Crea una hipótesis clara. Define qué crees que sucederá al implementar una solución específica para un público determinado. La IA te ayudará a estructurarla de forma que sea medible y válida.
                                </p>
                            </div>
                        </section>

                        <section className="flex gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                                    <Wrench className="h-6 w-6 text-emerald-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">3. Implement (Implementar)</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    Diseña tu MVP (Producto Mínimo Viable). Enfócate en las características esenciales para probar tu hipótesis. La IA te sugerirá qué construir primero y qué omitir para ahorrar tiempo y recursos.
                                </p>
                            </div>
                        </section>

                        <section className="flex gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                                    <BarChart2 className="h-6 w-6 text-purple-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">4. Persevere (Perseverar)</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    Analiza los resultados de tus pruebas. ¿Los datos respaldan tu hipótesis? La IA te ayudará a interpretar los resultados y decidir si debes continuar con el plan original o pivotar hacia una nueva dirección.
                                </p>
                            </div>
                        </section>
                    </div>

                    <div className="mt-12 p-6 bg-sky-800/50 rounded-xl border border-sky-700">
                        <h4 className="font-bold text-slate-200 mb-2">💡 Tips Pro:</h4>
                        <ul className="list-disc list-inside text-slate-400 text-sm space-y-2">
                            <li>Usa el **Asistente de Voz** (icono de micrófono) para dictar tus ideas si estás en movimiento.</li>
                            <li>Guarda tus proyectos para verlos más tarde en la **Base de Datos**.</li>
                            <li>Exporta tus análisis a **PDF** para compartirlos con tu equipo o clientes.</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-sky-800 p-6 flex justify-center">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                        ¡Entendido, vamos allá!
                    </button>
                </div>
            </div>
        </div>
    );
};

// Internal Import helper
import { Rocket } from 'lucide-react';

export default TutorialOverlay;
