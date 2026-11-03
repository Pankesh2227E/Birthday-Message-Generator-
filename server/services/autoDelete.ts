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
    const currentYear = new Date(createdAt).getFullYear();
    // Target birthday date in current year at end of day (23:59:59.999)
    const birthdayThisYear = new Date(currentYear, month, day, 23, 59, 59, 999).getTime();
    const expiryAfterBirthdayThisYear = birthdayThisYear + TWO_DAYS_MS;

    // Condition 1: Birthday is upcoming later in the current calendar year
    // (e.g., today is Nov 3, birthday is Dec 15)
    // -> Keep active until 48 hours after the birthday
    if (birthdayThisYear >= createdAt) {
      return expiryAfterBirthdayThisYear;
    }

    // Condition 2: Birthday occurred within the last 48 hours
    // -> Keep active until the 48-hour window from the birthday completes
    if (expiryAfterBirthdayThisYear > createdAt) {
      return expiryAfterBirthdayThisYear;
    }

    // Condition 3: Near-term upcoming birthday across the New Year boundary (e.g., created late Dec for early Jan)
    const birthdayNextYear = new Date(currentYear + 1, month, day, 23, 59, 59, 999).getTime();
    const daysUntilNext = (birthdayNextYear - createdAt) / (1000 * 60 * 60 * 24);
    if (daysUntilNext <= 31) {
      return birthdayNextYear + TWO_DAYS_MS;
    }

    // Condition 4: The birthday has ALREADY passed earlier this year
    // (e.g., today is November, but user creates a surprise with an October birthdate)
    // -> It NEVER stores data for 1 year! It automatically and safely expires in exactly
    // 48 hours (2 days) from the moment the surprise is created.
    return createdAt + TWO_DAYS_MS;
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
