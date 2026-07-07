import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppScreen, Photo } from './types';
import IntroScreen from './components/IntroScreen';
import CameraScreen from './components/CameraScreen';
import PhotoSelectionScreen from './components/PhotoSelectionScreen';
import FrameCustomizerScreen from './components/FrameCustomizerScreen';
import ResultScreen from './components/ResultScreen';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('INTRO');
  const [className, setClassName] = useState('새싹반');
  const [dateStr, setDateStr] = useState('');
  
  // Photo states
  const [capturedPhotos, setCapturedPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [finalCanvas, setFinalCanvas] = useState<HTMLCanvasElement | null>(null);

  // Intro -> Camera
  const handleStart = (selectedClassName: string, selectedDateStr: string) => {
    setClassName(selectedClassName);
    setDateStr(selectedDateStr);
    setScreen('PREPARE'); // Transition to preparation/shooting
  };

  // Camera -> Selection
  const handlePhotosCaptured = (photos: Photo[]) => {
    setCapturedPhotos(photos);
    setScreen('SELECTION');
  };

  // Selection -> Customizer
  const handlePhotosSelected = (photos: Photo[]) => {
    setSelectedPhotos(photos);
    setScreen('CUSTOMIZE');
  };

  // Customizer -> Results
  const handleCustomizationComplete = (canvas: HTMLCanvasElement) => {
    setFinalCanvas(canvas);
    setScreen('DONE');
  };

  // Done -> Intro (Reset all)
  const handleReset = () => {
    setCapturedPhotos([]);
    setSelectedPhotos([]);
    setFinalCanvas(null);
    setScreen('INTRO');
  };

  return (
    <div className="min-h-screen bg-[#FFF9E5] text-[#5D4037] font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Playful Header from Vibrant Palette Theme */}
      <header className="h-20 bg-white px-6 md:px-8 flex items-center justify-between shadow-md border-b-4 border-[#FFD54F] relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF8A65] rounded-2xl flex items-center justify-center shadow-inner select-none">
            <span className="text-2xl">📸</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#E64A19] font-sans">
            우리반 <span className="text-[#FFB300]">네컷</span> 스튜디오
          </h1>
        </div>
        <div className="flex items-center gap-2 select-none">
          <span className="text-sm font-bold bg-[#FFE0B2] text-[#E64A19] px-3.5 py-1 rounded-full border border-[#FFB74D]">
            🎈 어린이 전용
          </span>
        </div>
      </header>

      {/* Background Decorative Grid/Dots Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffd54f_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-35 pointer-events-none z-0" />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-4 md:py-8 relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {screen === 'INTRO' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <IntroScreen onStart={handleStart} />
            </motion.div>
          )}

          {(screen === 'PREPARE' || screen === 'SHOOTING') && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <CameraScreen
                classNameStr={className}
                onBack={() => setScreen('INTRO')}
                onPhotosCaptured={handlePhotosCaptured}
              />
            </motion.div>
          )}

          {screen === 'SELECTION' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <PhotoSelectionScreen
                photos={capturedPhotos}
                onBack={() => setScreen('PREPARE')}
                onPhotosSelected={handlePhotosSelected}
              />
            </motion.div>
          )}

          {screen === 'CUSTOMIZE' && (
            <motion.div
              key="customize"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <FrameCustomizerScreen
                selectedPhotos={selectedPhotos}
                initialClassName={className}
                initialDateStr={dateStr}
                onBack={() => setScreen('SELECTION')}
                onComplete={handleCustomizationComplete}
              />
            </motion.div>
          )}

          {screen === 'DONE' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <ResultScreen
                canvas={finalCanvas}
                classNameStr={className}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer copyright */}
      <footer className="h-12 bg-[#5D4037] text-white flex items-center justify-center text-xs font-medium uppercase tracking-widest relative z-10 select-none font-cute">
        ❤ Our Class Four-Cut Studio - For Little Photographers ❤
      </footer>
    </div>
  );
}
