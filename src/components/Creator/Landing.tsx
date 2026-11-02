import { motion } from 'motion/react';
import { Button } from '../DesignSystem';
import { Sparkles, Heart, Image as ImageIcon, Gift } from 'lucide-react';

export const Landing = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Header Navigation */}
      <nav className="w-full max-w-7xl px-6 py-6 flex flex-wrap justify-between items-center gap-4 border-b border-white/5">
        <div className="font-serif text-2xl tracking-tight text-primary font-bold">✨ Birthday Surprise</div>
        
        <div className="flex items-center gap-6 text-xs text-white/60">
          <a href="/about-us" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            About Us
          </a>
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Terms & Conditions
          </a>
          <a href="/contact-us" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Contact Us
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center max-w-3xl py-20 relative">
        <div className="absolute inset-0 cinematic-gradient -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
            <Sparkles size={14} />
            Experience the Magic
          </div>

          {/* Short, subtle explainer */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white/70 backdrop-blur-md max-w-md mx-auto leading-normal">
            <span>Your memories + a few details</span>
            <span className="text-primary font-bold">→</span>
            <span>AI creates personalized experience</span>
            <span className="text-primary font-bold">→</span>
            <span>Share with one link</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif leading-tight">
            Create a birthday surprise they'll <span className="text-primary italic">never forget.</span> ❤️
          </h1>
          
          <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Turn your memories and a few details into a personalized birthday experience you can share with one link.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button onClick={onStart} className="flex items-center justify-center gap-2">
              Create My Surprise ✨
            </Button>
            <Button 
              variant="ghost" 
              className="text-white/40"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See how it works
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Steps */}
      <section id="how-it-works" className="w-full max-w-7xl px-6 py-24">
        <div className="grid md:grid-cols-3 gap-12">
          <StepCard 
            icon={Heart} 
            number="01" 
            title="Tell us about them" 
            description="Answer a few quick questions to set the tone. Is it funny, sentimental, or a mix?" 
          />
          <StepCard 
            icon={ImageIcon} 
            number="02" 
            title="Add your memories" 
            description="Upload photos and inside jokes. All photos are compressed to <=300KB for instant mobile loading." 
          />
          <StepCard 
            icon={Gift} 
            number="03" 
            title="Share the surprise" 
            description="Get a unique, secure link to send them. All private data automatically purges 2 days after the birthday." 
          />
        </div>
      </section>

      {/* Footer with MPA Links for SEO & AdSense */}
      <footer className="w-full border-t border-white/10 bg-black/40 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="font-serif text-lg text-primary font-semibold">✨ Birthday Surprise</div>
            <p className="text-xs text-white/50 max-w-sm">
              Private, cinematic birthday experiences crafted with love.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              🛡️ <strong>2-Day Privacy:</strong> Data auto-deletes 48h after the birthday
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs text-white/60">
            <a href="/about-us" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              About Us
            </a>
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Terms & Conditions
            </a>
            <a href="/contact-us" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Contact Us
            </a>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Sitemap
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 text-center text-[11px] text-white/40">
          © {new Date().getFullYear()} Birthday Surprise. All rights reserved. Designed for search-friendly privacy and heartfelt celebrations.
        </div>
      </footer>
    </div>
  );
};

const StepCard = ({ icon: Icon, number, title, description }: { icon: any, number: string, title: string, description: string }) => (
  <div className="space-y-6">
    <div className="flex items-baseline gap-4">
      <span className="text-primary/20 font-serif text-5xl">{number}</span>
      <div className="p-3 bg-white/5 rounded-2xl">
        <Icon className="text-primary" size={24} />
      </div>
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-white/40 leading-relaxed">{description}</p>
  </div>
);
