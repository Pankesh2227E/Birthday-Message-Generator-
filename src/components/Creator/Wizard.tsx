import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Input, TextArea, StepIndicator, Card, IconButton } from '../DesignSystem';
import { X, ArrowLeft, ArrowRight, Camera, Sparkles, Check, Plus, Calendar, ShieldCheck } from 'lucide-react';
import { Relationship, SurpriseData } from '../../types';
import { compressImageTo300KB } from '../../utils/imageCompressor';

const RELATIONSHIPS: Relationship[] = [
  'Girlfriend', 'Boyfriend', 'Best Friend', 'Wife', 'Husband', 'Sister', 'Brother', 'Other'
];

const HOW_WE_MET_OPTIONS = [
  'School',
  'College',
  'Work',
  'Café',
  'Wedding',
  'Through a friend',
  'Online',
  'Family / relatives',
  'Somewhere random',
  'Other'
];

const BASE_PERSONALITY_TRAITS = [
  'Funny',
  'Caring',
  'Kind',
  'Smart',
  'Adventurous',
  'Calm',
  'Energetic',
  'Creative',
  'Helpful',
  'Confident',
  'Quiet',
  'Always makes people laugh',
  'Always there for everyone'
];

const RELATIONSHIP_PERSONALITY: Record<string, string[]> = {
  'Girlfriend': ['Loving', 'Romantic', 'Supportive', 'Funny together', 'Favorite date', 'Always there for me'],
  'Boyfriend': ['Loving', 'Romantic', 'Supportive', 'Funny together', 'Favorite date', 'Always there for me'],
  'Wife': ['Loving', 'Romantic', 'Supportive', 'Funny together', 'Favorite date', 'Always there for me'],
  'Husband': ['Loving', 'Romantic', 'Supportive', 'Funny together', 'Favorite date', 'Always there for me'],
  'Best Friend': ['Always has my back', 'Makes me laugh', 'Knows me better than anyone', 'Adventure buddy', 'Partner in crime', 'Always there for me'],
  'Sister': ['Supportive', 'Protective', 'Caring', 'Kind', 'Always there for me'],
  'Brother': ['Supportive', 'Protective', 'Caring', 'Kind', 'Always there for me'],
};

const INTERESTS_LIST = [
  'Music',
  'Movies',
  'Gaming',
  'Football',
  'Cricket',
  'Gym / Fitness',
  'Books',
  'Travel',
  'Photography',
  'Food',
  'Pets',
  'Art',
  'Fashion',
  'Technology',
  'Cars',
  'Cooking',
  'Nature'
];

export const CAKE_OPTIONS = [
  {
    id: 'user-cake-gif',
    name: 'Sparkler Birthday Cake',
    url: 'https://res.cloudinary.com/zxgbxh38/image/upload/w_400,c_scale,fl_lossy/v1791811363/birthday_surprise/official_user_birthday_cake.gif',
    thumbnail: 'https://res.cloudinary.com/zxgbxh38/image/upload/w_200,c_scale,fl_lossy/v1791811363/birthday_surprise/official_user_birthday_cake.gif',
    type: 'cake'
  },
  {
    id: 'pink-celebration-cake',
    name: 'Pink Berry Candle Cake',
    url: '/cake-celebration-pink-lit.webp',
    thumbnail: '/cake-celebration-pink-lit.webp',
    type: 'cake'
  }
];

const STEPS = [
  { id: '01', title: 'About them' },
  { id: '02', title: 'How you met' },
  { id: '03', title: 'A memory' },
  { id: '04', title: 'Personality' },
  { id: '05', title: 'Things they love' },
  { id: '06', title: 'Photos' },
  { id: '07', title: 'Things I love about you' },
  { id: '08', title: 'Final touches' },
];

const getDefaultThingsILove = (d: Partial<SurpriseData>): string[] => {
  const interests = d.interests ? d.interests.split(',').map(s => s.trim()).filter(Boolean) : [];
  const personalities = d.personality ? d.personality.split(',').map(s => s.trim()).filter(Boolean) : [];

  let reason1 = 'Your contagious smile and positive energy that lights up every room';
  if (personalities.length > 0) {
    reason1 = `Your ${personalities[0].toLowerCase()} spirit and the genuine warmth you bring everywhere`;
  }

  let reason2 = 'Your unwavering loyalty, care, and the way you always support me';
  if (interests.length > 0) {
    reason2 = `Your endless passion for ${interests.slice(0, 2).join(' & ')} and how inspiring you are`;
  } else if (personalities.length > 1) {
    reason2 = `How wonderfully ${personalities[1].toLowerCase()} and thoughtful you are`;
  }

  const reason3 = 'Every single memory, laugh, and adventure we share together';

  return [reason1, reason2, reason3];
};

interface WizardProps {
  onComplete: (data: SurpriseData) => void;
  initialData?: Partial<SurpriseData> | null;
  initialStep?: number;
  aiErrorMessage?: string | null;
}

export const Wizard = ({ onComplete, initialData, initialStep, aiErrorMessage }: WizardProps) => {
  const [step, setStep] = useState(initialStep || 1);
  const [data, setData] = useState<Partial<SurpriseData>>({
    recipientName: '',
    recipientAge: '',
    dob: '',
    cakeUrl: CAKE_OPTIONS[0].url,
    relationship: 'Best Friend',
    howWeMet: '',
    favoriteMemory: '',
    personality: '',
    interests: '',
    things_i_love: [],
    personalMessage: '',
    memories: [],
    ...(initialData || {})
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const dobInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCakeSelector, setShowCakeSelector] = useState(false);

  // Helper states for selectable steps
  const [howWeMetChoice, setHowWeMetChoice] = useState<string>('');
  const [customHowWeMet, setCustomHowWeMet] = useState<string>('');

  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [customPersonality, setCustomPersonality] = useState<string>('');

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState<string>('');

  useEffect(() => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'wizard_step', details: { step } })
    }).catch(() => {});
  }, [step]);

  const update = (fields: Partial<SurpriseData>) => setData(prev => ({ ...prev, ...fields }));

  const updateMemoryCaption = (id: string, caption: string) => {
    setData(prev => ({
      ...prev,
      memories: (prev.memories || []).map(m => m.id === id ? { ...m, caption } : m)
    }));
  };

  const updateMemoryHiddenMessage = (id: string, hiddenMessage: string) => {
    setData(prev => ({
      ...prev,
      memories: (prev.memories || []).map(m => m.id === id ? { ...m, hiddenMessage } : m)
    }));
  };

  const next = () => {
    // Sync current step data before moving
    if (step === 2) {
      const finalHowWeMet = customHowWeMet.trim() || (howWeMetChoice && howWeMetChoice !== 'Other' ? howWeMetChoice : '');
      update({ howWeMet: finalHowWeMet });
    } else if (step === 4) {
      const traits = [...selectedPersonalities];
      if (customPersonality.trim() && !traits.includes(customPersonality.trim())) {
        traits.push(customPersonality.trim());
      }
      update({ personality: traits.join(', ') });
    } else if (step === 5) {
      const ints = [...selectedInterests];
      if (customInterest.trim() && !ints.includes(customInterest.trim())) {
        ints.push(customInterest.trim());
      }
      update({ interests: ints.join(', ') });
    } else if (step === 6) {
      if (!data.things_i_love || data.things_i_love.length === 0) {
        update({ things_i_love: getDefaultThingsILove(data) });
      }
    }

    setStep(s => Math.min(s + 1, 8));
  };

  const skipStep = () => {
    // Explicit skip: clear or keep empty
    if (step === 2) {
      setHowWeMetChoice('');
      setCustomHowWeMet('');
      update({ howWeMet: '' });
    } else if (step === 3) {
      update({ favoriteMemory: '' });
    } else if (step === 4) {
      setSelectedPersonalities([]);
      setCustomPersonality('');
      update({ personality: '' });
    } else if (step === 5) {
      setSelectedInterests([]);
      setCustomInterest('');
      update({ interests: '' });
    } else if (step === 7) {
      if (!data.things_i_love || data.things_i_love.length === 0) {
        update({ things_i_love: getDefaultThingsILove(data) });
      }
    }
    setStep(s => Math.min(s + 1, 8));
  };

  const back = () => setStep(s => Math.max(s - 1, 1));

  // Memory Upload Handler (Min 3, Max 5)
  const handleMemoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []) as File[];
    if (rawFiles.length === 0) return;
    setUploadError(null);

    const currentCount = data.memories?.length || 0;
    const remainingSlots = 5 - currentCount;

    if (remainingSlots <= 0) {
      setUploadError('You have reached the maximum limit of 5 photos.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    let filesToProcess = rawFiles;
    if (rawFiles.length > remainingSlots) {
      setUploadError(`Selected photos exceeded slot limit. Adding the first ${remainingSlots} photo(s).`);
      filesToProcess = rawFiles.slice(0, remainingSlots);
    }

    setIsUploading(true);

    try {
      for (const file of filesToProcess) {
        if (!(file instanceof File)) continue;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif', 'image/avif', 'image/x-heic', 'image/heic-sequence'];
        const isSupportedImage = (file.type && file.type.startsWith('image/')) || 
          allowedTypes.includes(file.type) || 
          /\.(jpe?g|png|webp|heic|heif|gif|avif|bmp|tiff)$/i.test(file.name);
        
        if (!isSupportedImage) {
          setUploadError(`"${file.name}" is not a recognized photo format. Please upload JPG, PNG, WEBP, or HEIC.`);
          continue;
        }

        const maxSize = 50 * 1024 * 1024; // 50MB limit
        if (file.size > maxSize) {
          setUploadError(`"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose an image under 50 MB.`);
          continue;
        }

        // Compress image to <= 300KB JPEG (skips if already <= 300KB, failsafe 2s timeout)
        let fileToUpload: File | Blob = file;
        try {
          fileToUpload = await compressImageTo300KB(file);
        } catch (compErr) {
          console.warn('Client compression fallback to original file:', compErr);
          fileToUpload = file;
        }

        const safeFilename = file.name ? file.name.replace(/\.[^/.]+$/, '') + '.jpg' : 'photo.jpg';
        const formData = new FormData();
        formData.append('file', fileToUpload, safeFilename);
        formData.append('publicId', `mem_${Date.now()}_${Math.random().toString(36).substring(7)}`);

        let uploadedUrl: string | null = null;
        let uploadedPublicId: string | undefined = undefined;

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          const contentType = res.headers.get('content-type') || '';
          let result: any = null;
          if (contentType.includes('application/json')) {
            try {
              result = await res.json();
            } catch {
              result = null;
            }
          }

          if (res.ok && result?.success && result?.url) {
            uploadedUrl = result.url;
            uploadedPublicId = result.publicId;
          } else {
            console.warn(`[UPLOAD] Server returned non-JSON or status ${res.status}. Falling back to client-side storage for ${file.name}`);
          }
        } catch (fetchErr: any) {
          console.warn(`[UPLOAD] Network warning for ${file.name}:`, fetchErr?.message);
        }

        // Resilient Fallback: If server upload returned non-JSON or was blocked by proxy, convert image directly to Data URL
        if (!uploadedUrl) {
          try {
            console.log(`[UPLOAD] Activating local Data URL fallback for "${file.name}"`);
            uploadedUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error('Failed to read image locally'));
              reader.readAsDataURL(fileToUpload);
            });
          } catch (fallbackErr: any) {
            console.error(`[UPLOAD] Fallback failed for ${file.name}:`, fallbackErr);
            setUploadError(`Could not load "${file.name}". Please try another image.`);
            continue;
          }
        }

        if (uploadedUrl) {
          setData(prev => {
            const currentMemories = prev.memories || [];
            if (currentMemories.length >= 5) return prev;
            return {
              ...prev,
              memories: [...currentMemories, {
                id: Math.random().toString(36).substring(7),
                url: uploadedUrl!,
                publicId: uploadedPublicId
              }]
            };
          });
        }
      }
    } catch (err: any) {
      console.error('[UPLOAD] Unexpected error during upload:', err);
      setUploadError(`An unexpected error occurred during upload: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeMemory = (id: string) => {
    setData(prev => ({
      ...prev,
      memories: (prev.memories || []).filter(m => m.id !== id)
    }));
  };

  // Toggle selection helpers
  const togglePersonality = (trait: string) => {
    setSelectedPersonalities(prev => 
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  // Determine personality suggestion list based on relationship
  const relPersonalityTraits = data.relationship ? (RELATIONSHIP_PERSONALITY[data.relationship] || []) : [];
  const combinedPersonalityList = Array.from(new Set([...relPersonalityTraits, ...BASE_PERSONALITY_TRAITS]));

  const currentStepInfo = STEPS[step - 1] || STEPS[0];
  const photoCount = data.memories?.length || 0;
  const isPhotosValid = photoCount >= 3 && photoCount <= 5;
  const isStep1Valid = Boolean(data.recipientName?.trim()) && Boolean(data.recipientAge?.trim());

  const isSkippableStep = [2, 3, 4, 5, 7].includes(step);

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-white">
      {/* Wizard Header */}
      <header className="w-full max-w-2xl px-6 py-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
            Step {currentStepInfo.id} of 08 — {currentStepInfo.title}
          </span>
          <h2 className="text-xs font-medium text-white/40">Personalized Birthday Journey</h2>
        </div>
        <IconButton icon={X} onClick={() => window.location.reload()} />
      </header>

      <div className="w-full max-w-2xl px-6 pt-6 pb-36">
        <div className="mb-8">
          <StepIndicator current={step} total={8} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* STEP 1: ABOUT THEM */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-serif">Who are we celebrating?</h2>
                  <p className="text-white/40 text-sm">Tell us their name, age, and your bond with them.</p>
                </div>

                <div className="space-y-6">
                  <Input 
                    label="Their Name *" 
                    placeholder="e.g. Sarah" 
                    value={data.recipientName || ''} 
                    onChange={e => update({ recipientName: e.target.value })}
                  />
                  <Input 
                    label="Age *" 
                    placeholder="e.g. 25" 
                    type="number"
                    value={data.recipientAge || ''} 
                    onChange={e => update({ recipientAge: e.target.value })}
                  />

                  {/* Date of Birth (Optional) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label 
                        htmlFor="dob-input" 
                        className="text-xs uppercase tracking-widest text-white/40 font-semibold flex items-center gap-1.5 cursor-pointer"
                        onClick={() => {
                          try {
                            dobInputRef.current?.showPicker?.();
                          } catch {
                            dobInputRef.current?.focus();
                          }
                        }}
                      >
                        <Calendar size={13} className="text-primary" />
                        Date of Birth (Optional)
                      </label>
                      {data.dob && (
                        <button
                          type="button"
                          onClick={() => update({ dob: '' })}
                          className="text-[11px] text-white/40 hover:text-white transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => {
                        try {
                          dobInputRef.current?.showPicker?.();
                        } catch {
                          dobInputRef.current?.focus();
                        }
                      }}
                    >
                      <input
                        id="dob-input"
                        ref={dobInputRef}
                        type="date"
                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none cursor-pointer [color-scheme:dark] transition-all hover:border-white/20"
                        value={data.dob || ''}
                        onChange={e => {
                          const val = e.target.value;
                          update({ dob: val });
                          if (val) {
                            const birthYear = new Date(val).getFullYear();
                            const currentYear = new Date().getFullYear();
                            const calculatedAge = currentYear - birthYear;
                            if (calculatedAge > 0 && calculatedAge < 120) {
                              update({ recipientAge: String(calculatedAge), dob: val });
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                      Relationship *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {RELATIONSHIPS.map(rel => (
                        <button
                          key={rel}
                          type="button"
                          onClick={() => update({ relationship: rel })}
                          className={`p-3.5 rounded-xl border text-sm font-medium transition-all duration-200 text-center ${
                            data.relationship === rel 
                              ? 'border-primary bg-primary/15 text-primary shadow-[0_0_15px_rgba(217,70,239,0.2)]' 
                              : 'border-white/5 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {rel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: HOW DID YOU MEET? */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-[11px] text-white/60 uppercase tracking-widest">
                    Optional
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif">How did you meet?</h2>
                  <p className="text-white/40 text-sm">
                    Choose a quick option, write your own story below, or both.
                  </p>
                </div>

                {/* Option Pills (Horizontal Flow matching the sketch) */}
                <div className="space-y-2.5">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                    Quick Options
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HOW_WE_MET_OPTIONS.map(opt => {
                      const isSelected = howWeMetChoice === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setHowWeMetChoice('');
                              if (customHowWeMet === opt) {
                                setCustomHowWeMet('');
                              }
                            } else {
                              setHowWeMetChoice(opt);
                              if (!customHowWeMet || HOW_WE_MET_OPTIONS.includes(customHowWeMet)) {
                                setCustomHowWeMet(opt === 'Other' ? '' : opt);
                              }
                            }
                          }}
                          className={`px-4 py-2.5 rounded-full border text-xs md:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(217,70,239,0.25)]'
                              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check size={13} className="text-primary" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clean rectangle curved-edge box */}
                <div className="space-y-2 pt-1 w-full">
                  <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">
                    Write manually
                  </label>
                  <TextArea
                    placeholder="Write manually..."
                    value={customHowWeMet}
                    onChange={e => setCustomHowWeMet(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: FAVORITE MEMORY */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-[11px] text-white/60 uppercase tracking-widest">
                    Optional
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif">What's one memory you'll never forget?</h2>
                  <p className="text-white/40 text-sm">
                    Pick an inspiration topic below, or describe your cherished memory directly.
                  </p>
                </div>

                {/* Inspiration Pills */}
                <div className="space-y-2.5">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                    Memory Inspirations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'First road trip',
                      'A memorable conversation',
                      'A funny inside joke',
                      'An unexpected adventure',
                      'A special celebration',
                      'Always being there'
                    ].map(idea => {
                      const isSelected = data.favoriteMemory?.includes(idea);
                      return (
                        <button
                          key={idea}
                          type="button"
                          onClick={() => {
                            const current = data.favoriteMemory || '';
                            if (current.includes(idea)) {
                              update({ favoriteMemory: current.replace(idea, '').trim() });
                            } else {
                              update({ favoriteMemory: current ? `${current} • ${idea}` : idea });
                            }
                          }}
                          className={`px-4 py-2.5 rounded-full border text-xs md:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(217,70,239,0.25)]'
                              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check size={13} className="text-primary" />}
                          {idea}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clean rectangle curved-edge box */}
                <div className="space-y-2 pt-1 w-full">
                  <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">
                    Write manually
                  </label>
                  <TextArea 
                    placeholder="Write manually..."
                    value={data.favoriteMemory || ''}
                    onChange={e => update({ favoriteMemory: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: PERSONALITY QUIRKS */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-[11px] text-white/60 uppercase tracking-widest">
                    Optional
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif">What makes them... them?</h2>
                  <p className="text-white/40 text-sm">
                    Select personality quirks, write custom traits below, or both.
                  </p>
                </div>

                {/* Option Pills */}
                <div className="space-y-2.5">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                    Personality Quirks & Traits
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {combinedPersonalityList.map(trait => {
                      const isSelected = selectedPersonalities.includes(trait);
                      return (
                        <button
                          key={trait}
                          type="button"
                          onClick={() => togglePersonality(trait)}
                          className={`px-4 py-2.5 rounded-full border text-xs md:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(217,70,239,0.25)]'
                              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check size={13} className="text-primary" />}
                          {trait}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clean rectangle curved-edge box */}
                <div className="space-y-2 pt-1 w-full">
                  <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">
                    Write manually
                  </label>
                  <TextArea 
                    placeholder="Write manually..."
                    value={customPersonality}
                    onChange={e => setCustomPersonality(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 5: THINGS THEY LOVE / INTERESTS */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-[11px] text-white/60 uppercase tracking-widest">
                    Optional
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif">Things they love</h2>
                  <p className="text-white/40 text-sm">
                    Select interests below, add their specific passions manually, or both.
                  </p>
                </div>

                {/* Option Pills */}
                <div className="space-y-2.5">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                    Interests & Hobbies
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS_LIST.map(interest => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-4 py-2.5 rounded-full border text-xs md:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(217,70,239,0.25)]'
                              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check size={13} className="text-primary" />}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clean rectangle curved-edge box */}
                <div className="space-y-2 pt-1 w-full">
                  <label className="text-xs uppercase tracking-widest text-white/50 font-semibold">
                    Write manually
                  </label>
                  <TextArea 
                    placeholder="Write manually..."
                    value={customInterest}
                    onChange={e => setCustomInterest(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 6: PHOTOS (MANDATORY: 3 TO 5) */}
            {step === 6 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] text-primary font-semibold uppercase tracking-widest">
                    Mandatory • 3 to 5 Photos
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif">Add 3–5 favorite photos</h2>
                  <p className="text-white/40 text-sm">
                    3 photos minimum • 5 photos maximum. These photos will form their personalized cinematic gallery.
                  </p>
                </div>

                {/* Counter & Status Banner */}
                <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
                  isPhotosValid 
                    ? 'border-primary/30 bg-primary/10 text-white' 
                    : 'border-white/10 bg-white/5 text-white/60'
                }`}>
                  <span className="font-semibold text-white">
                    {photoCount} / 5 photos added
                  </span>
                  <span className="text-xs">
                    {photoCount < 3 
                      ? `${3 - photoCount} more required to continue` 
                      : photoCount === 5 
                        ? 'Maximum 5 photos reached' 
                        : 'Requirement met! You can add up to 5'}
                  </span>
                </div>

                {/* Error Banner if any upload error occurred */}
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚠️</span>
                      <span>{uploadError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadError(null)}
                      className="text-white/60 hover:text-white p-1 rounded-md transition-colors"
                      title="Dismiss"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}

                {/* Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AnimatePresence>
                    {data.memories?.map((memory, idx) => (
                      <motion.div
                        key={memory.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="rounded-2xl p-3.5 bg-white/[0.04] border border-white/10 shadow-lg space-y-3"
                      >
                        {/* Polaroid Card Frame (Reference sketch) */}
                        <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-md border border-stone-200 text-stone-800 space-y-2.5">
                          {/* Image preview */}
                          <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-200/60">
                            <img 
                              src={memory.url} 
                              alt={`Photo ${idx + 1}`} 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white/90 backdrop-blur-sm font-sans font-medium">
                              Photo #{idx + 1}
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeMemory(memory.id)}
                              className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors shadow-md"
                              title="Remove photo"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Inside Polaroid bottom border: Photo Caption Input */}
                          <div className="pt-0.5">
                            <input 
                              type="text"
                              placeholder="Type here... (e.g. Cutie 🥹, My Love)"
                              value={memory.caption || ''}
                              onChange={e => updateMemoryCaption(memory.id, e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 placeholder:text-stone-400 font-serif font-medium focus:bg-white focus:border-rose-400 outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Just below Polaroid card: Type a hidden message box (Sketch) */}
                        <div className="space-y-1.5 pt-0.5">
                          <div className="flex items-center justify-between px-0.5">
                            <label className="text-[11px] font-semibold text-rose-300 flex items-center gap-1 uppercase tracking-wider">
                              <span>💌</span> Type a hidden message (optional)
                            </label>
                            <span className="text-[10px] text-white/40">Flips in 3D on tap</span>
                          </div>
                          <input 
                            type="text"
                            placeholder="Write a hidden secret note for this photo..."
                            value={memory.hiddenMessage || ''}
                            onChange={e => updateMemoryHiddenMessage(memory.id, e.target.value)}
                            className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder:text-white/30 focus:border-primary outline-none transition-all"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add Photo Button (Visible only if under 5 photos) */}
                  {photoCount < 5 && (
                    <label className={`min-h-[220px] rounded-2xl border-2 border-dashed border-white/15 hover:border-primary/40 hover:bg-primary/5 flex flex-col items-center justify-center gap-3 text-white/40 hover:text-white transition-all group cursor-pointer p-6 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/avif,image/*" 
                        multiple 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={handleMemoryUpload}
                      />
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 group-hover:scale-110 transition-all">
                          <Camera size={24} className="group-hover:text-primary transition-colors" />
                        </div>
                      )}
                      <div className="text-center px-2">
                        <span className="text-xs font-semibold block text-white/80">
                          {isUploading ? 'Uploading...' : 'Add Photos'}
                        </span>
                        <span className="text-[10px] text-white/40 block mt-0.5">
                          {5 - photoCount} remaining • JPG, PNG, WebP, HEIC
                        </span>
                      </div>
                    </label>
                  )}
                </div>

                {/* Helpful Note about Optional Hidden Messages */}
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-white/70 flex items-start gap-2.5">
                  <span className="text-sm">✨</span>
                  <p className="leading-relaxed">
                    <strong>Both caption and hidden message are completely optional!</strong> If you write a hidden message, the recipient can tap the photo to flip it in 3D and reveal your secret note.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 7: THINGS I LOVE ABOUT YOU */}
            {step === 7 && (() => {
              const currentThings = data.things_i_love && data.things_i_love.length > 0 
                ? data.things_i_love 
                : getDefaultThingsILove(data);
              const isAtMax = currentThings.length >= 10;

              return (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] text-primary font-semibold uppercase tracking-widest">
                        Customizable • From the Heart
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        isAtMax 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                          : 'bg-white/5 border-white/10 text-white/70'
                      }`}>
                        {currentThings.length} / 10 added
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif">Things I love about you</h2>
                    <p className="text-white/40 text-sm">
                      We've pre-filled sweet reasons based on their personality and interests. You can edit, remove, or add up to 10 reasons.
                    </p>
                  </div>

                  {/* Things list */}
                  <div className="space-y-3">
                    {currentThings.map((thing, idx) => (
                      <motion.div 
                        key={idx}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-primary/50 transition-all"
                      >
                        {/* Number Badge */}
                        <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-serif font-bold text-sm flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>

                        {/* Editable Text Input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={thing}
                            onChange={(e) => {
                              const current = [...currentThings];
                              current[idx] = e.target.value;
                              update({ things_i_love: current });
                            }}
                            placeholder={`Reason #${idx + 1}...`}
                            className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none font-medium"
                          />
                        </div>

                        {/* Delete button (if more than 1 item) */}
                        {currentThings.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const current = [...currentThings];
                              current.splice(idx, 1);
                              update({ things_i_love: current });
                            }}
                            className="text-white/30 hover:text-rose-400 p-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                            title="Remove this reason"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Add another thing button with 10-item cap */}
                  {!isAtMax ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentThings.length < 10) {
                          const current = [...currentThings, ''];
                          update({ things_i_love: current });
                        }
                      }}
                      className="w-full py-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Add another thing I love ({10 - currentThings.length} remaining)</span>
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-center text-xs text-amber-300/80">
                      ✨ Maximum limit of 10 reasons reached
                    </div>
                  )}

                  {/* Quick Inspiration Pills */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold block">
                      💡 Quick Ideas (Tap to add)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'The way you always make me laugh',
                        'Your kindness and warm heart',
                        'How passionate you are about what you love',
                        'Our late night conversations',
                        'Your cute little smile',
                        'How you are always there for me'
                      ].map(idea => (
                        <button
                          key={idea}
                          type="button"
                          disabled={isAtMax}
                          onClick={() => {
                            if (currentThings.length < 10) {
                              const current = [...currentThings, idea];
                              update({ things_i_love: current });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full border text-xs transition-all flex items-center gap-1.5 ${
                            isAtMax 
                              ? 'opacity-40 cursor-not-allowed border-white/5 text-white/30' 
                              : 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/10 text-white/70 hover:text-white cursor-pointer'
                          }`}
                        >
                          <Plus size={12} className={isAtMax ? 'text-white/30' : 'text-primary'} />
                          {idea}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* STEP 8: FINAL TOUCHES & REVIEW */}
            {step === 8 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-serif">Your surprise is almost ready.</h2>
                  <p className="text-white/40 text-sm">
                    Review your inputs and add an optional message from your heart.
                  </p>
                </div>

                <Card className="space-y-4 divide-y divide-white/5">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/40 text-sm">Recipient</span>
                    <span className="font-semibold text-white">{data.recipientName} ({data.recipientAge})</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/40 text-sm">Relationship</span>
                    <span className="font-semibold text-primary">{data.relationship}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/40 text-sm">Photos</span>
                    <span className="font-semibold text-white">{photoCount} Photos Ready</span>
                  </div>
                  {data.dob && (
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-white/40">Date of Birth</span>
                      <span className="text-white/80">{data.dob}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span className="text-white/40">Birthday Cake</span>
                    <span className="text-white/80 flex items-center gap-2">
                      <img 
                        src={data.cakeUrl || CAKE_OPTIONS[0].url} 
                        alt="Cake" 
                        className="w-5 h-5 rounded-full object-cover border border-white/20" 
                      />
                      {CAKE_OPTIONS.find(c => c.url === data.cakeUrl)?.name.split(' (')[0] || 'Celebration Cake'}
                    </span>
                  </div>
                  {data.howWeMet && (
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-white/40">How you met</span>
                      <span className="text-white/80 text-right max-w-[200px] truncate">{data.howWeMet}</span>
                    </div>
                  )}
                  {data.favoriteMemory && (
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-white/40">Memory</span>
                      <span className="text-white/80 text-right max-w-[200px] truncate">{data.favoriteMemory}</span>
                    </div>
                  )}
                  {data.personality && (
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-white/40">Personality</span>
                      <span className="text-white/80 text-right max-w-[200px] truncate">{data.personality}</span>
                    </div>
                  )}
                  {data.interests && (
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-white/40">Interests</span>
                      <span className="text-white/80 text-right max-w-[200px] truncate">{data.interests}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span className="text-white/40">Things I Love</span>
                    <span className="font-semibold text-primary">
                      {(data.things_i_love || getDefaultThingsILove(data)).length} Reasons Included
                    </span>
                  </div>
                </Card>

                {/* Button to Choose Cake from website */}
                <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🎂</span>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Birthday Cake</h4>
                        <p className="text-[11px] text-white/40">Select the cake displayed when they open their celebration</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCakeSelector(!showCakeSelector)}
                      className="px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all cursor-pointer"
                    >
                      {showCakeSelector ? 'Close' : 'Choose Cake'}
                    </button>
                  </div>

                  {/* Selected Cake Preview Tile */}
                  {(() => {
                    const currentCake = CAKE_OPTIONS.find(c => c.url === (data.cakeUrl || CAKE_OPTIONS[0].url)) || CAKE_OPTIONS[0];
                    return (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/5">
                        <img
                          src={currentCake.thumbnail}
                          alt={currentCake.name}
                          className="w-14 h-14 rounded-xl object-contain bg-black/20 p-1 border border-white/10"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-white">
                            {currentCake.name}
                          </p>
                          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
                            ✓ Active cake ready for celebration
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {showCakeSelector && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pt-1 space-y-2">
                      {CAKE_OPTIONS.map(cake => {
                        const isSelected = (data.cakeUrl || CAKE_OPTIONS[0].url) === cake.url;
                        return (
                          <button
                            key={cake.id}
                            type="button"
                            onClick={() => {
                              update({ cakeUrl: cake.url });
                              setShowCakeSelector(false);
                            }}
                            className={`w-full p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary/15 shadow-[0_0_12px_rgba(217,70,239,0.25)]'
                                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06]'
                            }`}
                          >
                            <img 
                              src={cake.thumbnail} 
                              alt={cake.name} 
                              className="w-12 h-12 rounded-lg object-contain bg-black/20 p-1 flex-shrink-0 border border-white/10" 
                            />
                            <div className="overflow-hidden flex-1">
                              <span className="text-xs font-medium text-white block truncate">{cake.name}</span>
                            </div>
                            {isSelected ? (
                              <span className="text-primary text-xs font-bold">✓ Selected</span>
                            ) : (
                              <span className="text-white/40 text-xs font-medium">Select</span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>

                {/* AI Unavailable Notice Banner (Shown if AI generation encountered an error) */}
                {aiErrorMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 shadow-xl"
                  >
                    <span className="text-2xl flex-shrink-0">✍️</span>
                    <div className="space-y-1">
                      <p className="font-bold text-white text-sm">AI is unavailable at this time</p>
                      <p className="text-amber-200/90 leading-relaxed text-xs">
                        Please write your birthday message manually below, or ask any chatbot like Gemini or ChatGPT to write one and paste it in!
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-widest text-white/60 font-semibold">
                      Your Custom Birthday Message (Optional)
                    </label>
                    <span className="text-[10px] text-primary/80 font-medium">
                      Your exact words
                    </span>
                  </div>
                  <TextArea 
                    placeholder="Write your custom birthday letter or personal note here... If you write your own message, your exact words will be delivered in their celebration!"
                    value={data.personalMessage || ''}
                    onChange={e => update({ personalMessage: e.target.value })}
                  />
                  <p className="text-[11px] text-white/40">
                    💡 <strong>Smart Note:</strong> When you write your own message, your exact heartfelt words will be delivered without using AI.
                  </p>
                </div>

                {/* 2-Day Privacy Guarantee Banner */}
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
                  <ShieldCheck size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-emerald-300">🛡️ 2-Day Birthday Privacy Guarantee</p>
                    <p className="text-white/60">
                      All photos, names, and memories you provide will automatically and permanently delete 2 days after the birthday.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Bar */}
      <footer className="fixed bottom-0 w-full max-w-2xl px-6 py-5 bg-background/90 backdrop-blur-lg border-t border-white/10 flex items-center justify-between gap-3 z-50">
        <Button 
          variant="ghost" 
          onClick={back} 
          className="px-4 text-white/50 hover:text-white" 
          disabled={step === 1 || isUploading}
        >
          <ArrowLeft size={18} />
        </Button>

        <div className="flex items-center gap-2">
          {/* Skip Action for Optional Steps */}
          {isSkippableStep && (
            <Button 
              variant="ghost" 
              onClick={skipStep}
              className="text-white/40 hover:text-white text-xs px-4"
              disabled={isUploading}
            >
              Skip
            </Button>
          )}

          {/* Continue / Create Button */}
          {step < 8 ? (
            <Button 
              onClick={next} 
              disabled={
                isUploading || 
                (step === 1 && !isStep1Valid) || 
                (step === 6 && !isPhotosValid)
              } 
              className="flex items-center justify-center gap-2 px-6"
            >
              {isUploading ? 'Uploading...' : 'Continue'} <ArrowRight size={18} />
            </Button>
          ) : (
            <Button 
              onClick={() => onComplete(data as SurpriseData)} 
              disabled={isUploading} 
              className="flex items-center justify-center gap-2 px-6 shadow-[0_0_25px_rgba(217,70,239,0.35)]"
            >
              Create My Surprise ✨
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};
