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

export const Generation = ({ 
  onComplete, 
  data, 
  onWriteManually 
}: { 
  onComplete: () => void, 
  data: any, 
  onWriteManually?: () => void 
}) => {
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
            key={isFailed ? 'failed' : stage}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-md mx-auto"
          >
            {isFailed ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-amber-500/30 text-center space-y-5 shadow-2xl backdrop-blur-xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto shadow-inner text-amber-300">
                  ✍️
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold tracking-tight">
                    AI is unavailable at this time
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Please write your birthday message manually or use any chatbot like Gemini or ChatGPT to generate one, then paste it in.
                  </p>
                </div>
                <div className="pt-2">
                  <Button 
                    onClick={onWriteManually || (() => window.location.reload())} 
                    className="w-full py-3.5 rounded-xl font-semibold shadow-lg cursor-pointer"
                  >
                    Write Birthday Message Manually ✍️
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full" 
                  />
                  <CurrentIcon className="text-primary" size={48} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-serif tracking-wide text-white">
                    {progress}
                  </h2>
                  <div className="flex justify-center gap-1">
                    {STAGES.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 w-8 rounded-full transition-all duration-500 ${i < stage ? 'bg-primary' : 'bg-white/10'}`} 
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
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
