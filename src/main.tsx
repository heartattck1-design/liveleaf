import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import { OnboardingApp } from './components/onboarding/OnboardingApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <OnboardingApp />
    </BrowserRouter>
  </StrictMode>,
);
