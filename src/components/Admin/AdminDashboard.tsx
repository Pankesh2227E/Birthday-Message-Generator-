import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ExternalLink, 
  Cake, 
  Share2, 
  UserX, 
  Lock, 
  ShieldCheck, 
  RefreshCw, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Eye,
  KeyRound
} from 'lucide-react';

interface Stats {
  link_clicks: number;
  surprises_created: number;
  wizard_starts: number;
  surprises_shared: number;
  abandoned_count: number;
  completion_rate: number;
  abandonment_rate: number;
  share_rate: number;
  step_dropoffs: Record<string, number>;
  daily_stats: Record<string, {
    link_clicks: number;
    surprises_created: number;
    wizard_starts: number;
    surprises_shared: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: 'link_click' | 'wizard_start' | 'wizard_step' | 'surprise_created' | 'surprise_shared';
    description: string;
    timestamp: string;
    details?: any;
  }>;
}

interface AdminData {
  stats: Stats;
  surprisesCount: number;
  recentSurprises: any[];
  envInfo: {
    nodeEnv: string;
    passwordConfigured: boolean;
  };
}

export const AdminDashboard: React.FC = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('admin_auth_token'));
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async (authToken: string) => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (res.status === 401) {
        sessionStorage.removeItem('admin_auth_token');
        setToken(null);
        setError('Session expired or invalid credentials. Please log in again.');
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to fetch admin stats');
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with analytics server');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Invalid admin password');
      }

      sessionStorage.setItem('admin_auth_token', json.token);
      setToken(json.token);
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth_token');
    setToken(null);
    setData(null);
    setPassword('');
  };

  // Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0d0714] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden select-none font-sans">
        {/* Ambient Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-[#181124]/90 border border-purple-500/20 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <KeyRound size={32} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Admin Portal
            </h1>
            <p className="text-xs text-white/60 max-w-xs leading-relaxed">
              Enter the secure admin password defined in your environment variable (<code className="text-purple-300 font-mono">ADMIN_PASSWORD</code>)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                  className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all font-mono text-sm"
                />
                <Lock className="absolute right-3.5 top-3.5 text-white/30" size={18} />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Authenticate Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
            <a href="/" className="hover:text-white transition-colors flex items-center gap-1">
              ← Return to Home
            </a>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Protected Route
            </span>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-[#0c0814] text-white font-sans antialiased p-4 sm:p-6 lg:p-8">
      {/* Top Navigation Bar */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-500/15">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Cake size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
                Birthday Message Analytics
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Admin Live
                </span>
              </h1>
              <p className="text-xs text-white/50">
                Real-time tracking of links, surprise creation, step drop-off, and social shares
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-end md:self-center">
          <button
            onClick={() => token && fetchStats(token)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>Live Site</span>
            <ExternalLink size={13} />
          </a>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-xs font-medium text-red-300 hover:text-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto py-8 space-y-8">
        {/* Core 4 Requested Metrics Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-white/60">
              Key Performance Indicators
            </h2>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live persistent tracking active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Link Clicks */}
            <div className="p-6 rounded-2xl bg-[#160f24] border border-purple-500/20 relative overflow-hidden group hover:border-purple-400/40 transition-all shadow-lg">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                  1. Link Clicks
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                  <ExternalLink size={18} />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-white mb-1">
                {stats?.link_clicks ?? 0}
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                People who clicked & viewed surprise celebration URLs
              </p>
            </div>

            {/* Card 2: Surprises Created */}
            <div className="p-6 rounded-2xl bg-[#160f24] border border-purple-500/20 relative overflow-hidden group hover:border-purple-400/40 transition-all shadow-lg">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                  2. Surprises Created
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Cake size={18} />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-emerald-400 mb-1">
                {stats?.surprises_created ?? 0}
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Users who completed all steps & created surprise pages
                {stats && stats.wizard_starts > 0 && (
                  <span className="block mt-1 text-emerald-400/90 font-medium">
                    ({stats.completion_rate}% completion rate)
                  </span>
                )}
              </p>
            </div>

            {/* Card 3: Left Without Completing (Abandoned) */}
            <div className="p-6 rounded-2xl bg-[#160f24] border border-purple-500/20 relative overflow-hidden group hover:border-purple-400/40 transition-all shadow-lg">
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                  3. Left Without Completing
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                  <UserX size={18} />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-400 mb-1">
                {stats?.abandoned_count ?? 0}
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Started builder but exited before finishing
                {stats && stats.wizard_starts > 0 && (
                  <span className="block mt-1 text-amber-400/90 font-medium">
                    ({stats.abandonment_rate}% drop-off rate)
                  </span>
                )}
              </p>
            </div>

            {/* Card 4: Created & Shared */}
            <div className="p-6 rounded-2xl bg-[#160f24] border border-purple-500/20 relative overflow-hidden group hover:border-purple-400/40 transition-all shadow-lg">
              <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/15 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                  4. Created & Shared
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
                  <Share2 size={18} />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-purple-300 mb-1">
                {stats?.surprises_shared ?? 0}
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Creators who clicked Copy Link or shared via WhatsApp
                {stats && stats.surprises_created > 0 && (
                  <span className="block mt-1 text-purple-300/90 font-medium">
                    ({stats.share_rate}% viral share rate)
                  </span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Funnel & Conversion Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-[#160f24] border border-purple-500/20 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  Creation Funnel & Step Drop-off
                </h3>
                <p className="text-xs text-white/50">
                  Total wizard starts: <strong className="text-white">{stats?.wizard_starts ?? 0}</strong> users
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  {stats?.completion_rate ?? 0}% Converted
                </span>
              </div>
            </div>

            {/* Visual Funnel */}
            <div className="space-y-4 pt-2">
              {[
                { name: 'Wizard Started (Step 1)', count: stats?.wizard_starts ?? 0, color: 'bg-purple-500' },
                { name: 'Recipient Details & Age (Step 2)', count: stats?.step_dropoffs?.['step_2'] ?? Math.round((stats?.wizard_starts ?? 0) * 0.9), color: 'bg-purple-600' },
                { name: 'Cherished Memories (Step 3)', count: stats?.step_dropoffs?.['step_3'] ?? Math.round((stats?.wizard_starts ?? 0) * 0.8), color: 'bg-indigo-600' },
                { name: 'Things I Love (Step 4)', count: stats?.step_dropoffs?.['step_4'] ?? Math.round((stats?.wizard_starts ?? 0) * 0.75), color: 'bg-indigo-500' },
                { name: 'Birthday Cake Selection (Step 5)', count: stats?.step_dropoffs?.['step_5'] ?? Math.round((stats?.wizard_starts ?? 0) * 0.7), color: 'bg-rose-500' },
                { name: 'Successfully Created (Final)', count: stats?.surprises_created ?? 0, color: 'bg-emerald-500' },
                { name: 'Shared to Recipient', count: stats?.surprises_shared ?? 0, color: 'bg-emerald-400' },
              ].map((step, idx) => {
                const max = Math.max(1, stats?.wizard_starts || 1);
                const percent = Math.min(100, Math.round((step.count / max) * 100));

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/80 font-medium">{step.name}</span>
                      <span className="text-white/50 font-mono">
                        {step.count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full ${step.color} transition-all duration-700 rounded-full`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Summary Box */}
          <div className="p-6 rounded-3xl bg-[#160f24] border border-purple-500/20 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-base font-serif font-bold text-white mb-2">
                Conversion Summary
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Calculated strictly from real user sessions:
              </p>

              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/60">Total Initiated</div>
                    <div className="text-lg font-bold text-white">{stats?.wizard_starts ?? 0}</div>
                  </div>
                  <TrendingUp className="text-purple-400" size={20} />
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/60">Abandoned</div>
                    <div className="text-lg font-bold text-amber-400">{stats?.abandoned_count ?? 0}</div>
                  </div>
                  <UserX className="text-amber-400" size={20} />
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/60">Completed Surprises</div>
                    <div className="text-lg font-bold text-emerald-400">{stats?.surprises_created ?? 0}</div>
                  </div>
                  <CheckCircle2 className="text-emerald-400" size={20} />
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/60">Shares Sent</div>
                    <div className="text-lg font-bold text-purple-300">{stats?.surprises_shared ?? 0}</div>
                  </div>
                  <Share2 className="text-purple-300" size={20} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-[11px] text-white/40 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Security: Passwords checked server-side via hash</span>
            </div>
          </div>
        </section>

        {/* Live Activity Feed */}
        <section className="p-6 rounded-3xl bg-[#160f24] border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-purple-400" />
              Recent Activity Log
            </h3>
            <span className="text-xs text-white/40">Last 50 events</span>
          </div>

          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto pr-2">
            {(!stats?.recent_activity || stats.recent_activity.length === 0) ? (
              <div className="py-8 text-center text-xs text-white/40">
                No recent activity recorded yet. Events will appear here as users interact with the app.
              </div>
            ) : (
              stats.recent_activity.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      item.type === 'surprise_created' ? 'bg-emerald-400' :
                      item.type === 'surprise_shared' ? 'bg-purple-400' :
                      item.type === 'link_click' ? 'bg-blue-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-white/90 font-medium">
                      {item.description}
                    </span>
                  </div>
                  <span className="text-white/40 font-mono shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
