import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Sparkles, Heart, Star } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface IntroScreenProps {
  onStart: (className: string, dateStr: string) => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [className, setClassName] = useState('새싹반');
  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const [dateStr, setDateStr] = useState(formattedDate);

  const handleStart = () => {
    playPopSound();
    onStart(className.trim() || '우리반', dateStr.trim() || formattedDate);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8 text-center select-none relative">
      {/* Floating background decorative blobs/emojis */}
      <div className="absolute top-10 left-10 text-4xl animate-bounce duration-1000">🎈</div>
      <div className="absolute top-20 right-12 text-4xl animate-bounce delay-300">🧸</div>
      <div className="absolute bottom-16 left-14 text-4xl animate-pulse">🌸</div>
      <div className="absolute bottom-24 right-16 text-4xl animate-bounce delay-700">🌈</div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full bg-white rounded-[32px] border-8 border-[#FFCDD2] shadow-2xl p-8 relative overflow-hidden"
      >
        {/* Cute scalloped border or inner decorative line */}
        <div className="absolute inset-2 border-2 border-dashed border-[#FFE0B2] rounded-2xl pointer-events-none" />

        {/* Header Illustration */}
        <div className="relative flex justify-center mb-5">
          <div className="bg-[#FFE0B2] p-4 rounded-3xl border-3 border-[#FFD54F] relative shadow-md">
            <Camera className="w-12 h-12 text-[#E64A19] animate-pulse" />
            <span className="absolute -top-2 -right-2 text-2xl">✨</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black tracking-tight text-[#E64A19] mb-2 font-sans">
          🐣 우리반 <span className="text-[#FFB300]">네컷</span> 스튜디오 📸
        </h1>
        <p className="text-[#5D4037]/80 text-base md:text-lg mb-8 font-cute font-bold">
          친구들과 함께 귀여운 추억을 사진으로 남겨볼까요?
        </p>

        {/* Form Fields */}
        <div className="space-y-5 mb-8 text-left relative z-10">
          <div>
            <label className="block text-[#E64A19] font-bold mb-1.5 ml-1 flex items-center gap-1.5 font-cute text-lg">
              <Heart className="w-4 h-4 fill-[#FF8A65] stroke-[#FF8A65]" />
              <span>우리 반 이름</span>
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="예: 새싹반, 햇살반"
              maxLength={15}
              className="w-full px-4 py-3 rounded-2xl border-3 border-[#FFD54F] bg-[#FFF9E5]/60 text-[#5D4037] placeholder-[#FFCDD2] focus:outline-none focus:border-[#E64A19] font-bold text-lg transition-colors text-center shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[#E64A19] font-bold mb-1.5 ml-1 flex items-center gap-1.5 font-cute text-lg">
              <Star className="w-4 h-4 fill-[#FFB300] stroke-[#FFB300]" />
              <span>오늘 날짜</span>
            </label>
            <input
              type="text"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              placeholder="예: 2026.07.07"
              maxLength={20}
              className="w-full px-4 py-3 rounded-2xl border-3 border-[#FFD54F] bg-[#FFF9E5]/60 text-[#5D4037] placeholder-[#FFCDD2] focus:outline-none focus:border-[#E64A19] font-bold text-lg transition-colors text-center shadow-inner"
            />
          </div>
        </div>

        {/* CTA Button with Playful 3D Chunky Shadow */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="w-full py-4 bg-[#FFD54F] text-[#5D4037] font-black text-2xl rounded-2xl shadow-[0_6px_0_#F9A825] active:translate-y-1.5 active:shadow-none border-none transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Sparkles className="w-6 h-6 fill-[#5D4037] stroke-none" />
          <span>네컷 찍으러 출발!</span>
          <Sparkles className="w-6 h-6 fill-[#5D4037] stroke-none" />
        </motion.button>
      </motion.div>
    </div>
  );
}
