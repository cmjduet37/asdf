/**
 * Shared Type Definitions for the Kindergarten Four-Cut App
 */

export type AppScreen = 'INTRO' | 'PREPARE' | 'SHOOTING' | 'SELECTION' | 'CUSTOMIZE' | 'DONE';

export interface Photo {
  id: string;
  url: string; // base64 or object URL
  capturedAt: number;
}

export interface Sticker {
  id: string;
  emoji: string;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  scale?: number;
  rotation?: number; // degrees
}

export interface FrameStyle {
  id: string;
  name: string;
  displayName: string;
  bgColor: string; // tailwind color class for UI representation
  bgHex: string;   // hex code for canvas rendering
  textHex: string; // text hex color for canvas rendering
  borderClass: string;
  textColor: string;
  emoji: string;
  stickers: Omit<Sticker, 'id'>[]; // default background stickers
}

export type FilterType = 'normal' | 'bright' | 'vintage' | 'grayscale';

export interface FilterInfo {
  id: FilterType;
  name: string;
  description: string;
  cssClass: string;
}

export interface LayoutStyle {
  id: 'vertical' | 'grid';
  name: string;
  displayName: string;
}
