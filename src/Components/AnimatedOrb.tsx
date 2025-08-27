import React, { useEffect, useMemo, useRef } from 'react';
import { AuraState } from '../types';

interface AnimatedOrbProps {
  auraState: AuraState;
  isListening: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt';
  onRequestPermission: () => void;
}

// Utility: linear interpolation
const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

// Voice‑reactive mesh orb rendered to canvas
export const AnimatedOrb: React.FC<AnimatedOrbProps> = ({
  auraState,
  isListening,
  permissionStatus,
  onRequestPermission
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const levelRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Colors by state (soft neon)
  const colors = useMemo(() => {
    return {
      idle: ['#8ab4ff', '#b39ddb'],
      listening: ['#8ab4ff', '#b39ddb'],
      active: ['#ffd36e', '#ff8a65'],
      alert: ['#ff6b6b', '#ffd166'],
      sos_active: ['#34d399', '#059669']
    } as Record<string, [string, string]>;
  }, []);

  // Setup microphone analyser once permission is granted
  useEffect(() => {
    const setup = async () => {
      if (permissionStatus !== 'granted' || analyserRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.85;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);
        audioCtxRef.current = ctx;
        audioSourceRef.current = source;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
      } catch (e) {
        console.error('Failed to init audio analyser', e);
      }
    };
    setup();
    return () => {
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch { /* noop */ }
      }
      analyserRef.current = null;
      audioSourceRef.current = null;
      audioCtxRef.current = null;
      dataArrayRef.current = null;
    };
  }, [permissionStatus]);

  // Resize canvas to container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const size = Math.min(container.clientWidth, 520);
      canvas.width = size * 2; // high‑dpi
      canvas.height = size * 2;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;

    const draw = () => {
      t += 0.008;

      // Update voice level if available
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      if (analyser && dataArray && (isListening || permissionStatus === 'granted')) {
        analyser.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128; // -1..1
          sumSquares += v * v;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length); // 0..~1
        levelRef.current = lerp(levelRef.current, Math.min(rms * 3, 1), 0.2);
      } else {
        levelRef.current = lerp(levelRef.current, 0.05, 0.05);
      }

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.42;

      // Clear with subtle vignette
      ctx.clearRect(0, 0, width, height);
      const grd = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.4);
      const stateKey = auraState === AuraState.ALERT ? 'alert' :
        auraState === AuraState.SOS_ACTIVE ? 'sos_active' :
        auraState === AuraState.ACTIVE ? 'active' :
        isListening ? 'listening' : 'idle';
      const [c1, c2] = colors[stateKey];
      grd.addColorStop(0, `${c1}22`);
      grd.addColorStop(1, '#00000000');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      // Mesh parameters
      const rows = 34;
      const cols = 40;
      const amplitude = radius * (0.22 + levelRef.current * 0.45);

      // Draw dotted mesh sphere
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i <= rows; i++) {
        const v = i / rows;
        const theta = v * Math.PI; // 0..pi
        const ringR = Math.sin(theta) * radius;
        const ringY = Math.cos(theta) * radius * 0.55;
        for (let j = 0; j < cols; j++) {
          const u = j / cols;
          const phi = u * Math.PI * 2 + t * 0.8;
          const x = Math.cos(phi) * ringR;
          const y = ringY;
          const z = Math.sin(phi) * ringR;
          const noise = Math.sin((x + z) * 0.015 + t * 2) * Math.cos((y) * 0.04 + t);
          const deform = 1 + (noise * amplitude) / Math.max(1, radius * 2);
          const px = x * deform;
          const py = y * deform;
          const perspective = 1 / (1 + (z / (radius * 2)));
          const size = Math.max(1.8, 3.2 * perspective + levelRef.current * 3.2);
          const alpha = 0.12 + perspective * 0.22 + levelRef.current * 0.2;
          const grad = ctx.createRadialGradient(px, py, 0, px, py, size * 3);
          grad.addColorStop(0, `${c1}`);
          grad.addColorStop(1, `${c2}00`);
          ctx.fillStyle = grad;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Soft glow
      ctx.save();
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius * 1.1);
      glow.addColorStop(0, `${c1}66`);
      glow.addColorStop(1, '#00000000');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [auraState, isListening, permissionStatus, colors]);

  const needsPermission = permissionStatus !== 'granted';

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center`} style={{ minHeight: 220 }}>
      <canvas ref={canvasRef} className="rounded-full" />
      {needsPermission && (
        <button
          onClick={onRequestPermission}
          className="absolute bottom-2 px-3 py-1.5 text-xs rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition"
        >
          Enable microphone for live orb
        </button>
      )}
    </div>
  );
};