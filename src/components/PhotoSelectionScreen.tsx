import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { playPopSound } from '../utils/audio';
import { Photo } from '../types';

interface PhotoSelectionScreenProps {
  photos: Photo[];
  onBack: () => void;
  onPhotosSelected: (selectedPhotos: Photo[]) => void;
}

export default function PhotoSelectionScreen({ photos, onBack, onPhotosSelected }: PhotoSelectionScreenProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handlePhotoClick = (photoId: string) => {
    playPopSound();
    if (selectedIds.includes(photoId)) {
      // Unselect
      setSelectedIds(selectedIds.filter(id => id !== photoId));
    } else {
      // Select (maximum 4)
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, photoId]);
      } else {
        // If already 4 selected, swap out the oldest or alert. Let's do a soft alert message
        // Actually, just ignoring or replacing the last one is fine. Let's show a bouncy warning info card instead.
      }
    }
  };

  const handleNext = () => {
    if (selectedIds.length !== 4) return;
    playPopSound();
    
    // Map selected IDs back to full photo objects, preserving selection order!
    const orderedPhotos = selectedIds
      .map(id => photos.find(p => p.id === id))
      .filter((p): p is Photo => p !== undefined);
      
    onPhotosSelected(orderedPhotos);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-6 select-none">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={() => {
            playPopSound();
            onBack();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFD54F] text-[#5D4037] font-bold shadow-[0_4px_0_#F9A825] active:translate-y-1 active:shadow-none transition-all cursor-pointer border-none"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3px]" />
          <span>다시 촬영하기</span>
        </button>

        <div className="bg-[#FFE0B2] border-2 border-[#FFB74D] rounded-full px-5 py-1.5 text-[#E64A19] font-bold flex items-center gap-1.5 text-sm md:text-base shadow-sm">
          <span>💖 5장 중 4장 고르기</span>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="w-full max-w-2xl bg-white border-4 border-[#FFCDD2] rounded-3xl p-5 mb-8 text-center flex items-start gap-4 justify-center shadow-lg">
        <Info className="w-6 h-6 text-[#FF8A65] shrink-0 mt-0.5" />
        <div className="text-left text-[#5D4037]">
          <p className="font-black text-lg md:text-xl font-cute text-[#E64A19]">
            가장 마음에 드는 사진 4장을 골라보아요!
          </p>
          <p className="text-sm text-[#5D4037]/90 font-cute mt-1 leading-relaxed font-bold">
            누르는 순서대로 (1번부터 4번까지) 네컷 사진에 차례대로 쏙 들어갑니다. 다시 한번 사진을 누르면 고른 것을 지울 수 있어요!
          </p>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full mb-10">
        {photos.map((photo, index) => {
          const selectionIndex = selectedIds.indexOf(photo.id);
          const isSelected = selectionIndex !== -1;

          return (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePhotoClick(photo.id)}
              key={photo.id}
              className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all ${
                isSelected
                  ? 'border-4 border-[#FFD54F] ring-4 ring-[#FFD54F]/50 scale-[1.02]'
                  : 'border-2 border-gray-200 opacity-90 hover:opacity-100'
              }`}
            >
              <img src={photo.url} alt={`Selection ${index + 1}`} className="w-full h-full object-cover" />

              {/* Selection Badge & Overlay */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#FFD54F]/25 backdrop-blur-[1px] flex items-center justify-center"
                  >
                    {/* Circle badge with step number */}
                    <motion.div
                      initial={{ scale: 0.5, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0.5 }}
                      className="bg-[#FFD54F] text-[#5D4037] font-black text-2xl w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shadow-md font-sans"
                    >
                      {selectionIndex + 1}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid Label */}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                {index + 1}번 사진
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Warning if not enough selected */}
      {selectedIds.length < 4 && (
        <div className="mb-6 text-[#E64A19] font-black font-cute text-xl animate-pulse">
          앞으로 {4 - selectedIds.length}장 더 찍은 사진을 선택해주세요! ({selectedIds.length}/4)
        </div>
      )}

      {/* Proceed Button */}
      <div className="w-full max-w-xs">
        <motion.button
          whileHover={{ scale: selectedIds.length === 4 ? 1.02 : 1 }}
          whileTap={{ scale: selectedIds.length === 4 ? 0.98 : 1 }}
          onClick={handleNext}
          disabled={selectedIds.length !== 4}
          className={`w-full py-4 rounded-full font-black text-xl md:text-2xl shadow-lg flex items-center justify-center gap-3 active:translate-y-1.5 active:shadow-none border-none transition-all cursor-pointer select-none ${
            selectedIds.length === 4
              ? 'bg-[#FFD54F] text-[#5D4037] shadow-[0_6px_0_#F9A825]'
              : 'bg-gray-200 text-gray-400 shadow-[0_6px_0_#9e9e9e] cursor-not-allowed'
          }`}
        >
          <span>예쁘게 꾸미러 가기</span>
          <ArrowRight className="w-6 h-6 stroke-[3px]" />
        </motion.button>
      </div>
    </div>
  );
}
