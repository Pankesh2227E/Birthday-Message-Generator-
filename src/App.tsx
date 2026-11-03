import React, { useState } from 'react';
import { Landing } from './components/Creator/Landing';
import { Wizard } from './components/Creator/Wizard';
import { Generation } from './components/Creator/Generation';
import { RecipientExperience } from './components/Recipient/RecipientExperience';
import { AppView, SurpriseData } from './types';
import { Button } from './components/DesignSystem';
import { Copy, RefreshCw, ExternalLink } from 'lucide-react';
import { ShareScreen } from './components/Creator/ShareScreen';

const MOCK_SURPRISE: SurpriseData = {
  recipientName: 'Alex',
  recipientAge: '28',
  recipientGender: 'Male',
  relationship: 'Best Friend',
  howWeMet: 'We met in college during a rainy afternoon at the library.',
  favoriteMemory: 'Hiking through the Alps last summer and getting lost in the fog.',
  whatMakesThemSpecial: 'He has an incredible ability to make everyone feel heard.',
  personality: 'Outgoing, adventurous, and fiercely loyal.',
  interests: 'Coffee, high-altitude photography, and deep house music.',
  memories: [
    { id: '1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKafw3I7eBjvhX4KudPUDoApBXEMjUXkfW-ut268vX0Tj3_4OoDqqictspvvW4edgNB3KNrcmJeqONtFeJu54OZ9IWdQG1bAX2yLFkKu2_hwCD0Zso4GAvL30Ij-ifDMC1dZyDN73Jkr_aYrZ27R6I4YirrfKFq6IEJNNQZhnMpIdxxlsSG2X1TCYhPhLXnXj41sQXwxUCOm_wM4UamqcesslkkNQtH4RoX9JhZvzR-tVqoBLl3ADQVg', caption: 'The day we finally explored the city...' },
    { id: '2', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiiCzuXlhedtBhhR6SVnWN8Urd3VbHcEajuwnZQ67Thx9y137bc1HxFHysw1V9aX7Z47DVVrHEVb5EClNWbsevz2T9uis4B1PAO6bfVxYvKHvm7cEfrHND7G3Uf_71kBnGLYkaNrcNW1q0mhgTDMR_u5OOEahH9otpQJCb62wwJ_j_sFQrnQkkdGGyPtFV0Nam26m9ZmM_uGpo1oI8YK8ZqS-cW2xmt_C61XVe-12yZco6lGBrOtJIZw', caption: 'That look you give when you\'re happy.' },
    { id: '3', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBO5iziaVoSu_VmWra5J0wyYGZVHtFeaD_Pnus5odzphI6q2jfrFCag2OasANHcw6wNA01_BEilocCMsZ8IMEo9a013zz_JTdKBWg1U_q6VgSPpVRU4eCsopTkrrXoRV6oaJ-NlJFHzyCdeavyM9fjW3FICmfM6im6btkHVC7IxM09oxR97ySyOxZGXquLn_juZ77LI8haJvsQfkxCz-gzkos72zzW9pFXjQTFkJo0qyX_tDtHBoe0BmA', caption: 'Quiet mornings away from everything.' },
  ],
  personalMessage: "Happy Birthday, Alex!\n\nYou've been there through the highs and the lows, and I couldn't ask for a better partner in crime. This year has been incredible, and I'm so excited for everything that comes next for you.\n\nEnjoy your special day, you deserve it more than anyone.",
};

export default function App() {
  const [view, setView] = useState<AppView>('LANDING');
  const [surpriseData, setSurpriseData] = useState<SurpriseData | null>(null);

  const [creatorData, setCreatorData] = useState<Partial<SurpriseData> | null>(null);
  const [builderStep, setBuilderStep] = useState<number>(1);
  const [surpriseId, setSurpriseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [cameFromPreview, setCameFromPreview] = useState(false);

  React.useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/surprise\/([^/]+)/);
    if (match) {
      const id = match[1];
      setSurpriseId(id);
      fetch(`/api/surprises/${id}`)
        .then(async res => {
          const data = await res.json();
          if (res.status === 410 || data.status === 'expired') {
            setSurpriseData(data);
            setView('EXPIRED');
            return;
          }
          if (data.error) throw new Error(data.error);
          setSurpriseData(data);
          setView('RECIPIENT_VIEW');
        })
        .catch(err => {
          console.error(err);
          setError('Could not find this surprise.');
          setView('LANDING');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleCreateComplete = async (data: SurpriseData) => {
    setCreatorData(data);
    setView('GENERATING');
    setError(null);
    setSurpriseData(null); // Reset for new generation
    
    try {
      const response = await fetch('/api/surprises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to initialize surprise');
      }
      
      const result = await response.json();
      setSurpriseId(result.id);
      
      // Start polling for status
      const poll = setInterval(async () => {
        try {
          const res = await fetch(`/api/surprises/${result.id}`);
          if (!res.ok) throw new Error('Failed to fetch status');
          const finalData = await res.json();
          
          setSurpriseData(prev => {
            if (finalData.status === 'ready') return finalData;
            return { ...prev, ...finalData };
          });
          
          if (finalData.status === 'ready') {
            clearInterval(poll);
          } else if (finalData.status === 'failed') {
            clearInterval(poll);
            setError(finalData.error || 'AI is unavailable at this time. Please write your birthday message manually or use any chatbot like Gemini or ChatGPT.');
            setSurpriseData(finalData);
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI is unavailable at this time. Please write your birthday message manually or use any chatbot like Gemini or ChatGPT.');
      setBuilderStep(8);
      setView('BUILDER');
    }
  };

  const shareUrl = surpriseId ? `${window.location.origin}/surprise/${surpriseId}` : '';

  if (view === 'BUILDER') {
    return (
      <Wizard 
        onComplete={handleCreateComplete} 
        initialData={creatorData}
        initialStep={builderStep}
        aiErrorMessage={error}
      />
    );
  }

  if (view === 'GENERATING') {
    return (
      <Generation 
        data={surpriseData} 
        onComplete={() => setView('RECIPIENT_PREVIEW')} 
        onWriteManually={() => {
          setBuilderStep(8);
          setView('BUILDER');
        }}
      />
    );
  }

  if (view === 'EXPIRED') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl mx-auto shadow-2xl">
          🛡️
        </div>
        <div className="space-y-3 max-w-md">
          <h1 className="text-3xl font-serif text-white">This Surprise Has Concluded</h1>
          <p className="text-sm text-white/60 leading-relaxed">
            In accordance with our strict <strong>2-Day Birthday Privacy Guarantee</strong>, all personal photos, memories, and messages for this celebration were automatically and permanently deleted 48 hours after the birthday.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button onClick={() => { window.location.href = '/'; }}>
            Create a New Surprise ✨
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => { window.open('/privacy-policy', '_blank'); }}
            className="text-white/50 hover:text-white"
          >
            Learn About Our Privacy Policy
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'RECIPIENT_PREVIEW' && surpriseData) {
    return (
      <ShareScreen
        surpriseId={surpriseId}
        surpriseData={surpriseData}
        onOpenPreview={() => {
          setCameFromPreview(true);
          setView('RECIPIENT_VIEW');
        }}
        onCreateAnother={() => setView('LANDING')}
      />
    );
  }

  if (view === 'RECIPIENT_VIEW') {
    return (
      <div className="relative">
        {/* Replay Celebration Button - Strictly restarts the surprise celebration from Scene 1 */}
        <button 
          onClick={() => setReplayKey(k => k + 1)}
          title="Replay Celebration"
          aria-label="Replay Celebration"
          className="fixed top-6 left-6 z-[60] p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/60 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
        >
          <RefreshCw size={20} />
        </button>

        {/* Back to Share Screen button (Only shown if creator opened this from preview mode) */}
        {cameFromPreview && (
          <button
            onClick={() => setView('RECIPIENT_PREVIEW')}
            className="fixed top-6 right-6 z-[60] px-4 py-2 bg-black/50 backdrop-blur-md border border-white/20 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer flex items-center gap-2"
          >
            <span>← Back to Share Screen</span>
          </button>
        )}

        <RecipientExperience key={replayKey} data={surpriseData || MOCK_SURPRISE} onReplay={() => setReplayKey(k => k + 1)} />
      </div>
    );
  }

  return (
    <Landing onStart={() => setView('BUILDER')} />
  );
}
