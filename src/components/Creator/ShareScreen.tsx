import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, ExternalLink, RefreshCw, Share2, MessageSquare, Send, Instagram } from 'lucide-react';
import { Button } from '../DesignSystem';
import { SurpriseData } from '../../types';

interface ShareScreenProps {
  surpriseId: string | null;
  surpriseData: SurpriseData;
  onOpenPreview: () => void;
  onCreateAnother: () => void;
}

/**
 * Returns formatted ordinal number (e.g., 18 -> "18th", 21 -> "21st", 22 -> "22nd", 23 -> "23rd")
 */
function formatAgeWithSuffix(age?: string | number): string {
  if (!age) return '';
  const cleanStr = String(age).trim();
  const num = parseInt(cleanStr.replace(/\D/g, ''), 10);
  if (isNaN(num) || num <= 0) return cleanStr ? `${cleanStr} ` : '';

  const j = num % 10;
  const k = num % 100;

  let suffix = 'th';
  if (j === 1 && k !== 11) suffix = 'st';
  else if (j === 2 && k !== 12) suffix = 'nd';
  else if (j === 3 && k !== 13) suffix = 'rd';

  return `${num}${suffix}`;
}

export const ShareScreen: React.FC<ShareScreenProps> = ({
  surpriseId,
  surpriseData,
  onOpenPreview,
  onCreateAnother
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [instagramFeedback, setInstagramFeedback] = useState(false);

  // Derive the public viewable URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = surpriseId 
    ? `${origin}/surprise/${surpriseId}`
    : (typeof window !== 'undefined' && window.location.href.includes('/surprise/') ? window.location.href : `${origin}/surprise/demo`);

  // Construct custom personalized birthday message
  const formattedAge = formatAgeWithSuffix(surpriseData.recipientAge);
  const recipientName = (surpriseData.recipientName || '').trim();

  let birthdayGreeting = 'Happiest birthday';
  if (formattedAge && recipientName) {
    birthdayGreeting = `Happiest ${formattedAge} birthday ${recipientName}!`;
  } else if (formattedAge) {
    birthdayGreeting = `Happiest ${formattedAge} birthday!`;
  } else if (recipientName) {
    birthdayGreeting = `Happiest birthday ${recipientName}!`;
  } else {
    birthdayGreeting = 'Happiest birthday!';
  }

  const customShareMessage = `${birthdayGreeting} 🎂✨ I created a special birthday surprise for you. Open it here:\n${shareUrl}`;

  const trackShare = (channel: string) => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'surprise_shared',
        details: { platform: channel, surpriseId, recipientName }
      })
    }).catch(() => {});
  };

  // Resilient clipboard copy function (handles iframe security restrictions)
  const copyToClipboard = async (text: string, isMessageOnly: boolean = false) => {
    trackShare(isMessageOnly ? 'copy_message' : 'copy_link');
    let success = false;

    // 1. Modern Clipboard API
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch (err) {
        console.warn('Navigator clipboard write failed, trying fallback:', err);
      }
    }

    // 2. Fallback using temporary textarea
    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const res = document.execCommand('copy');
        document.body.removeChild(textarea);
        success = res;
      } catch (err) {
        console.error('Fallback execCommand copy failed:', err);
      }
    }

    if (isMessageOnly) {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 3000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }

    return success;
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    trackShare('whatsapp');
    const encoded = encodeURIComponent(customShareMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // SMS / Contacts share
  const handleSmsShare = () => {
    trackShare('sms');
    const encoded = encodeURIComponent(customShareMessage);
    // On iOS and Android, sms:?&body= handles message pre-population
    const smsUrl = `sms:?&body=${encoded}`;
    window.location.href = smsUrl;
  };

  // Instagram share
  const handleInstagramShare = async () => {
    trackShare('instagram');
    await copyToClipboard(customShareMessage, true);
    setInstagramFeedback(true);
    setTimeout(() => {
      setInstagramFeedback(false);
      window.open('https://instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
    }, 1200);
  };

  // Native share sheet if available
  const handleNativeShare = async () => {
    trackShare('native_share');
    if (navigator?.share) {
      try {
        await navigator.share({
          title: `${birthdayGreeting} 🎂`,
          text: customShareMessage,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      copyToClipboard(customShareMessage, true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden py-16">
      <div className="absolute inset-0 cinematic-gradient -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-auto bg-surface/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-2">🎉</div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white">Your Surprise is Ready!</h1>
          <p className="text-xs sm:text-sm text-white/60">
            {recipientName ? `Created with love for ${recipientName}.` : 'Your personalized birthday experience is live.'}
          </p>
        </div>

        {/* Public Viewable Link Section */}
        <div className="space-y-3 pt-2">
          <label className="text-xs uppercase tracking-widest text-primary font-semibold block text-left">
            Public Viewable Link:
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-xs sm:text-sm text-white/90 font-mono tracking-tight select-all focus:outline-none focus:border-primary pr-12 transition-colors cursor-text"
            />
            <button
              onClick={() => copyToClipboard(shareUrl, false)}
              className="absolute right-2 p-2 text-white/60 hover:text-white transition-colors"
              title="Copy Link"
              type="button"
            >
              {copiedLink ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-[11px] text-white/40 text-left">
            💡 If your browser blocks popups or clipboard, you can always select and copy the text box above.
          </p>
        </div>

        {/* Copy Link Button (Just below the link) */}
        <Button
          onClick={() => copyToClipboard(shareUrl, false)}
          variant={copiedLink ? 'secondary' : 'primary'}
          className="w-full flex items-center justify-center gap-2 py-3.5 shadow-[0_0_20px_rgba(217,70,239,0.25)] transition-all"
        >
          {copiedLink ? (
            <>
              <Check size={18} className="text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Link Copied to Clipboard! ✨</span>
            </>
          ) : (
            <>
              <Copy size={18} />
              <span>Copy Share Link</span>
            </>
          )}
        </Button>

        {/* Direct Sharing Icons */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-white/50 font-semibold">
              Share Directly:
            </span>
            <span className="text-[11px] text-primary/80 font-medium">
              Pre-filled with "{birthdayGreeting}"
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-white transition-all transform active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <Send size={18} className="rotate-[-20deg] ml-0.5" />
              </div>
              <span className="text-xs font-medium text-white/90">WhatsApp</span>
            </button>

            {/* Contacts / SMS */}
            <button
              type="button"
              onClick={handleSmsShare}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-white transition-all transform active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <MessageSquare size={18} />
              </div>
              <span className="text-xs font-medium text-white/90">SMS / Contacts</span>
            </button>

            {/* Instagram */}
            <button
              type="button"
              onClick={handleInstagramShare}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-gradient-to-tr from-[#f09433]/15 via-[#dc2743]/15 to-[#bc1888]/15 hover:from-[#f09433]/25 hover:to-[#bc1888]/25 border border-[#dc2743]/30 text-white transition-all transform active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <Instagram size={18} />
              </div>
              <span className="text-xs font-medium text-white/90">Instagram</span>
            </button>
          </div>

          {/* Instagram Feedback Toast */}
          <AnimatePresence>
            {instagramFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-center text-primary bg-primary/10 border border-primary/20 rounded-xl py-2 px-3"
              >
                ✓ Message copied to clipboard! Opening Instagram Direct...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Native OS Share Button */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-medium transition-colors"
            >
              <Share2 size={14} />
              <span>More Sharing Options (AirDrop, Telegram, Email)</span>
            </button>
          )}
        </div>

        {/* Message Preview Box */}
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
              Outgoing Message Preview
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(customShareMessage, true)}
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              {copiedMessage ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied message!</span>
                </>
              ) : (
                'Copy message text'
              )}
            </button>
          </div>
          <p className="text-xs text-white/70 italic whitespace-pre-line leading-relaxed font-sans">
            "{customShareMessage}"
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 space-y-2.5">
          <Button
            onClick={onOpenPreview}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 py-3"
          >
            <ExternalLink size={18} />
            <span>Open & Preview Surprise</span>
          </Button>

          <Button
            variant="ghost"
            onClick={onCreateAnother}
            className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white py-2"
          >
            <RefreshCw size={16} />
            <span>Create Another Surprise</span>
          </Button>
        </div>

        {/* 2-Day Privacy reminder */}
        <div className="pt-2 text-center text-[11px] text-white/40 border-t border-white/5">
          🛡️ Private link automatically expires and deletes 48 hours after the birthday.
        </div>
      </motion.div>
    </div>
  );
};
