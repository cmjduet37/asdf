import { FrameStyle, FilterInfo, LayoutStyle } from './types';

export const FRAME_STYLES: FrameStyle[] = [
  {
    id: 'chick',
    name: 'Yellow Chick',
    displayName: '🐣 노랑 병아리',
    bgColor: 'bg-amber-100',
    bgHex: '#FEF3C7', // tailwind amber-100
    textHex: '#D97706', // tailwind amber-600
    borderClass: 'border-amber-300',
    textColor: 'text-amber-700',
    emoji: '🐣',
    stickers: [
      { emoji: '🐥', x: 8, y: 3, scale: 1.2 },
      { emoji: '🌱', x: 90, y: 12 },
      { emoji: '🌻', x: 5, y: 88, scale: 1.1 },
      { emoji: '✨', x: 88, y: 92 },
    ]
  },
  {
    id: 'rabbit',
    name: 'Pink Rabbit',
    displayName: '🐰 딸기 토끼',
    bgColor: 'bg-pink-100',
    bgHex: '#FCE7F3', // tailwind pink-100
    textHex: '#DB2777', // tailwind pink-600
    borderClass: 'border-pink-300',
    textColor: 'text-pink-700',
    emoji: '🐰',
    stickers: [
      { emoji: '🐰', x: 8, y: 3, scale: 1.2 },
      { emoji: '💖', x: 92, y: 8 },
      { emoji: '🌸', x: 6, y: 89, scale: 1.1 },
      { emoji: '🍓', x: 88, y: 91, scale: 1.2 },
    ]
  },
  {
    id: 'dino',
    name: 'Green Dino',
    displayName: '🦖 초록 공룡',
    bgColor: 'bg-emerald-100',
    bgHex: '#D1FAE5', // tailwind emerald-100
    textHex: '#059669', // tailwind emerald-600
    borderClass: 'border-emerald-300',
    textColor: 'text-emerald-700',
    emoji: '🦖',
    stickers: [
      { emoji: '🦖', x: 7, y: 4, scale: 1.3 },
      { emoji: '🍀', x: 92, y: 10 },
      { emoji: '🌿', x: 6, y: 90 },
      { emoji: '🥚', x: 88, y: 91 },
    ]
  },
  {
    id: 'cloud',
    name: 'Sky Cloud',
    displayName: '☁️ 하늘 구름',
    bgColor: 'bg-sky-100',
    bgHex: '#E0F2FE', // tailwind sky-100
    textHex: '#0284C7', // tailwind sky-600
    borderClass: 'border-sky-300',
    textColor: 'text-sky-700',
    emoji: '☁️',
    stickers: [
      { emoji: '☁️', x: 6, y: 4, scale: 1.2 },
      { emoji: '🎈', x: 92, y: 6, scale: 1.2 },
      { emoji: '🌈', x: 7, y: 88, scale: 1.3 },
      { emoji: '⭐', x: 89, y: 92 },
    ]
  },
  {
    id: 'starry',
    name: 'Purple Starry',
    displayName: '⭐ 보라 별밤',
    bgColor: 'bg-purple-100',
    bgHex: '#F3E8FF', // tailwind purple-100
    textHex: '#7C3AED', // tailwind purple-600
    borderClass: 'border-purple-300',
    textColor: 'text-purple-700',
    emoji: '⭐',
    stickers: [
      { emoji: '🌙', x: 8, y: 3, scale: 1.1 },
      { emoji: '🧸', x: 92, y: 8, scale: 1.2 },
      { emoji: '🪐', x: 6, y: 89, scale: 1.1 },
      { emoji: '✨', x: 88, y: 92 },
    ]
  }
];

export const FILTERS: FilterInfo[] = [
  {
    id: 'normal',
    name: '원본 그대로',
    description: '자연스러운 원래 색상',
    cssClass: 'contrast-[1.02] saturate-[1.05]'
  },
  {
    id: 'bright',
    name: '뽀샤시 햇살',
    description: '밝고 뽀샤시한 유치원생 필터',
    cssClass: 'brightness-110 contrast-95 saturate-110'
  },
  {
    id: 'vintage',
    name: '따뜻한 감성',
    description: '따뜻하고 아늑한 빈티지 필터',
    cssClass: 'sepia-[0.15] contrast-95 brightness-105 saturate-105'
  },
  {
    id: 'grayscale',
    name: '추억의 흑백',
    description: '분위기 있는 레트로 흑백 필터',
    cssClass: 'grayscale'
  }
];

export const LAYOUTS: LayoutStyle[] = [
  { id: 'vertical', name: 'Vertical Strip', displayName: '길쭉한 네컷 (1x4)' },
  { id: 'grid', name: 'Grid Layout', displayName: '네모난 네컷 (2x2)' }
];

export const STICKER_OPTIONS = [
  '❤️', '💖', '⭐', '✨', '🎈', '🎉', '🍀', '🌈', 
  '🐥', '🐰', '🦖', '🐻', '🐱', '🐶', '🦊', '🦁',
  '🌸', '🌻', '🍭', '🍦', '🍩', '🍕', '🚗', '✈️',
  '👑', '🕶️', '🎨', '🧩', '🎸', '🧸'
];
