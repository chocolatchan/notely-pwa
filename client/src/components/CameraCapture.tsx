import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Check, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        setStream(currentStream);
        if (videoRef.current) videoRef.current.srcObject = currentStream;
      } catch {
        setError('Camera access denied.');
      }
    };
    startCamera();
    return () => { currentStream?.getTracks().forEach(t => t.stop()); };
  }, []);

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    setCapturedImage(canvasRef.current.toDataURL('image/jpeg', 0.85));
    stopCamera();
  };

  const handleRetake = async () => {
    setCapturedImage(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, audio: false,
      });
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch {
      setError('Could not access camera.');
    }
  };

  const handleConfirm = () => {
    if (capturedImage) { onCapture(capturedImage); onClose(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: '#000',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* ── Top Bar ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 32px',
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10
      }}>
        <button onClick={onClose} style={{ color: '#FFF', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: 8 }}>
          <X size={20} />
        </button>
      </header>

      {/* ── Viewfinder ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#FFF' }}>
            <Camera size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p className="text-body" style={{ color: '#FFF' }}>{error}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      {/* ── Controls ── */}
      <div style={{
        padding: '32px 24px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 40,
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10
      }}>
        {capturedImage ? (
          <>
            <button
              onClick={handleRetake}
              style={{ padding: '12px 24px', borderRadius: 40, background: 'rgba(255,255,255,0.1)', color: '#FFF', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
              className="hover:bg-white/20 transition-colors"
            >
              <RotateCcw size={16} /> Retake
            </button>
            <button
              onClick={handleConfirm}
              style={{ padding: '12px 24px', borderRadius: 40, background: '#FFF', color: '#000', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}
            >
              <Check size={16} /> Use Photo
            </button>
          </>
        ) : (
          <button
            onClick={takePhoto}
            disabled={!!error}
            style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: '#FFF',
              border: '4px solid rgba(255,255,255,0.3)',
              backgroundClip: 'padding-box',
              cursor: error ? 'not-allowed' : 'pointer',
              opacity: error ? 0.4 : 1,
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </motion.div>
  );
};

export default CameraCapture;
