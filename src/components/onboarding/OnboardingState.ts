export type OnboardingStep =
  | 'auth-landing'
  | 'login'
  | 'signup'
  | 'project-brief'
  | 'subscription'
  | 'dashboard';

export interface UserProfile {
  name: string;
  email: string;
  password: string;
  age: string;
  experience: string;
  plantingGoal: string;
  planTier: 'Free' | 'Premium';
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
