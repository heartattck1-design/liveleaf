export interface UserProfile {
  name: string;
  email: string;
  password: string;
  age: string;
  experience: string;
  plantingGoal: string;
  planTier: 'Free' | 'Premium';
  avatarDataUrl?: string;
  appIconDataUrl?: string;
}

export const DEFAULT_USER: UserProfile = {
  name: '',
  email: '',
  password: '',
  age: '',
  experience: '',
  plantingGoal: '',
  planTier: 'Free',
};
