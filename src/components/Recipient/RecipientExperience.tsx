import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SurpriseData } from '../../types';
import { Heart, Gift, Sparkles, ChevronRight, ChevronLeft, MailOpen } from 'lucide-react';
import { Button } from '../DesignSystem';

// --- Intro Screen ---
const Intro = ({ name, intro, onNext }: { name: string, intro?: string, onNext: () => void }) => {
  useEffect(() => {
    // Eagerly preload cake assets during Intro screen so Step 2 transitions instantly
    const preload = (src: string) => {
      const img = new Image();
      img.src = src;
    };
    preload('/cake-scene-bg.webp');
    preload('/cake-static.webp');
    preload('/cake-lit.webp');
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen w-full flex items-center justify-center text-center px-4 overflow-hidden bg-cover bg-center select-none"
      style={{ backgroundImage: `url('/intro-bg.webp')` }}
    >
      {/* Subtle vignette for edge richness */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Content precisely positioned over the central parchment paper area */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto py-10 px-4 sm:px-6 flex flex-col items-center justify-center">
        <motion.p 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-[11px] sm:text-xs uppercase tracking-[0.22em] font-semibold text-[#5a3a24] mb-3 sm:mb-4 drop-shadow-sm font-sans"
        >
          {intro || `A birthday celebration crafted with love for ${name} ✨`}
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-serif leading-[1.12] text-[#24110d] tracking-tight mb-8 sm:mb-10"
        >
          {name},<br />
          <span className="italic font-normal">this is for you.</span>{' '}
          <span className="text-rose-600 inline-block drop-shadow-sm">❤️</span>
        </motion.h1>

        {/* iPhone Style Glass Screen Transparent Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <button 
            onClick={onNext}
            className="group relative overflow-hidden px-8 py-3.5 sm:px-9 sm:py-4 rounded-full text-base sm:text-lg font-semibold tracking-wide text-[#2b120c] backdrop-blur-xl bg-white/45 hover:bg-white/60 active:scale-95 transition-all duration-300 shadow-[0_10px_30px_rgba(40,10,15,0.18),inset_0_1px_1.5px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.06)] border border-white/70 flex items-center justify-center gap-3 cursor-pointer"
          >
            {/* Specular glass reflection overlay */}
            <span className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-full opacity-80" />
            <span className="relative z-10 flex items-center gap-2.5 font-medium">
              <span>Open Your Surprise</span>
              <span className="text-xl group-hover:scale-110 transition-transform">🎁</span>
            </span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Helper to get ordinal age string (e.g. 18 -> "18th", 21 -> "21st", 22 -> "22nd", 23 -> "23rd")
function getOrdinal(n?: string | number): string {
  if (!n) return '';
  const num = parseInt(String(n), 10);
  if (isNaN(num) || num <= 0) return '';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Helper to format relationship phrase (e.g. "Best Friend" -> "My Best Friend", "Sister" -> "My Sister")
function getRelationshipPhrase(rel?: string, name?: string): string {
  if (!rel || rel.toLowerCase() === 'other') {
    return name ? name : 'Friend';
  }
  const clean = rel.trim();
  if (clean.toLowerCase().startsWith('my ')) {
    return clean;
  }
  return `My ${clean}`;
}

// --- Floating Celebratory Balloons ---
const BALLOON_COLORS = [
  { main: '#f43f5e', knot: '#be123c' },
  { main: '#ec4899', knot: '#be185d' },
  { main: '#a855f7', knot: '#7e22ce' },
  { main: '#fbbf24', knot: '#d97706' },
  { main: '#38bdf8', knot: '#0284c7' },
  { main: '#fb7185', knot: '#e11d48' },
  { main: '#f472b6', knot: '#db2777' },
  { main: '#c084fc', knot: '#9333ea' }
];

const BALLOON_CONFIGS = [
  { left: '6%', delay: 0, duration: 6, scale: 1 },
  { left: '16%', delay: 0.4, duration: 5.5, scale: 0.85 },
  { left: '26%', delay: 0.8, duration: 6.5, scale: 1.1 },
  { left: '38%', delay: 0.2, duration: 5.8, scale: 0.9 },
  { left: '52%', delay: 0.9, duration: 6.2, scale: 1.05 },
  { left: '64%', delay: 0.3, duration: 5.4, scale: 0.8 },
  { left: '76%', delay: 0.7, duration: 6.8, scale: 1 },
  { left: '88%', delay: 0.1, duration: 5.7, scale: 0.95 },
  { left: '14%', delay: 1.4, duration: 6.1, scale: 0.9 },
  { left: '46%', delay: 1.6, duration: 5.9, scale: 1.1 },
  { left: '72%', delay: 1.3, duration: 6.4, scale: 0.85 },
  { left: '84%', delay: 1.8, duration: 5.6, scale: 1 }
];

const FloatingBalloons = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
    {BALLOON_CONFIGS.map((b, i) => {
      const color = BALLOON_COLORS[i % BALLOON_COLORS.length];
      return (
        <motion.div
          key={i}
          initial={{ y: '110vh', x: 0, opacity: 0.92 }}
          animate={{ 
            y: '-130vh',
            x: [0, 15, -15, 10, 0]
          }}
          transition={{
            y: { duration: b.duration, delay: b.delay, ease: 'easeOut', repeat: Infinity },
            x: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{ left: b.left, transform: `scale(${b.scale})` }}
          className="absolute bottom-0"
        >
          <svg width="46" height="66" viewBox="0 0 46 66" fill="none" className="filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            <ellipse cx="23" cy="23" rx="21" ry="23" fill={color.main} />
            {/* 3D Sheen Highlight */}
            <ellipse cx="16" cy="14" rx="7" ry="10" fill="white" opacity="0.45" transform="rotate(-25 16 14)" />
            {/* Knot */}
            <polygon points="21,46 25,46 24,50 22,50" fill={color.knot} />
            {/* String */}
            <path d="M23 50 Q 20 57, 24 61 T 22 66" stroke="rgba(100,50,50,0.4)" strokeWidth="1.2" fill="none" />
          </svg>
        </motion.div>
      );
    })}
  </div>
);

// --- Cake Screen ---
const CAKE_BG = '/cake-scene-bg.webp';
const CAKE_STATIC_PNG = '/cake-static.webp';
const CAKE_LIT_GIF = '/cake-lit.webp';

const CakeView = ({ data, onNext }: { data: SurpriseData, onNext: () => void }) => {
  const [lit, setLit] = useState(false);

  useEffect(() => {
    // Preload gallery, letter, and romantic backgrounds during cake step
    const preload = (src: string) => {
      const img = new Image();
      img.src = src;
    };
    preload('/gallery-bg.webp');
    preload('/letter-bg-desktop.webp');
    preload('/letter-bg-mobile.webp');
    preload('/things-i-love-bg.jpeg');
  }, []);

  const ordinalAge = getOrdinal(data.recipientAge);
  const relationshipPhrase = getRelationshipPhrase(data.relationship, data.recipientName);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-between select-none"
    >
      {/* Soft romantic placeholder gradient to eliminate any blank screen on slow networks */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fce7f3] via-[#fdf2f8] to-[#fbcfe8] z-0" />

      {/* 1. Background Image: Room with wooden floral stool table */}
      <img
        src={CAKE_BG}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (img.src.includes('.webp')) {
            img.src = '/cake-scene-bg.png';
          }
        }}
        alt="Birthday Room Background"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-0"
      />

      {/* Floating balloons upward when lit */}
      {lit && <FloatingBalloons />}

      {/* 4. Top Area: Button before lighting candle, Animated Headline after lighting */}
      <div className="relative z-30 w-full max-w-lg mx-auto pt-10 sm:pt-14 px-4 flex flex-col items-center text-center">
        {!lit ? (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center space-y-3"
          >
            <button 
              onClick={() => setLit(true)} 
              className="group relative overflow-hidden px-8 py-3.5 sm:px-9 sm:py-4 rounded-full text-sm sm:text-base font-semibold tracking-wide text-rose-950 backdrop-blur-xl bg-white/45 hover:bg-white/60 active:scale-95 transition-all duration-300 shadow-[0_12px_35px_rgba(180,30,80,0.18),inset_0_1px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(0,0,0,0.06)] border border-white/70 flex items-center gap-3 cursor-pointer"
            >
              {/* Specular glass reflection overlay */}
              <span className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-full opacity-90" />
              <span className="relative z-10 flex items-center gap-2.5">
                <span className="text-xl animate-pulse group-hover:scale-110 transition-transform">🕯️</span>
                <span className="font-semibold text-stone-900 tracking-wide">Light the Candle</span>
              </span>
            </button>
            <p className="text-xs text-rose-900/70 font-serif italic tracking-wide">
              Tap to light the birthday candles ✨
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="birthday-message"
            initial={{ opacity: 0, scale: 0.85, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center space-y-1.5"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-rose-800/80 font-sans"
            >
              ✨ A Special Celebration ✨
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold text-[#781b2c] tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]"
            >
              Happiest {ordinalAge ? `${ordinalAge} ` : ''}Birthday
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="text-lg sm:text-xl md:text-2xl font-serif italic text-rose-900 font-semibold"
            >
              {relationshipPhrase} <span className="text-rose-600 not-italic">❤️</span>
            </motion.p>
          </motion.div>
        )}
      </div>

      {/* 2 & 3. Cake fixed at the stool/table */}
      {/* Both static cake and lit animated cake have identical dimensions and stool base placement */}
      <div className="absolute bottom-[27%] sm:bottom-[28%] md:bottom-[28%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center justify-end pointer-events-none">
        {/* Glow halo when lit */}
        <AnimatePresence>
          {lit && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute -top-10 w-72 h-72 bg-amber-400/25 blur-[55px] rounded-full pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Dynamic Cake rendering based on creator choice */}
        {(() => {
          const isPinkCake = Boolean(
            data?.cakeUrl && (
              data.cakeUrl.includes('celebration-pink') || 
              data.cakeUrl.includes('IMG-2620') ||
              data.cakeUrl.includes('cake-option-2')
            )
          );
          const staticCakeSrc = isPinkCake ? '/cake-celebration-pink.webp' : CAKE_STATIC_PNG;
          const litCakeSrc = isPinkCake ? (data.cakeUrl || '/cake-celebration-pink-lit.webp') : CAKE_LIT_GIF;

          return (
            <div className="relative w-48 sm:w-54 md:w-60 flex items-end justify-center">
              <AnimatePresence mode="wait">
                {!lit ? (
                  // Static Cake on pedestal stand resting on the table
                  <motion.div
                    key="static-cake"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex items-end justify-center"
                  >
                    <img
                      src={staticCakeSrc}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (isPinkCake) {
                          img.src = '/cake-celebration-pink.png';
                        } else if (img.src.includes('.webp')) {
                          img.src = '/cake-static.png';
                        }
                      }}
                      alt="Birthday Cake on Stand"
                      className="w-full h-auto object-contain filter drop-shadow-[0_16px_25px_rgba(0,0,0,0.3)] select-none pointer-events-none"
                    />
                  </motion.div>
                ) : (
                  // Lit animated cake with flickering candles and warm celebration glow
                  <motion.div
                    key="lit-cake"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex items-end justify-center"
                  >
                    <img
                      src={litCakeSrc}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (isPinkCake) {
                          if (img.src.includes('-lit.webp')) {
                            img.src = '/cake-celebration-pink.gif';
                          } else {
                            img.src = 'https://i.postimg.cc/nV5BPHSS/IMG-2620.gif';
                          }
                        } else if (img.src.includes('.webp')) {
                          img.src = '/cake-lit-cropped.gif';
                        } else {
                          img.src = '/cake-lit.gif';
                        }
                      }}
                      alt="Celebration Birthday Cake with Lit Candle"
                      className="w-full h-auto object-contain filter drop-shadow-[0_18px_30px_rgba(217,70,239,0.35)] select-none pointer-events-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}
      </div>

      {/* Bottom continuation button when lit */}
      <div className="relative z-30 pb-6 sm:pb-8 flex justify-center w-full px-4 min-h-[60px]">
        {lit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Button 
              onClick={onNext}
              className="shadow-[0_10px_30px_rgba(136,19,55,0.4)] px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold bg-[#881337] hover:bg-[#9f1239] text-white transition-all transform hover:scale-105 flex items-center gap-2 border border-white/20 cursor-pointer pointer-events-auto"
            >
              <span>Make a Wish & Continue ✨</span>
              <span>→</span>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// --- Fluttering Butterfly Component ---
const Butterfly = ({ 
  style, 
  scale = 1, 
  color = '#f472b6', 
  color2 = '#fb7185',
  flightPath = { x: [0, 30, -20, 0], y: [0, -25, -10, 0], rotate: [-10, 15, -5, -10] },
  duration = 10 
}: { 
  style?: React.CSSProperties, 
  scale?: number, 
  color?: string, 
  color2?: string,
  flightPath?: { x: number[], y: number[], rotate: number[] },
  duration?: number 
}) => {
  const gradId = color.replace(/[^a-zA-Z0-9]/g, '');
  return (
    <motion.div
      style={style}
      animate={flightPath}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute pointer-events-none select-none z-20"
    >
      <div 
        style={{ transform: `scale(${scale})` }} 
        className="relative flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(244,114,182,0.4)]"
      >
        {/* Left Wing */}
        <div className="animate-wing-left">
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
            <path
              d="M20 13C16 4 4 1 1 7C-2 13 6 18 10 18C14 18 18 24 20 25L20 13Z"
              fill={`url(#wingGradLeft_${gradId})`}
              opacity="0.9"
            />
            <defs>
              <linearGradient id={`wingGradLeft_${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color2} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Slender Body */}
        <div className="w-[2.5px] h-4 bg-[#781b2c] rounded-full z-10 -mx-[1px] relative">
          <div className="absolute -top-1.5 -left-1 w-1.5 h-1.5 border-t border-l border-[#781b2c] rounded-tl-full rotate-[15deg]" />
          <div className="absolute -top-1.5 -right-1 w-1.5 h-1.5 border-t border-r border-[#781b2c] rounded-tr-full rotate-[-15deg]" />
        </div>

        {/* Right Wing */}
        <div className="animate-wing-right">
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
            <path
              d="M2 13C6 4 18 1 21 7C24 13 16 18 12 18C8 18 4 24 2 25L2 13Z"
              fill={`url(#wingGradRight_${gradId})`}
              opacity="0.9"
            />
            <defs>
              <linearGradient id={`wingGradRight_${gradId}`} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color2} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

// --- Draggable Floating Polaroid Gallery Screen ---
const GALLERY_BG = '/gallery-bg.webp';
const DEFAULT_CAPTIONS = [
  "Cutie 💖",
  "My Love ✨",
  "Always You 🌸",
  "Dream Girl 🥰",
  "Sweet Moments 🌟",
  "Forever ❤️",
  "Best Memory 💫"
];

const PHOTO_POSITIONS = [
  "left-[8%] top-[14%] md:left-[9%] md:top-[18%]",
  "left-[48%] top-[16%] md:left-[27%] md:top-[15%]",
  "left-[10%] top-[40%] md:left-[46%] md:top-[22%]",
  "left-[50%] top-[44%] md:left-[65%] md:top-[16%]",
  "left-[28%] top-[64%] md:left-[83%] md:top-[22%]"
];

const PHOTO_ROTATIONS = [-5, 4, -3, 6, -4];

interface PolaroidCardProps {
  memory: any;
  idx: number;
  data: SurpriseData;
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentZ: number;
  bringToFront: (id: string | number) => void;
  key?: React.Key;
}

// --- 3D Flippable Polaroid Card Component ---
const PolaroidCard: React.FC<PolaroidCardProps> = ({
  memory,
  idx,
  data,
  containerRef,
  currentZ,
  bringToFront
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const id = memory.id || `photo_${idx}`;
  const rotation = PHOTO_ROTATIONS[idx % PHOTO_ROTATIONS.length];
  const positionClass = PHOTO_POSITIONS[idx % PHOTO_POSITIONS.length];
  const caption = memory.caption || data.memory_captions?.[idx] || DEFAULT_CAPTIONS[idx % DEFAULT_CAPTIONS.length];
  const hiddenMessage = memory.hiddenMessage;

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.15}
      onPointerDown={() => bringToFront(id)}
      style={{ zIndex: currentZ, perspective: 1000 }}
      initial={{ opacity: 0, scale: 0.8, rotate: rotation }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        rotate: rotation,
        y: [0, -7, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay: idx * 0.1 },
        scale: { duration: 0.5, delay: idx * 0.1 },
        y: { duration: 3.4 + (idx % 3) * 0.7, repeat: Infinity, ease: 'easeInOut' }
      }}
      whileHover={{ scale: 1.04, cursor: 'grab' }}
      whileDrag={{ scale: 1.08, cursor: 'grabbing', zIndex: 999 }}
      className={`absolute ${positionClass} w-44 sm:w-52 md:w-60 lg:w-64 max-w-[85vw] select-none touch-none`}
    >
      {/* Cute Washi Tape at top */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3.5 bg-rose-200/80 backdrop-blur-[1px] rotate-[-2deg] rounded-[1px] shadow-sm border border-white/60 pointer-events-none z-30" />

      {/* 3D Flipping Card Container */}
      <motion.div
        onTap={() => setIsFlipped(f => !f)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full rounded-sm shadow-[0_15px_35px_rgba(0,0,0,0.18)] hover:shadow-[0_22px_50px_rgba(0,0,0,0.26)] transition-shadow cursor-pointer"
      >
        {/* FRONT FACE (The Polaroid Photo & Caption) */}
        <div 
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="w-full bg-white p-2 sm:p-2.5 pb-3 sm:pb-3.5 rounded-sm"
        >
          {/* Photo inside white Polaroid frame - displays natural uncropped proportions */}
          <div className="w-full overflow-hidden rounded-[2px] bg-stone-100/50 pointer-events-none border border-black/5 flex items-center justify-center">
            <img 
              src={memory.url} 
              alt={caption} 
              className="w-full h-auto max-h-[50vh] object-contain block select-none pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Handwritten style caption */}
          <p className="pt-2 sm:pt-2.5 text-center text-xs sm:text-sm font-serif font-medium text-stone-700 tracking-wide select-none truncate px-1">
            {caption}
          </p>

          {/* Subtle tap to flip prompt */}
          <div className="pt-1 flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-stone-400 font-sans tracking-wide">
            <span>💌 Tap to flip</span>
          </div>
        </div>

        {/* BACK FACE (Hidden Message revealed in 3D flip!) */}
        <div 
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)' 
          }}
          className="absolute inset-0 w-full h-full bg-[#fdfbf7] p-3 sm:p-4 rounded-sm border border-stone-200/80 flex flex-col justify-between shadow-inner"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200/70 pb-1.5 sm:pb-2">
            <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.16em] font-bold text-[#881337]">
              Secret Note 💌
            </span>
            <span className="text-xs sm:text-sm">❤️</span>
          </div>

          {/* Hidden Message */}
          <div className="my-auto py-2 px-1 text-center overflow-y-auto max-h-[40vh]">
            <p className="font-serif italic text-stone-800 text-xs sm:text-sm md:text-base leading-relaxed">
              "{hiddenMessage || `A cherished memory with you, ${data.recipientName} ✨ You bring endless light and happiness into my life.`}"
            </p>
          </div>

          {/* Flip back instruction */}
          <div className="pt-1.5 sm:pt-2 border-t border-stone-200/70 text-center">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-stone-400 font-sans font-medium">
              (Tap to flip back)
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const GalleryView = ({ memories, data, onNext }: { memories: any[], data: SurpriseData, onNext: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zIndices, setZIndices] = useState<{ [key: string]: number }>({});
  const [maxZ, setMaxZ] = useState(10);

  const photoList = memories && memories.length > 0 ? memories : (data.memories || []);

  const bringToFront = (id: string | number) => {
    const nextZ = maxZ + 1;
    setMaxZ(nextZ);
    setZIndices(prev => ({ ...prev, [id]: nextZ }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen w-full overflow-hidden select-none"
    >
      {/* 16:9 Local Watercolor Wallpaper */}
      <img
        src={GALLERY_BG}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (img.src.includes('.webp')) {
            img.src = '/gallery-bg.png';
          }
        }}
        alt="Floral watercolor background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />

      {/* Fluttering Butterflies floating gracefully across screen */}
      <Butterfly
        style={{ top: '8%', left: '5%' }}
        scale={0.9}
        color="#f472b6"
        color2="#fb7185"
        flightPath={{ x: [0, 45, 10, 0], y: [0, -35, -15, 0], rotate: [-10, 20, -5, -10] }}
        duration={12}
      />
      <Butterfly
        style={{ top: '12%', right: '7%' }}
        scale={0.8}
        color="#fb7185"
        color2="#fda4af"
        flightPath={{ x: [0, -40, -10, 0], y: [0, -25, -5, 0], rotate: [10, -15, 5, 10] }}
        duration={10}
      />
      <Butterfly
        style={{ top: '50%', left: '42%' }}
        scale={1.15}
        color="#ec4899"
        color2="#f43f5e"
        flightPath={{ x: [0, 50, -30, 0], y: [0, -40, -15, 0], rotate: [-15, 25, -10, -15] }}
        duration={15}
      />
      <Butterfly
        style={{ bottom: '15%', left: '8%' }}
        scale={0.85}
        color="#f43f5e"
        color2="#fb7185"
        flightPath={{ x: [0, 35, -15, 0], y: [0, -30, -10, 0], rotate: [5, -20, 10, 5] }}
        duration={11}
      />
      <Butterfly
        style={{ bottom: '18%', right: '10%' }}
        scale={1}
        color="#fb7185"
        color2="#f472b6"
        flightPath={{ x: [0, -45, 15, 0], y: [0, -35, -10, 0], rotate: [-12, 18, -8, -12] }}
        duration={13}
      />

      {/* Header bar */}
      <header className="absolute top-4 sm:top-6 left-0 right-0 z-30 text-center pointer-events-none px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#6b2535] drop-shadow-sm tracking-tight">
          Some Sweet Moments 📸
        </h2>
        <p className="text-xs sm:text-sm text-[#8a424e]/85 font-sans mt-0.5 font-medium">
          Drag photos & tap any photo to reveal its secret message ✨
        </p>
      </header>

      {/* Interactive Draggable & Floating Canvas */}
      <div 
        ref={containerRef} 
        className="relative w-full h-screen overflow-hidden z-10"
      >
        {photoList.map((memory: any, idx: number) => {
          const id = memory.id || `photo_${idx}`;
          const currentZ = zIndices[id] || (idx + 5);

          return (
            <PolaroidCard
              key={id}
              memory={memory}
              idx={idx}
              data={data}
              containerRef={containerRef}
              currentZ={currentZ}
              bringToFront={bringToFront}
            />
          );
        })}
      </div>

      {/* Floating Continue Button in iPhone glass skin style */}
      <div className="absolute bottom-5 sm:bottom-7 left-0 right-0 z-40 flex justify-center px-4 pointer-events-auto">
        <button 
          onClick={onNext}
          className="group relative px-8 sm:px-10 py-3 sm:py-3.5 rounded-full font-medium text-xs sm:text-sm tracking-wide text-white/95 transition-all duration-300 ease-out active:scale-95 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_0_rgba(255,255,255,0.25)] border border-white/35 hover:border-white/60 bg-white/15 hover:bg-white/25 backdrop-blur-md overflow-hidden flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          }}
        >
          <span className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/35 to-transparent rounded-t-full pointer-events-none" />
          <span className="relative z-10 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            Continue →
          </span>
        </button>
      </div>
    </motion.div>
  );
};

// --- Letter Screen: Genuine 3D Book Experience ---
const MOBILE_LETTER_IMG = '/letter-bg-mobile.webp';
const DESKTOP_LETTER_IMG = '/letter-bg-desktop.webp';

const LetterView = ({ message, aiMessage, name, finalMessage }: { message: string, aiMessage?: string, name: string, finalMessage?: string }) => {
  const [opened, setOpened] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    // Preload both mobile and desktop stationery images for instantaneous rendering
    const imgM = new Image();
    imgM.src = MOBILE_LETTER_IMG;
    const imgD = new Image();
    imgD.src = DESKTOP_LETTER_IMG;
  }, []);

  const handleOpenBook = () => {
    if (isFlipping || opened) return;
    setIsFlipping(true);
    setOpened(true);
    setTimeout(() => {
      setIsFlipping(false);
    }, 1400);
  };

  const handleCloseBook = () => {
    if (isFlipping || !opened) return;
    setIsFlipping(true);
    setOpened(false);
    setTimeout(() => {
      setIsFlipping(false);
    }, 1400);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 text-center select-none"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 cinematic-gradient pointer-events-none -z-10" />

      {/* Header Prompt */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-3 sm:mb-5 space-y-1 z-10"
      >
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-rose-300/80 font-sans block">
          {opened ? "✦ A Memory to Cherish ✦" : "✦ A Handwritten Keepsake ✦"}
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white drop-shadow-md">
          {opened ? `With love for ${name} ❤️` : "There's something I want to tell you..."}
        </h2>
      </motion.div>

      {/* 3D BOOK STAGE CONTAINER (Strictly NO overflow:hidden so 3D perspective works in Safari/WebKit) */}
      <div className="relative w-full max-w-[390px] aspect-[736/1308] max-h-[82vh] md:max-w-4xl md:aspect-[1672/941] md:max-h-[80vh] mx-auto book-perspective">
        
        {/* =========================================================================
            LAYER 1: STATIONERY PAGE (Right / Base Page - Fixed under the cover)
            ========================================================================= */}
        <div className="absolute inset-0 rounded-[24px] md:rounded-[34px] overflow-hidden text-left bg-[#fbf7ee] book-page-depth z-10 border border-white/20">
          
          {/* Mobile Vertical Stationery */}
          <img 
            src={MOBILE_LETTER_IMG}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/letter-bg-mobile.png'; }}
            alt="Birthday stationery"
            className="md:hidden absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Desktop Horizontal Stationery */}
          <img 
            src={DESKTOP_LETTER_IMG}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/letter-bg-desktop.png'; }}
            alt="Birthday stationery"
            className="hidden md:block absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Left spine crease shadow where page meets book hinge */}
          <div className="absolute inset-y-0 left-0 w-8 md:w-14 bg-gradient-to-r from-stone-900/30 via-stone-900/10 to-transparent pointer-events-none z-20" />

          {/* 1. "A Letter for You" (Positioned in the red circled area: top-right to the right of the flower) */}
          <div className="absolute top-[6.5%] right-[8%] md:top-[7%] md:left-0 md:right-0 md:text-center z-20 pointer-events-none">
            <span className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-[0.25em] font-bold text-[#881337]/80 font-sans">
              A Letter for You
            </span>
          </div>

          {/* 2. "Happy Birthday, {name}" (Shifted a few pixels down below the flower with comfortable clearance) */}
          <div className="absolute top-[18.5%] left-[7.5%] right-[7.5%] md:top-[16%] md:left-[18%] md:right-[18%] md:text-center z-20 pointer-events-none">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#781b2c] tracking-tight leading-tight">
              Happy Birthday, {name} <span className="text-[#be123c]">❤️</span>
            </h2>
          </div>

          {/* 3. The Green Boxed Area (Dedicated scrollable birthday message container strictly bounded above bottom stickers) */}
          <div className="absolute top-[28.5%] bottom-[26.5%] left-[7.5%] right-[7.5%] md:top-[28%] md:bottom-[18%] md:left-[18%] md:right-[18%] z-20 overflow-y-auto pr-1.5 sm:pr-2 [scrollbar-width:thin] [scrollbar-color:rgba(120,27,44,0.3)_transparent] flex flex-col justify-between">
            <div className="space-y-4 md:space-y-5">
              <div className="font-serif text-sm sm:text-base md:text-lg leading-relaxed text-[#261510] font-medium whitespace-pre-wrap">
                {aiMessage || message || "No words can describe how much you mean to me. You are a constant light in my life, and I'm so grateful for every moment we share."}
              </div>

              {message && message !== aiMessage && (
                <div className="pt-3 border-t border-[#781b2c]/15 space-y-1">
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#881337] font-bold font-sans">
                    Personal Note
                  </span>
                  <p className="font-serif text-xs sm:text-sm md:text-base italic text-[#381c14] whitespace-pre-wrap leading-relaxed">
                    "{message}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 mt-4 border-t border-[#781b2c]/15 flex items-center justify-between text-[11px] md:text-xs text-[#52251a] font-serif italic">
              <span>With all my love & best wishes ✨</span>
              <span>Happy Birthday ❤️</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            LAYER 2: ROTATING 3D FRONT FLAP (Hinged at left edge: rotates 0deg -> -180deg)
            ========================================================================= */}
        <motion.div
          initial={false}
          animate={{
            rotateY: opened ? -180 : 0
          }}
          transition={{
            duration: 1.3,
            ease: [0.25, 1, 0.4, 1]
          }}
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            WebkitTransformOrigin: 'left center',
            pointerEvents: opened ? 'none' : 'auto'
          }}
          className="absolute inset-0 rounded-[24px] md:rounded-[34px] book-preserve-3d book-spine-origin z-30"
        >
          {/* --- FRONT COVER FACE (Visible when closed, rotateY: 0deg) --- */}
          <div 
            onClick={handleOpenBook}
            className="absolute inset-0 rounded-[24px] md:rounded-[34px] book-backface-hidden overflow-hidden book-cover-depth cursor-pointer flex flex-col items-center justify-between p-6 sm:p-10 select-none border border-amber-300/35"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, #7d152a 0%, #4c0715 65%, #2a030b 100%)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            {/* Gilded decorative corner frames */}
            <div className="absolute inset-3 sm:inset-4 rounded-[18px] md:rounded-[26px] border border-amber-300/40 pointer-events-none" />
            <div className="absolute inset-4 sm:inset-5 rounded-[15px] md:rounded-[23px] border border-amber-400/20 pointer-events-none" />

            {/* Left spine banding texture */}
            <div className="absolute inset-y-0 left-0 w-6 sm:w-8 bg-gradient-to-r from-black/60 via-black/25 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-2 w-[1px] bg-amber-400/30 pointer-events-none" />

            {/* Top Cover Foil Header */}
            <div className="relative z-10 pt-2 text-center space-y-1">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] font-bold text-amber-200/90 font-sans block">
                ✦ SPECIAL BIRTHDAY EDITION ✦
              </span>
              <p className="text-[11px] font-serif italic text-rose-200/75">
                A keepsake made just for you
              </p>
            </div>

            {/* Center Ornate Wax Seal & Book Title */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-5 my-auto">
              {/* Wax Seal with Gold Trim & Ribbon */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#9f1239] via-[#881337] to-[#4c0519] shadow-[0_12px_25px_rgba(0,0,0,0.6)] border-2 border-amber-300/70 flex items-center justify-center transform hover:scale-105 transition-transform">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-amber-300/40 flex items-center justify-center">
                    <Heart className="w-9 h-9 sm:w-11 sm:h-11 text-amber-200 fill-amber-300/30 filter drop-shadow" />
                  </div>
                </div>
                {/* Ribbon Tails */}
                <div className="absolute -bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
                  <div className="w-3.5 h-6 bg-[#881337] -rotate-12 rounded-b-sm border-b border-amber-300/40 shadow-md" />
                  <div className="w-3.5 h-6 bg-[#881337] rotate-12 rounded-b-sm border-b border-amber-300/40 shadow-md" />
                </div>
              </div>

              {/* Embossed Gold Title */}
              <div className="space-y-1 pt-2">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold text-amber-100 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                  A Letter for You
                </h3>
                <p className="text-sm sm:text-base font-serif italic text-rose-200/90 font-medium">
                  To {name}, with all my love ❤️
                </p>
              </div>
            </div>

            {/* Bottom Interactive Button */}
            <div className="relative z-10 pb-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenBook();
                }}
                className="px-7 py-3 sm:px-8 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-200 via-rose-100 to-amber-200 text-[#781b2c] font-semibold text-xs sm:text-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-2.5 border border-white/60 hover:shadow-[0_12px_35px_rgba(251,191,36,0.35)] transition-all cursor-pointer pointer-events-auto"
              >
                <MailOpen className="w-4 h-4 text-[#881337]" />
                <span>Tap to Open Book 📖</span>
              </motion.button>
              <p className="text-[10px] text-rose-300/60 font-sans tracking-wide mt-2">
                Turn the page to read your letter ✨
              </p>
            </div>
          </div>

          {/* --- INSIDE LEFT PAGE (Visible when opened, rotated 180deg) --- */}
          <div 
            className="absolute inset-0 rounded-[24px] md:rounded-[34px] book-backface-hidden overflow-hidden book-page-depth p-6 sm:p-10 flex flex-col items-center justify-between text-center select-none border-r border-[#781b2c]/20"
            style={{
              background: 'linear-gradient(135deg, #fbf7ee 0%, #f4edd9 100%)',
              transform: 'rotateY(180deg)',
              WebkitTransform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            {/* Soft inner page border */}
            <div className="absolute inset-4 sm:inset-6 rounded-[16px] md:rounded-[24px] border border-[#781b2c]/15 pointer-events-none" />

            {/* Right-edge fold shadow (hinge shadow where it connects to the spine) */}
            <div className="absolute inset-y-0 right-0 w-8 md:w-14 bg-gradient-to-l from-stone-900/35 via-stone-800/10 to-transparent pointer-events-none" />

            {/* Inside Left Content: Delicate Romantic Keepsake Page */}
            <div className="relative z-10 pt-4 text-center">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-bold text-[#881337]/70 font-sans block">
                🌸 An Unforgettable Day 🌸
              </span>
            </div>

            <div className="relative z-10 my-auto max-w-xs space-y-3 px-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-xl text-rose-700 shadow-sm">
                ✨
              </div>
              <p className="font-serif italic text-sm sm:text-base text-[#4a2016] leading-relaxed">
                "May your year ahead be filled with as much happiness, laughter, and light as you bring to everyone around you."
              </p>
              <p className="text-[11px] font-sans uppercase tracking-widest text-[#781b2c] font-bold pt-1">
                Always & Forever ❤️
              </p>
            </div>

            <div className="relative z-10 pb-2 text-[10px] sm:text-[11px] text-[#781b2c]/60 font-serif italic">
              Page 1 of your memory book
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subtle control below book when opened to allow re-closing and re-watching the 3D turn */}
      {opened && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="mt-4 sm:mt-5 z-20"
        >
          <button
            type="button"
            onClick={handleCloseBook}
            disabled={isFlipping}
            className="text-xs sm:text-sm text-rose-200/70 hover:text-white transition-colors underline decoration-rose-300/40 cursor-pointer flex items-center gap-1.5 mx-auto"
          >
            <span>📖 Close book cover</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

// --- Things I Love Screen ---
const THINGS_I_LOVE_BG = '/things-i-love-bg.jpeg';

const ThingsILove = ({ things, onNext }: { things?: string[], onNext: () => void }) => {
  const items = things && things.length > 0 
    ? things 
    : ['Your contagious smile and positive energy', 'Your unwavering loyalty and support', 'Every single memory and adventure we share'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen w-full overflow-y-auto flex flex-col items-center justify-center p-4 sm:p-6 select-none"
    >
      {/* Background Image: textured watercolor paper with lotus flowers */}
      <img
        src={THINGS_I_LOVE_BG}
        alt="Textured parchment with lotus"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-0"
      />

      {/* Floating subtle ambient warmth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-rose-50/20 pointer-events-none z-0" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-8 sm:space-y-10 my-auto py-8">
        {/* Animated Heading */}
        <div className="space-y-2">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-bold text-[#881337]/75 font-sans block"
          >
            🌸 From the Heart 🌸
          </motion.span>

          <motion.h2 
            initial={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-[#781b2c] tracking-tight drop-shadow-sm"
          >
            Things I Love About You
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xs sm:text-sm font-serif italic text-stone-600 max-w-xs mx-auto"
          >
            A few of the many reasons you bring so much joy into the world
          </motion.p>
        </div>

        {/* Animated Reason Cards */}
        <div className="w-full space-y-4 sm:space-y-5">
          {items.map((thing, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -35, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                delay: 0.4 + i * 0.2, 
                duration: 0.7, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-[#781b2c]/15 shadow-[0_8px_25px_rgba(120,27,44,0.08)] text-left hover:shadow-[0_12px_30px_rgba(120,27,44,0.14)] transition-all"
            >
              {/* Number Badge */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#881337]/15 to-[#be123c]/20 border border-[#881337]/20 flex items-center justify-center text-[#781b2c] font-serif font-bold text-xl sm:text-2xl shadow-sm flex-shrink-0">
                {i + 1}
              </div>

              {/* Text */}
              <p className="text-base sm:text-lg md:text-xl font-serif font-medium text-[#261510] leading-snug">
                {thing}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Animated Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.6 }}
          className="pt-2"
        >
          <Button 
            onClick={onNext}
            className="shadow-[0_10px_30px_rgba(136,19,55,0.35)] px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold bg-[#881337] hover:bg-[#9f1239] text-white transition-all transform hover:scale-105 flex items-center gap-2 border border-white/30 cursor-pointer"
          >
            <span>Continue to your Letter 💌</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const RecipientExperience = ({ data }: { data: SurpriseData }) => {
  const [step, setStep] = useState(1);

  return (
    <div className="bg-background text-white min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 && <Intro name={data.recipientName} intro={data.intro} onNext={() => setStep(2)} />}
        {step === 2 && <CakeView data={data} onNext={() => setStep(3)} />}
        {step === 3 && <GalleryView memories={data.memories} data={data} onNext={() => setStep(4)} />}
        {step === 4 && <ThingsILove things={data.things_i_love} onNext={() => setStep(5)} />}
        {step === 5 && <LetterView name={data.recipientName} message={data.personalMessage} aiMessage={data.birthday_message} finalMessage={data.final_message} />}
      </AnimatePresence>
    </div>
  );
};
