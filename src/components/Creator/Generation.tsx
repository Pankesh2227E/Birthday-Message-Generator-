import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Gift, Stars, Cake } from 'lucide-react';
import { Button } from '../DesignSystem';

const STAGES = [
  { text: "Gathering your memories...", icon: Heart },
  { text: "Writing something special...", icon: Stars },
  { text: "Creating their birthday cake...", icon: Cake },
  { text: "Putting everything together...", icon: Sparkles },
  { text: "Adding the finishing touches...", icon: Gift },
];

export const Generation = ({ onComplete, data }: { onComplete: () => void, data: any }) => {
  const isReady = data?.status === 'ready';
  const progress = data?.progress || "Gathering your memories...";
  const stage = data?.stage || 0;
  const isFailed = data?.status === 'failed';

  const CurrentIcon = STAGES[Math.min(stage - 1, STAGES.length - 1)]?.icon || Heart;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="absolute inset-0 cinematic-gradient -z-10" />
      
      <AnimatePresence mode="wait">
        {!isReady ? (
          <motion.div
            key={stage}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 1 }}
            className="space-y-12"
          >
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full" 
              />
              {isFailed ? (
                <div className="text-red-500 text-4xl">✕</div>
              ) : (
                <CurrentIcon className="text-primary" size={48} />
              )}
            </div>
            <div className="space-y-4">
              <h2 className={`text-2xl font-serif tracking-wide ${isFailed ? 'text-red-400' : ''}`}>
                {isFailed ? `Generation failed: ${data.error}` : progress}
              </h2>
              {!isFailed && (
                <div className="flex justify-center gap-1">
                  {STAGES.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 w-8 rounded-full transition-all duration-500 ${i < stage ? 'bg-primary' : 'bg-white/10'}`} 
                    />
                  ))}
                </div>
              )}
              {isFailed && (
                <Button onClick={() => window.location.reload()} variant="secondary" className="mt-8">
                  Try Again
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-6xl mb-8">❤️</div>
            <h2 className="text-4xl font-serif">Your surprise is ready.</h2>
            <p className="text-white/40 max-w-xs mx-auto">It's time to see what you've created for them.</p>
            <Button onClick={onComplete} className="w-full">
              Preview Surprise
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
