export type Relationship = 
  | 'Girlfriend' 
  | 'Boyfriend' 
  | 'Best Friend' 
  | 'Wife' 
  | 'Husband' 
  | 'Sister' 
  | 'Brother' 
  | 'Other';

export interface Memory {
  id: string;
  url: string;
  caption?: string;
  hiddenMessage?: string;
  publicId?: string;
}

export interface SurpriseData {
  recipientName: string;
  recipientAge: string;
  dob?: string;
  cakeStyle?: string;
  recipientGender: string;
  relationship: Relationship;
  howWeMet: string;
  favoriteMemory: string;
  whatMakesThemSpecial: string;
  personality: string;
  interests: string;
  memories: Memory[];
  musicUrl?: string;
  personalMessage: string;
  
  // AI Generated fields
  intro?: string;
  birthday_message?: string;
  memory_captions?: string[];
  things_i_love?: string[];
  final_message?: string;
  cakeUrl?: string;
  status?: 'generating' | 'ready' | 'failed' | 'expired';
  progress?: string;
  stage?: number;
  error?: string;
  expires_at?: number;
}

export type AppView = 'LANDING' | 'BUILDER' | 'GENERATING' | 'RECIPIENT_PREVIEW' | 'RECIPIENT_VIEW' | 'EXPIRED' | 'ADMIN';
