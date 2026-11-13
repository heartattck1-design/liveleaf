import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import App from '../../App';
import { LoginPage } from '../auth/LoginPage';
import { AuthLanding } from './AuthLanding';
import { EspConnectionScreen } from './EspConnectionScreen';
import { PlantSetupScreen } from './PlantSetupScreen';
import { ProjectBriefScreen } from './ProjectBriefScreen';
import { SignUpWizard } from './SignUpWizard';
import { SubscriptionPlansScreen } from './SubscriptionPlansScreen';
import { ProfileSettingsPage } from '../dashboard/ProfileSettingsPage';
import type { PlantProfile } from '../../types/plant';
import {
  loadStoredPlantProfile,
  loadStoredUserProfile,
  saveStoredPlantProfile,
  saveStoredUserProfile,
} from '../../services/profileStorage';
import type { UserProfile } from './OnboardingState';

export function OnboardingApp() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile>(loadStoredUserProfile);
  const [plant, setPlant] = useState<PlantProfile | null>(loadStoredPlantProfile);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthLanding
            onShowLogin={() => navigate('/login')}
            onShowSignup={() => navigate('/signup')}
          />
        }
      />
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={(email) => {
              const nextUser = { ...user, email };
              setUser(nextUser);
              saveStoredUserProfile(nextUser);
              navigate('/plant-setup');
            }}
          />
        }
      />
      <Route
        path="/signup"
        element={
          <SignUpWizard
            onComplete={(newUser) => {
              setUser(newUser);
              saveStoredUserProfile(newUser);
              navigate('/welcome');
            }}
          />
        }
      />
      <Route
        path="/welcome"
        element={
          <ProjectBriefScreen
            onContinue={() => navigate('/plans')}
            onSkip={() => navigate('/plans')}
          />
        }
      />
      <Route
        path="/plans"
        element={
          <SubscriptionPlansScreen
            onSelectFree={() => {
              const nextUser = { ...user, planTier: 'Free' as const };
              setUser(nextUser);
              saveStoredUserProfile(nextUser);
              navigate('/plant-setup');
            }}
            onSelectPremium={() => {
              const nextUser = { ...user, planTier: 'Premium' as const };
              setUser(nextUser);
              saveStoredUserProfile(nextUser);
              navigate('/plant-setup');
            }}
          />
        }
      />
      <Route
        path="/plant-setup"
        element={
          <PlantSetupScreen
            onComplete={(nextPlant) => {
              setPlant(nextPlant);
              saveStoredPlantProfile(nextPlant);
              navigate('/connect');
            }}
          />
        }
      />
      <Route
        path="/connect"
        element={<EspConnectionScreen onConnected={() => navigate('/dashboard')} />}
      />
      <Route
        path="/dashboard"
        element={
          <App
            user={user}
            plant={plant}
            onSignOut={() => navigate('/')}
            onOpenSettings={() => navigate('/settings')}
          />
        }
      />
      <Route
        path="/settings"
        element={
          <ProfileSettingsPage
            user={user}
            plant={plant}
            onCancel={() => navigate('/dashboard')}
            onSave={(nextUser, nextPlant) => {
              saveStoredUserProfile(nextUser);
              saveStoredPlantProfile(nextPlant);
              setUser(nextUser);
              setPlant(nextPlant);
              navigate('/dashboard');
            }}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
