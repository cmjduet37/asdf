import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Download, RefreshCw, Sparkles, Heart, Star, Award } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface ResultScreenProps {
  canvas: HTMLCanvasElement | null;
  classNameStr: string;
  onReset: () => void;
}

export default function ResultScreen({ canvas, classNameStr, onReset }: ResultScreenProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Convert canvas to source URL
  useEffect(() => {
    if (canvas) {
      setImgSrc(canvas.toDataURL('image/png'));
    }
  }, [canvas]);

  // High-performance canvas confetti loop for child feedback
  useEffect(() => {
    const canvasEl = confettiCanvasRef.current;
    if (!canvasEl) return;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvasEl.width = window.innerWidth);
    let height = (canvasEl.height = window.innerHeight);

    // Resize handler
    const handleResize = () => {
      if (!canvasEl) return;
      width = canvasEl.width = window.innerWidth;
      height = canvasEl.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Confetti particles
    const colors = ['#FFD700', '#FF69B4', '#1E90FF', '#32CD32', '#FF4500', '#DA70D6'];
    const particles = Array.from({ length: 70 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      r: Math.random() * 6 + 4,
      d: Math.random() * height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

        // Reset particle to top if it goes off bottom
        if (p.y > height) {
          p.x = Math.random() * width;
          p.y = -20;
          p.tilt = Math.random() * 10 - 5;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDownload = () => {
    playPopSound();
    if (!imgSrc) return;

    const link = document.createElement('a');
    link.href = imgSrc;
    // Safe child friendly file name
    link.download = `${classNameStr}_우리반_네컷_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-4 select-none relative">
      {/* Dynamic Confetti Canvas Background */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Celebration Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FFE0B2] border-2 border-[#FFB74D] rounded-full text-[#E64A19] font-bold text-lg shadow-sm mb-4">
          <Award className="w-5 h-5 text-[#E64A19] fill-[#FFD54F] animate-bounce" />
          <span>우와! {classNameStr}의 멋진 네컷 완성! 🎉</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-[#E64A19] font-sans tracking-tight">
          📷 우리들의 소중한 추억 🌸
        </h2>
        <p className="text-[#5D4037]/80 text-base md:text-lg font-cute font-bold mt-1">
          컴퓨터나 스마트폰에 사진으로 저장해서 가족, 친구들과 함께 나누어 보아요!
        </p>
      </motion.div>

      {/* Main Print Showcase Area */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full mb-8 relative z-10">
        {/* Completed Print Strip Preview */}
        <motion.div
          initial={{ y: 50, opacity: 0, rotate: -2 }}
          animate={{ y: 0, opacity: 1, rotate: 2 }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
          whileHover={{ scale: 1.03, rotate: 0 }}
          className="bg-white p-4 rounded-[32px] shadow-2xl border-8 border-[#FFCDD2] shrink-0"
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="Final Kindergarten Fourcut"
              className="max-h-[500px] object-contain rounded-[20px] mx-auto border-2 border-gray-100"
            />
          ) : (
            <div className="w-[200px] h-[500px] flex items-center justify-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          )}
        </motion.div>

        {/* Action controls card */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-sm w-full bg-white rounded-[32px] border-8 border-[#FFCDD2] p-6 shadow-2xl text-center space-y-6 relative overflow-hidden"
        >
          {/* Dash style borders inside card */}
          <div className="absolute inset-1.5 border-2 border-dashed border-[#FFE0B2] rounded-2xl pointer-events-none" />

          <div className="flex justify-center">
            <div className="p-3 bg-[#FFE0B2] rounded-full border-2 border-[#FFD54F]">
              <Heart className="w-8 h-8 text-[#E64A19] fill-[#FF8A65]" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#E64A19] font-sans">
              사진을 저장했나요?
            </h3>
            <p className="text-sm text-[#5D4037]/90 mt-1 font-cute font-bold leading-relaxed">
              아래 버튼을 눌러 소중한 사진을 다운로드하고,<br />
              새로운 포즈로 다시 촬영하러 갈 수도 있어요!
            </p>
          </div>

          <div className="space-y-4">
            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="w-full py-4 bg-[#FF8A65] hover:bg-[#ff7a50] text-white font-black text-lg md:text-xl rounded-full shadow-[0_5px_0_#D84315] active:translate-y-1 active:shadow-none border-none flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-5 h-5 stroke-[3px]" />
              <span>사진 저장하기</span>
            </motion.button>

            {/* Restart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                playPopSound();
                onReset();
              }}
              className="w-full py-3.5 bg-[#FFD54F] text-[#5D4037] font-black text-base md:text-lg rounded-full shadow-[0_4px_0_#F9A825] active:translate-y-1 active:shadow-none border-none flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-5 h-5 stroke-[3px]" />
              <span>처음부터 다시 찍기</span>
            </motion.button>
          </div>

          {/* Sparkles decorations */}
          <div className="flex items-center justify-center gap-1.5 text-[#FFCDD2] text-sm">
            <Star className="w-4 h-4 fill-[#FFD54F] stroke-none" />
            <Star className="w-4 h-4 fill-[#FFD54F] stroke-none" />
            <span className="font-cute font-bold text-[#E64A19]">우리 유치원 최고! ✨</span>
            <Star className="w-4 h-4 fill-[#FFD54F] stroke-none" />
            <Star className="w-4 h-4 fill-[#FFD54F] stroke-none" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
