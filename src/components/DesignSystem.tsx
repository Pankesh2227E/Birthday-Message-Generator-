import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) => {
  const variants = {
    primary: 'bg-primary text-white bloom-glow hover:opacity-90',
    secondary: 'border border-accent text-accent hover:bg-accent/10',
    ghost: 'text-white/60 hover:text-white hover:bg-white/5'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Input = ({ label, error, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string, className?: string }) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">{label}</label>}
      <input 
        className={`w-full bg-surface border-b border-white/10 py-4 px-1 focus:border-primary outline-none transition-all duration-300 placeholder:text-white/20 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export const TextArea = ({ label, className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string, className?: string }) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">{label}</label>}
      <textarea 
        className={`w-full bg-surface border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 placeholder:text-white/30 resize-none min-h-[140px] block ${className}`}
        {...props}
      />
    </div>
  );
};

export const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`bg-surface border border-white/5 rounded-2xl p-6 shadow-2xl ${className}`}>
      {children}
    </div>
  );
};

export const StepIndicator = ({ current, total }: { current: number, total: number }) => {
  return (
    <div className="flex gap-2 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div 
          key={i} 
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${i < current ? 'bg-primary bloom-glow' : 'bg-white/10'}`} 
        />
      ))}
    </div>
  );
};

export const IconButton = ({ icon: Icon, onClick, className = "" }: { icon: LucideIcon, onClick: () => void, className?: string }) => {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all ${className}`}
    >
      <Icon size={20} />
    </button>
  );
};
