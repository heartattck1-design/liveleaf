import { DEFAULT_USER, type UserProfile } from '../components/onboarding/OnboardingState';
import type { PlantCareRange, PlantProfile } from '../types/plant';

const USER_PROFILE_KEY = 'liveleaf_profile';
const PLANT_PROFILE_KEY = 'liveleaf_plant_profile';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readStoredRecord(key: string): Record<string, unknown> | null {
  const serialized = window.localStorage.getItem(key);
  if (!serialized) return null;

  try {
    const parsed: unknown = JSON.parse(serialized);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function storedString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function isPlantCareRange(value: unknown): value is PlantCareRange {
  if (!isRecord(value) || typeof value.unit !== 'string') return false;
  return (
    (value.minimum === undefined || typeof value.minimum === 'number') &&
    (value.maximum === undefined || typeof value.maximum === 'number') &&
    (value.idealRange === undefined || typeof value.idealRange === 'string') &&
    (value.guidance === undefined || typeof value.guidance === 'string') &&
    (value.recommendation === undefined || typeof value.recommendation === 'string')
  );
}

function isPlantProfile(value: unknown): value is PlantProfile {
  if (!isRecord(value) || !isRecord(value.care)) return false;
  return (
    typeof value.commonName === 'string' &&
    typeof value.scientificName === 'string' &&
    (value.species === undefined || typeof value.species === 'string') &&
    (value.plantType === undefined || typeof value.plantType === 'string') &&
    (value.confidence === undefined || typeof value.confidence === 'string') &&
    isPlantCareRange(value.care.temperature) &&
    isPlantCareRange(value.care.soilMoisture) &&
    isPlantCareRange(value.care.airHumidity) &&
    isPlantCareRange(value.care.light) &&
    Array.isArray(value.recommendations) &&
    value.recommendations.every((item) => typeof item === 'string')
  );
}

export function loadStoredUserProfile(): UserProfile {
  const stored = readStoredRecord(USER_PROFILE_KEY);
  if (!stored) return DEFAULT_USER;

  return {
    ...DEFAULT_USER,
    name: storedString(stored.name),
    email: storedString(stored.email),
    age: storedString(stored.age),
    experience: storedString(stored.experience),
    plantingGoal: storedString(stored.plantingGoal),
    planTier: stored.planTier === 'Premium' ? 'Premium' : 'Free',
    avatarDataUrl: storedString(stored.avatarDataUrl) || undefined,
    appIconDataUrl: storedString(stored.appIconDataUrl) || undefined,
  };
}

export function saveStoredUserProfile(profile: UserProfile): void {
  const { name, email, age, experience, plantingGoal, planTier, avatarDataUrl, appIconDataUrl } = profile;
  window.localStorage.setItem(
    USER_PROFILE_KEY,
    JSON.stringify({ name, email, age, experience, plantingGoal, planTier, avatarDataUrl, appIconDataUrl }),
  );
}

export function loadStoredPlantProfile(): PlantProfile | null {
  const stored = readStoredRecord(PLANT_PROFILE_KEY);
  return isPlantProfile(stored) ? stored : null;
}

export function saveStoredPlantProfile(profile: PlantProfile | null): void {
  if (profile) {
    window.localStorage.setItem(PLANT_PROFILE_KEY, JSON.stringify(profile));
  } else {
    window.localStorage.removeItem(PLANT_PROFILE_KEY);
  }
}
