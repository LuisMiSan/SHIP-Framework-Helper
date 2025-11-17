import React, { useState, useRef, useCallback, useEffect } from 'react';

interface AudioRecorderButtonProps {
    onRecordingComplete: (blob: Blob) => void;
    disabled?: boolean;
}

const AudioRecorderButton: React.FC<AudioRecorderButtonProps> = ({ onRecordingComplete, disabled }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        if (typeof MediaRecorder === 'undefined') {
            setIsSupported(false);
        }
    }, []);

    const handleStartRecording = useCallback(async () => {
        if (disabled || !navigator.mediaDevices) return;
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
                onRecordingComplete(audioBlob);
                stream.getTracks().forEach(track => track.stop()); // Release microphone
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error starting recording:', err);
            alert('No se pudo iniciar la grabación. Asegúrate de haber dado permiso para usar el micrófono.');
        }
    }, [disabled, onRecordingComplete]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    if (!isSupported) {
        return <p className="text-xs text-red-400">Grabación no soportada.</p>
    }

    const title = isRecording ? "Detener grabación y transcribir" : "Grabar audio para transcribir";

    return (
        <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={disabled}
            className={`flex items-center gap-1.5 text-sm font-semibold py-1.5 px-3 rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500
                ${isRecording 
                    ? 'bg-red-900/50 text-red-300 hover:bg-red-800/50' 
                    : 'bg-sky-700 text-slate-200 hover:bg-sky-600'
                } 
                disabled:bg-sky-900/50 disabled:text-slate-500 disabled:cursor-not-allowed`}
            aria-label={title}
            title={title}
        >
            {isRecording ? (
                 <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm2 5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Detener</span>
                 </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Grabar</span>
                </>
            )}
        </button>
    );
};

export default AudioRecorderButton;