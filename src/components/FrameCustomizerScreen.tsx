import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft, Download, RotateCcw, Smile, Type, Grid3X3, Trash2, Sliders, ChevronRight, ImageIcon } from 'lucide-react';
import { playPopSound, playPopSound as playStickerSound } from '../utils/audio';
import { Photo, FrameStyle, FilterType, Sticker, LayoutStyle } from '../types';
import { FRAME_STYLES, FILTERS, LAYOUTS, STICKER_OPTIONS } from '../data';

const PHOTO_FRAMES = [
  { id: 'none', name: '기본 흰색', emoji: '⬜', bgColor: '#FFFFFF', bgClass: 'bg-white', borderColor: '#E5E7EB', emojis: ['', '', '', ''] },
  { id: 'lace', name: '레이스 꽃길', emoji: '🌸', bgColor: '#FFF0F5', bgClass: 'bg-[#FFF0F5]', borderColor: '#FFB6C1', emojis: ['🌸', '✨', '🍀', '🌼'] },
  { id: 'hearts', name: '러블리 하트', emoji: '❤️', bgColor: '#FFE4E1', bgClass: 'bg-[#FFE4E1]', borderColor: '#FF6B81', emojis: ['❤️', '💖', '💕', '💝'] },
  { id: 'crayon', name: '크레파스 낙서', emoji: '🖍️', bgColor: '#FFFFE0', bgClass: 'bg-[#FFFFE0]', borderColor: '#FFA500', emojis: ['☀️', '🎈', '🎨', '🍭'] },
  { id: 'cloud', name: '동글동글 구름', emoji: '☁️', bgColor: '#F0F8FF', bgClass: 'bg-[#F0F8FF]', borderColor: '#87CEFA', emojis: ['☁️', '☁️', '✈️', '🌈'] },
  { id: 'stars', name: '반짝반짝 별', emoji: '⭐', bgColor: '#FAF0E6', bgClass: 'bg-[#FAF0E6]', borderColor: '#BA55D3', emojis: ['⭐', '✨', '🪐', '🌙'] },
];

interface FrameCustomizerScreenProps {
  selectedPhotos: Photo[];
  initialClassName: string;
  initialDateStr: string;
  onBack: () => void;
  onComplete: (canvas: HTMLCanvasElement) => void;
}

export default function FrameCustomizerScreen({
  selectedPhotos,
  initialClassName,
  initialDateStr,
  onBack,
  onComplete,
}: FrameCustomizerScreenProps) {
  // Styles
  const [selectedFrame, setSelectedFrame] = useState<FrameStyle>(FRAME_STYLES[0]);
  const [selectedLayout, setSelectedLayout] = useState<LayoutStyle['id']>('vertical');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [selectedPhotoFrame, setSelectedPhotoFrame] = useState<string>('none');

  // Text captions
  const [topText, setTopText] = useState(initialClassName);
  const [bottomText, setBottomText] = useState(initialDateStr);

  // Sticker Placement
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // References for dragging
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{
    stickerId: string;
    startX: number;
    startY: number;
    startStickerX: number;
    startStickerY: number;
  } | null>(null);

  // Handle outside click to deselect sticker
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.sticker-element') && !(e.target as HTMLElement).closest('.sticker-palette')) {
        setSelectedStickerId(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Spawn new sticker
  const handleAddSticker = (emoji: string) => {
    playStickerSound();
    const newSticker: Sticker = {
      id: `user-sticker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      emoji,
      x: 35 + Math.random() * 20, // Center cluster
      y: 40 + Math.random() * 20,
      scale: 1.2,
      rotation: Math.floor(Math.random() * 30) - 15, // random tilt
    };
    setStickers([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Sticker Drag Handlers
  const handleStickerDragStart = (e: React.MouseEvent | React.TouchEvent, sticker: Sticker) => {
    e.preventDefault();
    setSelectedStickerId(sticker.id);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    draggingRef.current = {
      stickerId: sticker.id,
      startX: clientX,
      startY: clientY,
      startStickerX: sticker.x,
      startStickerY: sticker.y,
    };

    if ('touches' in e) {
      document.addEventListener('touchmove', handleStickerDragMove, { passive: false });
      document.addEventListener('touchend', handleStickerDragEnd);
    } else {
      document.addEventListener('mousemove', handleStickerDragMove);
      document.addEventListener('mouseup', handleStickerDragEnd);
    }
  };

  const handleStickerDragMove = (e: MouseEvent | TouchEvent) => {
    if (!draggingRef.current || !previewContainerRef.current) return;

    const drag = draggingRef.current;
    const containerRect = previewContainerRef.current.getBoundingClientRect();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Delta in pixels
    const deltaX = clientX - drag.startX;
    const deltaY = clientY - drag.startY;

    // Convert to percentage relative to container size
    const pctDeltaX = (deltaX / containerRect.width) * 100;
    const pctDeltaY = (deltaY / containerRect.height) * 100;

    // Calculate new position bounded roughly [0-100]
    let newX = Math.max(0, Math.min(100, drag.startStickerX + pctDeltaX));
    let newY = Math.max(0, Math.min(100, drag.startStickerY + pctDeltaY));

    setStickers(prev =>
      prev.map(st => (st.id === drag.stickerId ? { ...st, x: newX, y: newY } : st))
    );
  };

  const handleStickerDragEnd = () => {
    draggingRef.current = null;
    document.removeEventListener('mousemove', handleStickerDragMove);
    document.removeEventListener('mouseup', handleStickerDragEnd);
    document.removeEventListener('touchmove', handleStickerDragMove);
    document.removeEventListener('touchend', handleStickerDragEnd);
  };

  // Resize and Rotate selected sticker
  const handleUpdateStickerScale = (factor: number) => {
    if (!selectedStickerId) return;
    playPopSound();
    setStickers(prev =>
      prev.map(st =>
        st.id === selectedStickerId
          ? { ...st, scale: Math.max(0.5, Math.min(3, (st.scale || 1) + factor)) }
          : st
      )
    );
  };

  const handleRotateSticker = (degrees: number) => {
    if (!selectedStickerId) return;
    playPopSound();
    setStickers(prev =>
      prev.map(st =>
        st.id === selectedStickerId
          ? { ...st, rotation: ((st.rotation || 0) + degrees) % 360 }
          : st
      )
    );
  };

  const handleDeleteSticker = () => {
    if (!selectedStickerId) return;
    playPopSound();
    setStickers(prev => prev.filter(st => st.id !== selectedStickerId));
    setSelectedStickerId(null);
  };

  // Generate High-Quality Canvas collage for download
  const generateCanvas = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size (classic print ratio)
    // Vertical layout is long and narrow, e.g. 600 x 1800
    // Grid layout is square-ish, e.g. 1000 x 1200
    const isVertical = selectedLayout === 'vertical';
    const canvasWidth = isVertical ? 600 : 1000;
    const canvasHeight = isVertical ? 1800 : 1200;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 1. Draw solid background with frame hex
    ctx.fillStyle = selectedFrame.bgHex;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Load images with filters and draw them on canvas
    // Wait, let's load all 4 images as HTMLImageElements
    let imagesLoaded = 0;
    const imgElements = selectedPhotos.map((photo, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Prevent tainted canvas
      img.src = photo.url;
      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 4) {
          drawFinalCanvas(canvas, ctx, imgElements);
        }
      };
      img.onerror = (e) => {
        console.error('Image load fail:', e);
        // Fallback or skip if fails
        imagesLoaded++;
        if (imagesLoaded === 4) {
          drawFinalCanvas(canvas, ctx, imgElements);
        }
      };
      return img;
    });
  };

  // Draw other layers on canvas after images loaded
  const drawFinalCanvas = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    imgElements: HTMLImageElement[]
  ) => {
    const isVertical = selectedLayout === 'vertical';
    const W = canvas.width;
    const H = canvas.height;

    // Apply filter context
    const currentFilterInfo = FILTERS.find(f => f.id === selectedFilter);
    let filterString = 'none';
    if (selectedFilter === 'bright') {
      filterString = 'brightness(1.1) contrast(0.95) saturate(1.1)';
    } else if (selectedFilter === 'vintage') {
      filterString = 'sepia(0.15) contrast(0.95) brightness(1.05) saturate(1.05)';
    } else if (selectedFilter === 'grayscale') {
      filterString = 'grayscale(100%)';
    }

    // Save context for safe filter applying
    ctx.save();

    // 3. Draw Photos in correct coordinates
    const currentPhotoFrame = PHOTO_FRAMES.find(pf => pf.id === selectedPhotoFrame) || PHOTO_FRAMES[0];

    if (isVertical) {
      // 1x4 Vertical strip layout
      // Padding values relative to 600x1800
      const photoWidth = 500;
      const photoHeight = 350;
      const leftMargin = 50;
      const topGap = 45;
      const rowHeight = 390; // vertical step size

      imgElements.forEach((img, i) => {
        const topMargin = 50 + i * rowHeight;
        
        // Draw photo placeholder or background frame color
        ctx.fillStyle = currentPhotoFrame.bgColor;
        const framePadding = selectedPhotoFrame === 'none' ? 0 : 16;
        ctx.fillRect(
          leftMargin - framePadding, 
          topMargin - framePadding, 
          photoWidth + framePadding * 2, 
          photoHeight + framePadding * 2
        );

        // Draw a colored border outline if a frame is selected
        if (selectedPhotoFrame !== 'none') {
          ctx.strokeStyle = currentPhotoFrame.borderColor;
          ctx.lineWidth = 8;
          ctx.strokeRect(
            leftMargin - framePadding + 4, 
            topMargin - framePadding + 4, 
            photoWidth + framePadding * 2 - 8, 
            photoHeight + framePadding * 2 - 8
          );
        }

        ctx.save();
        ctx.filter = filterString;
        
        // Crop/Fit image centered to 4:3
        // Calculate aspect ratio fit (cover style)
        const sWidth = img.naturalWidth;
        const sHeight = img.naturalHeight;
        const targetRatio = photoWidth / photoHeight;
        const currentRatio = sWidth / sHeight;

        let sx = 0, sy = 0, sw = sWidth, sh = sHeight;
        if (currentRatio > targetRatio) {
          sw = sHeight * targetRatio;
          sx = (sWidth - sw) / 2;
        } else {
          sh = sWidth / targetRatio;
          sy = (sHeight - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, leftMargin, topMargin, photoWidth, photoHeight);
        ctx.restore();

        // Draw corner emojis for the decorative frame
        if (selectedPhotoFrame !== 'none' && currentPhotoFrame.emojis) {
          ctx.save();
          ctx.font = '24px Arial, Apple Color Emoji, Segoe UI Emoji';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const cornerOffset = framePadding / 2 + 2;
          
          // Top-Left
          ctx.fillText(currentPhotoFrame.emojis[0], leftMargin - framePadding + cornerOffset, topMargin - framePadding + cornerOffset);
          // Top-Right
          ctx.fillText(currentPhotoFrame.emojis[1], leftMargin + photoWidth + framePadding - cornerOffset, topMargin - framePadding + cornerOffset);
          // Bottom-Left
          ctx.fillText(currentPhotoFrame.emojis[2], leftMargin - framePadding + cornerOffset, topMargin + photoHeight + framePadding - cornerOffset);
          // Bottom-Right
          ctx.fillText(currentPhotoFrame.emojis[3], leftMargin + photoWidth + framePadding - cornerOffset, topMargin + photoHeight + framePadding - cornerOffset);
          
          ctx.restore();
        }
      });
    } else {
      // 2x2 Grid layout (Width 1000, Height 1200)
      const photoWidth = 430;
      const photoHeight = 320;
      const xGap = 60;
      const yGap = 50;
      const startX = 55;
      const startY = 80;

      const positions = [
        { x: startX, y: startY },
        { x: startX + photoWidth + xGap, y: startY },
        { x: startX, y: startY + photoHeight + yGap },
        { x: startX + photoWidth + xGap, y: startY + photoHeight + yGap },
      ];

      imgElements.forEach((img, i) => {
        const pos = positions[i];

        // Draw photo placeholder or background frame color
        ctx.fillStyle = currentPhotoFrame.bgColor;
        const framePadding = selectedPhotoFrame === 'none' ? 0 : 16;
        ctx.fillRect(
          pos.x - framePadding, 
          pos.y - framePadding, 
          photoWidth + framePadding * 2, 
          photoHeight + framePadding * 2
        );

        // Draw a colored border outline if a frame is selected
        if (selectedPhotoFrame !== 'none') {
          ctx.strokeStyle = currentPhotoFrame.borderColor;
          ctx.lineWidth = 8;
          ctx.strokeRect(
            pos.x - framePadding + 4, 
            pos.y - framePadding + 4, 
            photoWidth + framePadding * 2 - 8, 
            photoHeight + framePadding * 2 - 8
          );
        }

        ctx.save();
        ctx.filter = filterString;

        // Cover fit
        const sWidth = img.naturalWidth;
        const sHeight = img.naturalHeight;
        const targetRatio = photoWidth / photoHeight;
        const currentRatio = sWidth / sHeight;

        let sx = 0, sy = 0, sw = sWidth, sh = sHeight;
        if (currentRatio > targetRatio) {
          sw = sHeight * targetRatio;
          sx = (sWidth - sw) / 2;
        } else {
          sh = sWidth / targetRatio;
          sy = (sHeight - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, pos.x, pos.y, photoWidth, photoHeight);
        ctx.restore();

        // Draw corner emojis for the decorative frame
        if (selectedPhotoFrame !== 'none' && currentPhotoFrame.emojis) {
          ctx.save();
          ctx.font = '24px Arial, Apple Color Emoji, Segoe UI Emoji';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const cornerOffset = framePadding / 2 + 2;
          
          // Top-Left
          ctx.fillText(currentPhotoFrame.emojis[0], pos.x - framePadding + cornerOffset, pos.y - framePadding + cornerOffset);
          // Top-Right
          ctx.fillText(currentPhotoFrame.emojis[1], pos.x + photoWidth + framePadding - cornerOffset, pos.y - framePadding + cornerOffset);
          // Bottom-Left
          ctx.fillText(currentPhotoFrame.emojis[2], pos.x - framePadding + cornerOffset, pos.y + photoHeight + framePadding - cornerOffset);
          // Bottom-Right
          ctx.fillText(currentPhotoFrame.emojis[3], pos.x + photoWidth + framePadding - cornerOffset, pos.y + photoHeight + framePadding - cornerOffset);
          
          ctx.restore();
        }
      });
    }

    ctx.restore(); // Restore filters

    // 4. Draw Default Background Stickers (from selectedFrame.stickers)
    selectedFrame.stickers.forEach(st => {
      ctx.save();
      const stX = (st.x / 100) * W;
      const stY = (st.y / 100) * H;
      const scale = st.scale || 1;
      const fontSize = Math.floor(W * 0.05 * scale); // Scaled relative to width

      ctx.font = `${fontSize}px Arial, Apple Color Emoji, Segoe UI Emoji`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.emoji, stX, stY);
      ctx.restore();
    });

    // 5. Draw Custom User-Placed Stickers
    stickers.forEach(st => {
      ctx.save();
      const stX = (st.x / 100) * W;
      const stY = (st.y / 100) * H;
      const scale = st.scale || 1.2;
      const rotation = st.rotation || 0;
      const fontSize = Math.floor(W * 0.065 * scale); // Scaled

      ctx.translate(stX, stY);
      ctx.rotate((rotation * Math.PI) / 180);

      ctx.font = `${fontSize}px Arial, Apple Color Emoji, Segoe UI Emoji`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.emoji, 0, 0);
      ctx.restore();
    });

    // 6. Draw Class Name & Date at Bottom Box
    ctx.save();
    ctx.fillStyle = selectedFrame.textHex;
    ctx.textAlign = 'center';

    if (isVertical) {
      // Bottom text for Vertical Strip
      // Top line text (larger font)
      ctx.font = `bold ${Math.floor(W * 0.052)}px "Jua", "Gaegu", Arial, sans-serif`;
      ctx.fillText(topText, W / 2, H - 120);

      // Bottom line text (smaller, date)
      ctx.font = `bold ${Math.floor(W * 0.038)}px "Gaegu", Arial, sans-serif`;
      ctx.fillText(bottomText, W / 2, H - 65);
    } else {
      // Bottom text for 2x2 Grid (centered inside bottom spacing)
      // Top line
      ctx.font = `bold ${Math.floor(W * 0.045)}px "Jua", "Gaegu", Arial, sans-serif`;
      ctx.fillText(topText, W / 2, H - 150);

      // Bottom line
      ctx.font = `bold ${Math.floor(W * 0.03)}px "Gaegu", Arial, sans-serif`;
      ctx.fillText(bottomText, W / 2, H - 90);
    }
    ctx.restore();

    // Give back the fully compiled canvas!
    onComplete(canvas);
  };

  const handleGenerateAndNext = () => {
    playPopSound();
    generateCanvas();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto px-4 py-4 select-none">
      {/* LEFT BLOCK: Customize Options & Control Panels */}
      <div className="flex-1 space-y-6 order-2 lg:order-1">
        {/* Navigation & Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              playPopSound();
              onBack();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFD54F] text-[#5D4037] font-bold shadow-[0_4px_0_#F9A825] active:translate-y-1 active:shadow-none transition-all cursor-pointer border-none text-sm"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3px]" />
            <span>사진 고르기로 돌아가기</span>
          </button>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[#E64A19] flex items-center gap-1.5 font-sans">
            🎨 나만의 네컷 프레임 꾸미기
          </h2>
          <p className="text-[#5D4037]/80 text-base font-cute font-bold mt-1">
            프레임을 예쁜 색으로 선택하고, 글씨를 쓰고, 귀여운 스티커를 올려 나만의 한정판 네컷을 완성해요!
          </p>
        </div>

        {/* 1. LAYOUT & FRAME SELECTION */}
        <div className="bg-white rounded-3xl border-8 border-[#FFCDD2] p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-1.5 border-b-2 border-gray-100 pb-2">
            <Grid3X3 className="w-5 h-5 text-[#FF8A65]" />
            <h3 className="font-bold text-[#5D4037] text-base">레이아웃 & 프레임 색상</h3>
          </div>

          {/* Layout buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#E64A19] block ml-1 font-cute text-sm">네컷 모양 선택</span>
            <div className="grid grid-cols-2 gap-3">
              {LAYOUTS.map(layout => (
                <button
                  key={layout.id}
                  onClick={() => {
                    playPopSound();
                    setSelectedLayout(layout.id);
                  }}
                  className={`py-2.5 px-4 rounded-xl font-bold border-2 transition-all text-sm cursor-pointer ${
                    selectedLayout === layout.id
                      ? 'border-[#FFD54F] bg-[#FFE0B2]/30 text-[#E64A19] ring-4 ring-[#FFD54F]/40'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {layout.displayName}
                </button>
              ))}
            </div>
          </div>

          {/* Frame Styles (Color list) */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-[#E64A19] block ml-1 font-cute text-sm">프레임 스킨 선택</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {FRAME_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => {
                    playPopSound();
                    setSelectedFrame(style);
                  }}
                  className={`py-2 px-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${style.bgColor} ${
                    selectedFrame.id === style.id
                      ? 'border-[#FFD54F] ring-4 ring-[#FFD54F]/40 scale-102'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-xl">{style.emoji}</span>
                  <span className={style.textColor}>{style.name.split(' ')[1] || style.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1.5 PHOTO FRAME SELECTION */}
        <div id="photo-frame-selection-panel" className="bg-white rounded-3xl border-8 border-[#FFCDD2] p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-1.5 border-b-2 border-gray-100 pb-2">
            <ImageIcon className="w-5 h-5 text-[#FF8A65]" />
            <h3 className="font-bold text-[#5D4037] text-base">사진 배경 프레임 선택</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PHOTO_FRAMES.map(frame => (
              <button
                id={`photo-frame-opt-${frame.id}`}
                key={frame.id}
                onClick={() => {
                  playPopSound();
                  setSelectedPhotoFrame(frame.id);
                }}
                className={`py-2 px-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${frame.bgClass} ${
                  selectedPhotoFrame === frame.id
                    ? 'border-[#FFD54F] ring-4 ring-[#FFD54F]/40 scale-102'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl select-none">{frame.emoji}</span>
                <span className="text-[#5D4037] font-bold text-center font-cute text-sm">{frame.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. FILTER SELECTION */}
        <div className="bg-white rounded-3xl border-8 border-[#FFCDD2] p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-1.5 border-b-2 border-gray-100 pb-2">
            <Sliders className="w-5 h-5 text-[#FF8A65]" />
            <h3 className="font-bold text-[#5D4037] text-base">사진 필터 선택</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => {
                  playPopSound();
                  setSelectedFilter(filter.id);
                }}
                className={`p-2.5 rounded-xl border-2 transition-all text-left flex flex-col cursor-pointer ${
                  selectedFilter === filter.id
                    ? 'border-[#FFD54F] bg-[#FFE0B2]/30 ring-4 ring-[#FFD54F]/40'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span className="font-bold text-xs text-[#5D4037]">{filter.name}</span>
                <span className="text-[10px] text-gray-500 leading-tight mt-0.5">{filter.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. CAPTION TEXT EDIT */}
        <div className="bg-white rounded-3xl border-8 border-[#FFCDD2] p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-1.5 border-b-2 border-gray-100 pb-2">
            <Type className="w-5 h-5 text-[#FF8A65]" />
            <h3 className="font-bold text-[#5D4037] text-base">글씨 꾸미기</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#E64A19] mb-1.5 ml-1 font-cute text-sm">위쪽 줄 (학급 이름)</label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-2.5 text-sm rounded-xl border-3 border-[#FFD54F] bg-[#FFF9E5]/60 text-[#5D4037] focus:outline-none focus:border-[#E64A19] font-bold shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#E64A19] mb-1.5 ml-1 font-cute text-sm">아래쪽 줄 (날짜/메시지)</label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                maxLength={25}
                className="w-full px-4 py-2.5 text-sm rounded-xl border-3 border-[#FFD54F] bg-[#FFF9E5]/60 text-[#5D4037] focus:outline-none focus:border-[#E64A19] font-bold shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* 4. STICKER PALETTE */}
        <div className="bg-white rounded-3xl border-8 border-[#FFCDD2] p-5 shadow-xl space-y-3 sticker-palette">
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Smile className="w-5 h-5 text-[#FF8A65]" />
              <h3 className="font-bold text-[#5D4037] text-base">스티커 붙이기 (클릭해 추가!)</h3>
            </div>
            {stickers.length > 0 && (
              <button
                onClick={() => {
                  playPopSound();
                  setStickers([]);
                  setSelectedStickerId(null);
                }}
                className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>스티커 모두 리셋</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-[#5D4037]/80 font-cute font-bold">
            아래 귀여운 이모지 스티커를 클릭하면 사진 속으로 쏙 들어가요! 마우스나 손가락으로 밀어서 예쁜 위치에 올려놓으세요.
          </p>

          <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto p-1.5 bg-[#FFF9E5]/60 rounded-xl border border-[#FFCDD2]/30">
            {STICKER_OPTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleAddSticker(emoji)}
                className="text-2xl hover:scale-135 transition-all p-1.5 hover:bg-white rounded-lg select-none cursor-pointer active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Active Sticker Control Menu */}
          <AnimatePresence>
            {selectedStickerId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 bg-[#FFE0B2]/60 border border-[#FFB74D] rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#5D4037]">선택한 스티커:</span>
                  <span className="text-xl bg-white px-2 py-0.5 rounded-lg border border-[#FFB74D] shadow-sm select-none">
                    {stickers.find(s => s.id === selectedStickerId)?.emoji}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Rotate Buttons */}
                  <button
                    onClick={() => handleRotateSticker(-15)}
                    className="p-1.5 bg-white hover:bg-[#FFE0B2]/40 border border-[#FFB74D] rounded-lg text-xs font-bold text-[#E64A19] cursor-pointer"
                    title="왼쪽 회전"
                  >
                    ↺ 15°
                  </button>
                  <button
                    onClick={() => handleRotateSticker(15)}
                    className="p-1.5 bg-white hover:bg-[#FFE0B2]/40 border border-[#FFB74D] rounded-lg text-xs font-bold text-[#E64A19] cursor-pointer"
                    title="오른쪽 회전"
                  >
                    ↻ 15°
                  </button>

                  {/* Size Buttons */}
                  <button
                    onClick={() => handleUpdateStickerScale(-0.15)}
                    className="px-2.5 py-1 bg-white hover:bg-[#FFE0B2]/40 border border-[#FFB74D] rounded-lg font-bold text-[#E64A19] cursor-pointer"
                    title="작게"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleUpdateStickerScale(0.15)}
                    className="px-2.5 py-1 bg-white hover:bg-[#FFE0B2]/40 border border-[#FFB74D] rounded-lg font-bold text-[#E64A19] cursor-pointer"
                    title="크게"
                  >
                    +
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={handleDeleteSticker}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer border border-red-200"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Generate Trigger */}
        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateAndNext}
            className="w-full py-4 bg-[#FF8A65] hover:bg-[#ff7a50] text-white font-black text-xl md:text-2xl rounded-full shadow-[0_6px_0_#D84315] active:translate-y-1.5 active:shadow-none border-none transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 fill-white stroke-none" />
            <span>네컷 완성하고 자랑하기!</span>
            <ChevronRight className="w-6 h-6 stroke-[3px]" />
          </motion.button>
        </div>
      </div>

      {/* RIGHT BLOCK: High Fidelity Interactive 4-Cut Print Preview */}
      <div className="w-full lg:w-[350px] shrink-0 flex flex-col items-center order-1 lg:order-2">
        <span className="text-sm font-bold text-[#E64A19] mb-2.5 block font-cute text-lg">📸 인쇄 미리보기</span>

        {/* Actual Paper Container */}
        <div
          ref={previewContainerRef}
          className={`relative ${selectedFrame.bgColor} border-4 ${selectedFrame.borderClass} shadow-xl overflow-hidden select-none select-none`}
          style={{
            width: selectedLayout === 'vertical' ? '200px' : '330px',
            height: selectedLayout === 'vertical' ? '580px' : '390px',
            borderRadius: '24px',
            padding: selectedLayout === 'vertical' ? '18px 12px 25px 12px' : '22px 14px 22px 14px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Photos Container inside frame */}
          {selectedLayout === 'vertical' ? (
            // 1. Classic vertical layout
            <div className="flex-1 flex flex-col gap-3">
              {selectedPhotos.map((photo, i) => {
                const currentPhotoFrameOpt = PHOTO_FRAMES.find(pf => pf.id === selectedPhotoFrame) || PHOTO_FRAMES[0];
                return (
                  <div 
                    key={photo.id} 
                    className={`relative w-full aspect-[4/3] ${currentPhotoFrameOpt.bgClass} border-2 shadow-sm rounded-lg overflow-hidden shrink-0 transition-all flex items-center justify-center`}
                    style={{
                      borderColor: selectedPhotoFrame === 'none' ? 'rgba(255,255,255,0.5)' : currentPhotoFrameOpt.borderColor,
                      padding: selectedPhotoFrame === 'none' ? '0px' : '4px',
                    }}
                  >
                    <div className="w-full h-full rounded relative overflow-hidden">
                      <img
                        src={photo.url}
                        alt={`Fourcut ${i + 1}`}
                        className={`w-full h-full object-cover select-none pointer-events-none ${
                          FILTERS.find(f => f.id === selectedFilter)?.cssClass
                        }`}
                      />
                    </div>

                    {/* Corner emojis for active photo frame */}
                    {selectedPhotoFrame !== 'none' && currentPhotoFrameOpt.emojis && (
                      <>
                        <span className="absolute top-0.5 left-0.5 text-[9px] select-none pointer-events-none z-10 leading-none">{currentPhotoFrameOpt.emojis[0]}</span>
                        <span className="absolute top-0.5 right-0.5 text-[9px] select-none pointer-events-none z-10 leading-none">{currentPhotoFrameOpt.emojis[1]}</span>
                        <span className="absolute bottom-0.5 left-0.5 text-[9px] select-none pointer-events-none z-10 leading-none">{currentPhotoFrameOpt.emojis[2]}</span>
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] select-none pointer-events-none z-10 leading-none">{currentPhotoFrameOpt.emojis[3]}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // 2. Grid layout 2x2
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
              {selectedPhotos.map((photo, i) => {
                const currentPhotoFrameOpt = PHOTO_FRAMES.find(pf => pf.id === selectedPhotoFrame) || PHOTO_FRAMES[0];
                return (
                  <div 
                    key={photo.id} 
                    className={`relative w-full aspect-[4/3] ${currentPhotoFrameOpt.bgClass} border-2 shadow-sm rounded-lg overflow-hidden shrink-0 transition-all flex items-center justify-center`}
                    style={{
                      borderColor: selectedPhotoFrame === 'none' ? 'rgba(255,255,255,0.5)' : currentPhotoFrameOpt.borderColor,
                      padding: selectedPhotoFrame === 'none' ? '0px' : '4px',
                    }}
                  >
                    <div className="w-full h-full rounded relative overflow-hidden">
                      <img
                        src={photo.url}
                        alt={`Fourcut ${i + 1}`}
                        className={`w-full h-full object-cover select-none pointer-events-none ${
                          FILTERS.find(f => f.id === selectedFilter)?.cssClass
                        }`}
                      />
                    </div>

                    {/* Corner emojis for active photo frame */}
                    {selectedPhotoFrame !== 'none' && currentPhotoFrameOpt.emojis && (
                      <>
                        <span className="absolute top-0.5 left-0.5 text-[9px] select-none pointer-events-none z-10 leading-none">{currentPhotoFrameOpt.emojis[0]}</span>
                        <span className="absolute top-0.5 right-0.5 text-[9px] select-none pointer-events-none z-10 leading-none">{currentPhotoFrameOpt.emojis[1]}</span>
                        <span className="absolute bottom-0.5 left-0.5 text-[9px] select-none pointer-events-none z-10 leading-none">{currentPhotoFrameOpt.emojis[2]}</span>
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] select-none pointer-events-none z-10 leading-none">{currentPhotoFrameOpt.emojis[3]}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Default frame static stickers */}
          {selectedFrame.stickers.map((st, i) => (
            <div
              key={`static-st-${i}`}
              className="absolute text-xl pointer-events-none select-none z-10"
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                transform: `translate(-50%, -50%) scale(${st.scale || 1})`,
              }}
            >
              {st.emoji}
            </div>
          ))}

          {/* Interactive User Placed Stickers */}
          {stickers.map(st => {
            const isSelected = st.id === selectedStickerId;
            return (
              <div
                key={st.id}
                onMouseDown={(e) => handleStickerDragStart(e, st)}
                onTouchStart={(e) => handleStickerDragStart(e, st)}
                className={`absolute text-2xl cursor-grab active:cursor-grabbing select-none sticker-element z-20 ${
                  isSelected ? 'ring-2 ring-amber-500 rounded p-1 bg-white/20' : ''
                }`}
                style={{
                  left: `${st.x}%`,
                  top: `${st.y}%`,
                  transform: `translate(-50%, -50%) scale(${st.scale || 1.2}) rotate(${st.rotation || 0}deg)`,
                  touchAction: 'none',
                }}
              >
                {st.emoji}

                {/* Micro corner controls */}
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSticker();
                    }}
                    className="absolute -top-4 -right-4 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center border border-white font-sans text-[10px] shadow"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}

          {/* Captions space at bottom */}
          <div
            className="flex flex-col items-center justify-center text-center mt-3 shrink-0"
            style={{
              color: selectedFrame.textHex,
              lineHeight: 1.1,
            }}
          >
            <span className="font-sans font-bold text-sm tracking-tight truncate w-full px-1">
              {topText || '우리반'}
            </span>
            <span className="font-cute text-[11px] font-bold mt-0.5 opacity-90 truncate w-full">
              {bottomText || initialDateStr}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#5D4037]/75 mt-3 text-center px-4 font-cute font-bold leading-relaxed">
          💡 스티커를 잡아서 예쁜 자리에 끌어 올려보세요! 선택된 스티커는 회전시키거나, 크기를 늘리거나 삭제할 수 있어요.
        </p>
      </div>
    </div>
  );
}
