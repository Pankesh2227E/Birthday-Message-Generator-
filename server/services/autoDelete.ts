import { d1Service } from './d1';
import { cloudinaryService } from './cloudinary';

/**
 * Calculates the exact expiration timestamp for a surprise:
 * Exactly 2 days (48 hours) after the selected birthdate.
 */
export function calculateExpiryTimestamp(dob?: string, createdAt: number = Date.now()): number {
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

  if (!dob) {
    return createdAt + TWO_DAYS_MS;
  }

  // Parse YYYY-MM-DD or MM-DD
  const parts = dob.trim().split('-');
  let month = -1;
  let day = -1;

  if (parts.length === 3) {
    month = parseInt(parts[1], 10) - 1; // 0-indexed
    day = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    month = parseInt(parts[0], 10) - 1;
    day = parseInt(parts[1], 10);
  }

  if (month >= 0 && day > 0) {
    const currentYear = new Date().getFullYear();
    // Target birthday date in current year at end of day (23:59:59)
    const birthdayThisYear = new Date(currentYear, month, day, 23, 59, 59, 999).getTime();
    
    // 2 days after the selected birthdate
    const expiryAfterBirthday = birthdayThisYear + TWO_DAYS_MS;

    // If the birthday was far in the past this year (e.g. 6 months ago) and someone creates it today,
    // ensure they at least get 2 full days from creation time to enjoy it.
    return Math.max(expiryAfterBirthday, createdAt + TWO_DAYS_MS);
  }

  return createdAt + TWO_DAYS_MS;
}

export function isSurpriseExpired(surpriseData: any): boolean {
  if (!surpriseData) return false;
  
  const now = Date.now();
  if (surpriseData.expires_at && typeof surpriseData.expires_at === 'number') {
    return now >= surpriseData.expires_at;
  }

  // Fallback calculation from dob if expires_at was not yet stored
  const expiry = calculateExpiryTimestamp(surpriseData.dob, surpriseData.created_at ? new Date(surpriseData.created_at).getTime() : now);
  return now >= expiry;
}

export async function purgeSurprise(surpriseId: string, surpriseData?: any) {
  try {
    console.log(`[AUTO-DELETE] Purging all data for surprise: ${surpriseId}`);
    
    // 1. Delete associated Cloudinary memories if public IDs are tracked
    if (surpriseData && Array.isArray(surpriseData.memories)) {
      for (const mem of surpriseData.memories) {
        if (mem.publicId) {
          try {
            await cloudinaryService.destroyImage(mem.publicId);
          } catch (e: any) {
            console.warn(`[AUTO-DELETE] Cloudinary photo purge failed for ${mem.publicId}:`, e.message);
          }
        }
      }
    }

    // 2. Delete row from Cloudflare D1
    await d1Service.deleteSurprise(surpriseId);
    console.log(`[AUTO-DELETE] Successfully purged surprise ${surpriseId}`);
    return true;
  } catch (error: any) {
    console.error(`[AUTO-DELETE] Error purging surprise ${surpriseId}:`, error.message);
    return false;
  }
}

/**
 * Background auto-delete sweep running every hour
 */
export function startAutoDeleteWorker() {
  const checkAndClean = async () => {
    try {
      console.log('[AUTO-DELETE] Running scheduled expiration sweep...');
      const surprises = await d1Service.getAllSurprises();
      for (const item of surprises) {
        if (isSurpriseExpired(item.data)) {
          console.log(`[AUTO-DELETE] Found expired surprise ${item.id} (DOB: ${item.data?.dob})`);
          await purgeSurprise(item.id, item.data);
        }
      }
    } catch (err: any) {
      console.warn('[AUTO-DELETE] Expiration sweep warning:', err.message);
    }
  };

  // Run on startup and every 30 minutes
  setTimeout(checkAndClean, 5000);
  setInterval(checkAndClean, 30 * 60 * 1000);
}
