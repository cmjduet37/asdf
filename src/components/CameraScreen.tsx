import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCw, AlertTriangle, ArrowLeft, Play, Sparkles, Image as ImageIcon } from 'lucide-react';
import { playPopSound, playTickSound, playShutterSound, playSuccessSound } from '../utils/audio';
import { Photo } from '../types';

interface CameraScreenProps {
  classNameStr: string;
  onBack: () => void;
  onPhotosCaptured: (photos: Photo[]) => void;
}

const MOCK_ANIMAL_PHOTOS = [
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&auto=format&fit=crop&q=80', // Lion
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80', // Tiger
  'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80', // Monkeys
  'https://images.unsplash.com/photo-15076664 km-some?w=600&auto=format&fit=crop&q=80', // Actually let's use safe cute cartoon or animal Unsplash photos
];

// Better high-quality cute animal photos
const CUTE_ANIMALS = [
  { name: '행복한 코알라 🐨', url: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=500&auto=format&fit=crop&q=80' },
  { name: '웃는 쿼카 🐹', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&auto=format&fit=crop&q=80' },
  { name: '귀여운 아기 판다 🐼', url: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500&auto=format&fit=crop&q=80' },
  { name: '아기 여우 🦊', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=80' },
  { name: '귀여운 강아지 🐶', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80' }
];

export default function CameraScreen({ classNameStr, onBack, onPhotosCaptured }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  // Shooting states
  const [capturedPhotos, setCapturedPhotos] = useState<Photo[]>([]);
  const [isShooting, setIsShooting] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0); // 0 to 4
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, null
  const [showFlash, setShowFlash] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('카메라 준비 완료! 아래의 촬영 시작 버튼을 눌러주세요.');

  // Initialize camera and list devices
  useEffect(() => {
    async function initCamera() {
      try {
        const initialStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        setStream(initialStream);
        if (videoRef.current) {
          videoRef.current.srcObject = initialStream;
        }

        // List video input devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err: any) {
        console.error('Camera initialization error:', err);
        setCameraError(
          '카메라를 찾을 수 없거나 권한이 거부되었습니다. 가상 동물 스티커 모드로 진행해볼까요?'
        );
        setIsFallbackMode(true);
      }
    }

    if (!isFallbackMode) {
      initCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isFallbackMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Switch camera source
  const handleDeviceChange = async (deviceId: string) => {
    playPopSound();
    stopCamera();
    setSelectedDeviceId(deviceId);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Error switching camera device:', err);
      setCameraError('카메라 전환에 실패했습니다.');
    }
  };

  // Start sequence shooting
  const startShooting = async () => {
    playPopSound();
    if (isShooting) return;
    setIsShooting(true);
    setCapturedPhotos([]);
    setCurrentPhotoIndex(0);
    runShootingCycle(0, []);
  };

  // Single photo shooting cycle
  const runShootingCycle = (photoIndex: number, currentPhotos: Photo[]) => {
    if (photoIndex >= 5) {
      // Completed all 5 shots!
      setTimeout(() => {
        playSuccessSound();
        onPhotosCaptured(currentPhotos);
      }, 800);
      return;
    }

    setCurrentPhotoIndex(photoIndex);
    setStatusMessage(`[${photoIndex + 1}/5] 번째 사진 찍을 준비를 하세요! 📸`);
    
    // Begin 3 seconds countdown
    let count = 3;
    setCountdown(count);
    playTickSound();

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playTickSound();
      } else {
        clearInterval(interval);
        setCountdown(null);
        // Take photo!
        capturePhoto(photoIndex, currentPhotos);
      }
    }, 1000);
  };

  // Capture the frame
  const capturePhoto = (photoIndex: number, currentPhotos: Photo[]) => {
    playShutterSound();
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);

    let photoUrl = '';

    if (isFallbackMode) {
      // Use fallback cartoon animal illustration
      photoUrl = CUTE_ANIMALS[photoIndex % CUTE_ANIMALS.length].url;
    } else {
      // Capture actual webcam frame
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Adjust canvas size to match video resolution
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          // Mirror effect for user preview similarity
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Reset transform
          ctx.setTransform(1, 0, 0, 1, 0, 0);

          photoUrl = canvas.toDataURL('image/png');
        }
      }
    }

    const newPhoto: Photo = {
      id: `photo-${Date.now()}-${photoIndex}`,
      url: photoUrl,
      capturedAt: Date.now(),
    };

    const updatedPhotos = [...currentPhotos, newPhoto];
    setCapturedPhotos(updatedPhotos);

    // Pause briefly so the kid can see their photo, then start next cycle
    setTimeout(() => {
      runShootingCycle(photoIndex + 1, updatedPhotos);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-6 select-none relative">
      {/* Hidden canvas for capturing video frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Screen flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-5">
        <button
          onClick={() => {
            playPopSound();
            onBack();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFD54F] text-[#5D4037] font-bold shadow-[0_4px_0_#F9A825] active:translate-y-1 active:shadow-none transition-all cursor-pointer border-none"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3px]" />
          <span>처음으로</span>
        </button>

        <div className="bg-[#FFE0B2] border-2 border-[#FFB74D] rounded-full px-5 py-1.5 text-[#E64A19] font-bold flex items-center gap-2 shadow-sm">
          <span className="text-xl">🎒</span>
          <span>{classNameStr} 친구들</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        {/* Left Column: Cam Preview and controls (takes 3 cols) */}
        <div className="md:col-span-3 flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-3xl border-8 border-[#FFCDD2] bg-slate-900 overflow-hidden shadow-xl">
            {/* Countdown Overlay */}
            <AnimatePresence>
              {countdown !== null && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  key={countdown}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 z-30 pointer-events-none"
                >
                  <span className="text-8xl md:text-9xl font-black text-[#FFD54F] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] font-sans">
                    {countdown}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Camera Stream */}
            {!isFallbackMode && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]" // mirrored
              />
            )}

            {/* Fallback Cartoon Preview */}
            {isFallbackMode && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#FFF9E5] text-center">
                {isShooting ? (
                  <motion.div 
                    key={currentPhotoIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <img
                      src={CUTE_ANIMALS[currentPhotoIndex % CUTE_ANIMALS.length].url}
                      alt="Cute animal preview"
                      className="w-48 h-48 rounded-2xl object-cover border-4 border-[#FFD54F] shadow-md mb-2"
                    />
                    <p className="text-xl font-bold text-[#E64A19]">
                      찰칵! {CUTE_ANIMALS[currentPhotoIndex % CUTE_ANIMALS.length].name} 카드 캡처 중!
                    </p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center max-w-sm">
                    <div className="p-4 bg-[#FFE0B2] rounded-full mb-3">
                      <ImageIcon className="w-10 h-10 text-[#E64A19] animate-bounce" />
                    </div>
                    <p className="font-bold text-[#5D4037] text-lg mb-1">
                      카메라 대신 귀여운 동물 사진 카드로!
                    </p>
                    <p className="text-sm text-[#5D4037]/70">
                      카메라를 켜지 않아도 귀여운 네컷을 만들어볼 수 있어요. 아래 시작 버튼을 눌러보세요!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Status Pill */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 z-20">
              <span className={`w-2.5 h-2.5 rounded-full ${isShooting ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{isShooting ? '촬영 진행 중 (움직이지 마세요!)' : '촬영 대기 중'}</span>
            </div>
          </div>

          {/* Status Message */}
          <div className="mt-4 w-full text-center bg-white border-4 border-dashed border-[#FF8A65] py-3.5 px-5 rounded-2xl shadow-md">
            <span className="text-[#E64A19] font-black text-lg md:text-xl font-cute">
              {statusMessage}
            </span>
          </div>

          {/* Camera Settings & Control Bar */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center items-center w-full">
            {/* Device Toggle if multi-camera */}
            {!isFallbackMode && devices.length > 1 && !isShooting && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#5D4037]">카메라 선택:</span>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleDeviceChange(e.target.value)}
                  className="bg-white border-2 border-[#FFD54F] text-[#5D4037] py-1.5 px-3 rounded-xl focus:outline-none focus:border-[#E64A19] font-bold text-sm"
                >
                  {devices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `카메라 ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Switch Mode Button */}
            {!isShooting && (
              <button
                onClick={() => {
                  playPopSound();
                  setIsFallbackMode(!isFallbackMode);
                  setCameraError(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#FFB74D] text-[#E64A19] font-bold bg-[#FFE0B2]/30 hover:bg-[#FFE0B2]/50 text-xs md:text-sm transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isFallbackMode ? '카메라 모드로 가기' : '가상 동물 모드로 가기'}</span>
              </button>
            )}

            {/* Capture Action Trigger */}
            <div className="w-full flex justify-center mt-2">
              <motion.button
                whileHover={{ scale: isShooting ? 1 : 1.02 }}
                whileTap={{ scale: isShooting ? 1 : 0.98 }}
                onClick={startShooting}
                disabled={isShooting}
                className={`px-10 py-4 rounded-full font-black text-xl md:text-2xl shadow-[0_6px_0_#388E3C] flex items-center gap-3 active:translate-y-1.5 active:shadow-none transition-all border-none cursor-pointer select-none ${
                  isShooting
                    ? 'bg-gray-300 shadow-[0_6px_0_#9e9e9e] text-gray-500 cursor-not-allowed'
                    : 'bg-[#81C784] text-white hover:bg-[#66bb6a]'
                }`}
              >
                {isShooting ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>찰칵 촬영 중... ({capturedPhotos.length}/5)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-white stroke-none" />
                    <span>찰칵! 촬영 시작하기</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column: Captured Photos Sidebar */}
        <div className="bg-white rounded-3xl border-8 border-[#FFCDD2] p-4 shadow-xl flex flex-col h-full min-h-[300px]">
          <h3 className="text-center font-bold text-[#5D4037] text-lg border-b-2 border-[#FFCDD2]/30 pb-2 mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFB300] fill-[#FFB300]" />
            <span>찍힌 사진 ({capturedPhotos.length}/5)</span>
          </h3>

          <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-1 gap-3 max-h-[400px] pr-1">
            {Array.from({ length: 5 }).map((_, idx) => {
              const photo = capturedPhotos[idx];
              return (
                <div
                  key={idx}
                  className={`relative aspect-[4/3] rounded-xl border-2 flex items-center justify-center overflow-hidden bg-[#FFF9E5]/30 ${
                    currentPhotoIndex === idx && isShooting
                      ? 'border-[#FFD54F] bg-[#FFE0B2] ring-4 ring-[#FFD54F]/50'
                      : 'border-gray-200'
                  }`}
                >
                  {photo ? (
                    <motion.img
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      src={photo.url}
                      alt={`Captured ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#FFCDD2] font-black text-2xl">{idx + 1}</span>
                  )}

                  {/* Tiny indicator badge */}
                  <div className="absolute top-1.5 left-1.5 bg-[#FF8A65] text-white font-black text-xs w-5 h-5 rounded-full flex items-center justify-center border border-white">
                    {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
