import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, ChevronRight, RotateCcw, Mic, Play, Square, History } from 'lucide-react';
import { StepData } from '../types';

interface StepCardProps {
  stepData: StepData;
  onInputChange: (value: string) => void;
  onGetAIHelp: () => void;
  validationError: string | null;
  onRestoreAIResponse: (response: string) => void;
  onDictate: (text: string) => void;
  onTranscribeAudio: (blob: Blob) => void;
  onPlaySpeech: (text: string, stepId: string) => void;
  isSpeechPlaying: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ 
  stepData, 
  onInputChange, 
  onGetAIHelp,
  validationError,
  onRestoreAIResponse,
  onDictate,
  onTranscribeAudio,
  onPlaySpeech,
  isSpeechPlaying
}) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onTranscribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl shadow-xl shadow-gray-100 border-2 transition-all p-8 ${
        validationError ? 'border-red-200' : 'border-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-100">
            {stepData.id.toUpperCase()[0]}
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stepData.title}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">S.H.I.P. Phase {stepData.id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button
            onClick={() => onPlaySpeech(stepData.aiResponse || stepData.helpText, stepData.id)}
            className={`p-3 rounded-xl transition-all ${
              isSpeechPlaying 
                ? 'bg-blue-600 text-white animate-pulse' 
                : 'bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title="Escuchar guía"
          >
            {isSpeechPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <div className="group relative">
            <div className="p-3 bg-gray-50 text-gray-400 rounded-xl cursor-help">
              <HelpCircle size={20} />
            </div>
            <div className="absolute right-0 bottom-full mb-3 w-72 p-5 bg-gray-900 text-white text-xs rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-20 leading-relaxed">
              <div className="font-black text-[10px] uppercase tracking-widest mb-2 text-blue-400">Objetivo:</div>
              {stepData.helpText}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {stepData.description.map((part, idx) => (
            typeof part === 'string' ? (
              <span key={idx} className="text-gray-500 font-medium">{part}</span>
            ) : (
              <span key={idx} className="group relative cursor-help">
                <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{part.word}</span>
                <span className="absolute left-0 bottom-full mb-3 w-56 p-4 bg-white text-gray-700 text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-20 border border-gray-100 italic">
                   🚀 <span className="font-bold text-blue-600">Tip Pro:</span> {part.tip}
                </span>
              </span>
            )
          ))}
        </div>

        <div className="relative">
          <textarea
            value={stepData.userInput}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={stepData.placeholder}
            className={`w-full h-48 p-6 bg-gray-50 border-2 rounded-2xl focus:ring-8 focus:ring-blue-50 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-300 resize-none ${
              validationError ? 'border-red-100 focus:border-red-500' : 'border-gray-100 focus:border-blue-500'
            }`}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
               onMouseDown={startRecording}
               onMouseUp={stopRecording}
               onTouchStart={startRecording}
               onTouchEnd={stopRecording}
               className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                 isRecording 
                   ? 'bg-red-600 text-white scale-110 shadow-red-200' 
                   : 'bg-white text-gray-400 hover:text-blue-600 border border-gray-100'
               }`}
               title="Mantén para dictar"
            >
              <Mic size={20} />
            </button>
          </div>
        </div>
        {validationError && (
          <p className="mt-2 text-sm font-bold text-red-500 ml-2">⚠️ {validationError}</p>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <button
          onClick={onGetAIHelp}
          disabled={!stepData.userInput || stepData.isLoading}
          className={`group flex items-center justify-center gap-3 py-5 px-8 rounded-2xl font-black text-lg transition-all ${
            stepData.userInput && !stepData.isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 hover:-translate-y-1'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          {stepData.isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              SINTONIZANDO CON GEMINI...
            </div>
          ) : (
            <>
              <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
              REFINAR ESTRATEGIA CON IA
            </>
          )}
        </button>

        <AnimatePresence>
          {stepData.aiResponse && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-indigo-50/50 border-2 border-indigo-100 rounded-3xl relative">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-[0.2em]">
                      <ChevronRight size={18} />
                      Gemini Strategic Advice
                    </div>
                    {stepData.aiResponseHistory.length > 0 && (
                      <button 
                        onClick={() => {/* Historical overlay could go here if needed */}}
                        className="text-[10px] font-black text-indigo-300 hover:text-indigo-500 uppercase tracking-widest flex items-center gap-1"
                      >
                         <History size={12} /> {stepData.aiResponseHistory.length} Versiones
                      </button>
                    )}
                 </div>
                
                <div className="text-indigo-900 leading-relaxed font-medium whitespace-pre-wrap">
                  {stepData.aiResponse}
                </div>

                {stepData.aiResponseHistory.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-indigo-100/50">
                    <p className="w-full text-[10px] font-black text-indigo-300 uppercase mb-1">Restaurar versión anterior:</p>
                    {stepData.aiResponseHistory.slice(0, 3).map((hist, i) => (
                      <button
                        key={i}
                        onClick={() => onRestoreAIResponse(hist)}
                        className="text-[10px] font-bold bg-white border border-indigo-100 px-3 py-1 transparent text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all underline underline-offset-2"
                      >
                         V{stepData.aiResponseHistory.length - i}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default StepCard;

