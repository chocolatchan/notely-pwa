import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, X, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioCaptureProps {
  onCapture: (base64Audio: string, audioBlob: Blob) => void;
  onClose: () => void;
}

const AudioCapture: React.FC<AudioCaptureProps> = ({ onCapture, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const type = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(200); // chunk every 200ms
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Microphone access is required to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleRetake = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
  };

  const handleConfirm = () => {
    if (audioBlob) {
      // Convert to base64 for IndexedDB storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onCapture(base64data, audioBlob);
        onClose();
      };
      reader.readAsDataURL(audioBlob);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ background: '#FFF', borderRadius: 24, padding: 32, width: '90%', maxWidth: 400, boxShadow: 'var(--shadow-lg)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 className="text-h2">Record Voice</h2>
          <button onClick={onClose} className="btn-icon"><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Status Display */}
          <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {audioUrl ? (
              <audio controls src={audioUrl} style={{ height: 40, outline: 'none' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span className="text-h1" style={{ color: isRecording ? '#DC2626' : 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(duration)}
                </span>
                {isRecording && <span className="text-meta" style={{ color: '#DC2626' }}>Recording...</span>}
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {!audioUrl ? (
              isRecording ? (
                <button
                  onClick={stopRecording}
                  style={{ width: 64, height: 64, borderRadius: '50%', border: 'none', background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Square size={24} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  style={{ width: 64, height: 64, borderRadius: '50%', border: 'none', background: 'var(--text-main)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Mic size={24} />
                </button>
              )
            ) : (
              <>
                <button
                  onClick={handleRetake}
                  style={{ padding: '12px 24px', borderRadius: 40, border: '1px solid var(--border-color)', background: '#FFF', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <RotateCcw size={16} /> Retake
                </button>
                <button
                  onClick={handleConfirm}
                  style={{ padding: '12px 24px', borderRadius: 40, border: 'none', background: 'var(--text-main)', color: '#FFF', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Check size={16} /> Save Audio
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AudioCapture;
