import { useMemo, useState } from 'react';

import App from '../../App';
import { LoginPage } from '../auth/LoginPage';
import { AuthLanding } from './AuthLanding';
import { ProjectBriefScreen } from './ProjectBriefScreen';
import { SignUpWizard } from './SignUpWizard';
import { SubscriptionPlansScreen } from './SubscriptionPlansScreen';
import { DEFAULT_USER, type OnboardingStep, type UserProfile } from './OnboardingState';

export function OnboardingApp() {
  const [step, setStep] = useState<OnboardingStep>('auth-landing');
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  const currentView = useMemo(() => {
    switch (step) {
      case 'auth-landing':
        return (
          <AuthLanding
            onShowLogin={() => setStep('login')}
            onShowSignup={() => setStep('signup')}
          />
        );
      case 'login':
        return (
          <LoginPage
            onLogin={() => {
              setUser((current) => ({ ...current, email: current.email || '' }));
              setStep('dashboard');
            }}
          />
        );
      case 'signup':
        return (
          <SignUpWizard
            onComplete={(newUser) => {
              setUser(newUser);
              setStep('project-brief');
            }}
          />
        );
      case 'project-brief':
        return <ProjectBriefScreen onContinue={() => setStep('subscription')} />;
      case 'subscription':
        return (
          <SubscriptionPlansScreen
            onSelectFree={() => {
              setUser((current) => ({ ...current, planTier: 'Free' }));
              setStep('dashboard');
            }}
            onSelectPremium={() => {
              setUser((current) => ({ ...current, planTier: 'Premium' }));
              setStep('dashboard');
            }}
          />
        );
      case 'dashboard':
        return <App />;
      default:
        return null;
    }
  }, [step]);

  return <>{currentView}</>;
}
