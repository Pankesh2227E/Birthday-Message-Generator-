import fs from 'fs';
import path from 'path';

export interface AnalyticsData {
  link_clicks: number;
  surprises_created: number;
  wizard_starts: number;
  surprises_shared: number;
  abandoned_count: number;
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

const DATA_DIR = path.join(process.cwd(), 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

const defaultData: AnalyticsData = {
  link_clicks: 0,
  surprises_created: 0,
  wizard_starts: 0,
  surprises_shared: 0,
  abandoned_count: 0,
  step_dropoffs: {
    step_1: 0,
    step_2: 0,
    step_3: 0,
    step_4: 0,
    step_5: 0,
    step_6: 0,
    step_7: 0,
    step_8: 0,
  },
  daily_stats: {},
  recent_activity: [],
};

class AnalyticsService {
  private data: AnalyticsData = { ...defaultData };
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(ANALYTICS_FILE)) {
        const raw = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...defaultData,
          ...parsed,
          step_dropoffs: { ...defaultData.step_dropoffs, ...(parsed.step_dropoffs || {}) },
          daily_stats: parsed.daily_stats || {},
          recent_activity: Array.isArray(parsed.recent_activity) ? parsed.recent_activity : [],
        };
        // Recalculate abandoned count: users who started builder but never finished
        this.data.abandoned_count = Math.max(0, this.data.wizard_starts - this.data.surprises_created);
      } else {
        this.saveNow();
      }
    } catch (err) {
      console.error('[ANALYTICS] Error loading analytics file:', err);
      this.data = { ...defaultData };
    }
  }

  private saveNow() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ANALYTICS] Error saving analytics file:', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      this.saveNow();
    }, 1000);
  }

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  private ensureTodayDaily() {
    const today = this.getTodayKey();
    if (!this.data.daily_stats[today]) {
      this.data.daily_stats[today] = {
        link_clicks: 0,
        surprises_created: 0,
        wizard_starts: 0,
        surprises_shared: 0,
      };
    }
    return today;
  }

  private addActivity(type: AnalyticsData['recent_activity'][0]['type'], description: string, details?: any) {
    const entry = {
      id: Math.random().toString(36).substring(2, 10),
      type,
      description,
      timestamp: new Date().toISOString(),
      details,
    };
    this.data.recent_activity.unshift(entry);
    if (this.data.recent_activity.length > 50) {
      this.data.recent_activity = this.data.recent_activity.slice(0, 50);
    }
  }

  public trackLinkClick(surpriseId?: string, recipientName?: string) {
    this.data.link_clicks += 1;
    const today = this.ensureTodayDaily();
    this.data.daily_stats[today].link_clicks += 1;
    
    const desc = recipientName 
      ? `Recipient opened surprise for "${recipientName}"`
      : surpriseId 
        ? `Surprise link clicked (${surpriseId})` 
        : `Surprise celebration link opened`;
    this.addActivity('link_click', desc, { surpriseId, recipientName });
    this.scheduleSave();
  }

  public trackWizardStart() {
    this.data.wizard_starts += 1;
    this.data.abandoned_count = Math.max(0, this.data.wizard_starts - this.data.surprises_created);
    const today = this.ensureTodayDaily();
    this.data.daily_stats[today].wizard_starts += 1;
    
    this.addActivity('wizard_start', 'User started creating a birthday surprise');
    this.scheduleSave();
  }

  public trackWizardStep(step: number, stepName?: string) {
    const key = `step_${step}`;
    if (this.data.step_dropoffs[key] === undefined) {
      this.data.step_dropoffs[key] = 0;
    }
    this.data.step_dropoffs[key] += 1;
    this.scheduleSave();
  }

  public trackSurpriseCreated(surpriseId: string, recipientName?: string) {
    this.data.surprises_created += 1;
    this.data.abandoned_count = Math.max(0, this.data.wizard_starts - this.data.surprises_created);
    const today = this.ensureTodayDaily();
    this.data.daily_stats[today].surprises_created += 1;
    
    const desc = recipientName
      ? `Birthday surprise created for "${recipientName}"`
      : `New birthday surprise generated (${surpriseId})`;
    this.addActivity('surprise_created', desc, { surpriseId, recipientName });
    this.scheduleSave();
  }

  public trackSurpriseShared(platform?: string, surpriseId?: string, recipientName?: string) {
    this.data.surprises_shared += 1;
    const today = this.ensureTodayDaily();
    this.data.daily_stats[today].surprises_shared += 1;
    
    const target = platform ? ` via ${platform}` : '';
    const desc = recipientName
      ? `Surprise for "${recipientName}" shared${target}`
      : `Surprise page shared${target}`;
    this.addActivity('surprise_shared', desc, { platform, surpriseId, recipientName });
    this.scheduleSave();
  }

  public getStats() {
    this.data.abandoned_count = Math.max(0, this.data.wizard_starts - this.data.surprises_created);
    return {
      ...this.data,
      completion_rate: this.data.wizard_starts > 0 
        ? Math.round((this.data.surprises_created / this.data.wizard_starts) * 100) 
        : 0,
      abandonment_rate: this.data.wizard_starts > 0
        ? Math.round((this.data.abandoned_count / this.data.wizard_starts) * 100)
        : 0,
      share_rate: this.data.surprises_created > 0
        ? Math.round((this.data.surprises_shared / this.data.surprises_created) * 100)
        : 0,
    };
  }

  public resetStats() {
    this.data = { ...defaultData, step_dropoffs: { ...defaultData.step_dropoffs }, daily_stats: {}, recent_activity: [] };
    this.saveNow();
    return this.getStats();
  }
}

export const analyticsService = new AnalyticsService();
