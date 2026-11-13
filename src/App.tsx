import { useEffect, useState } from 'react';

import { NotificationBanner } from './components/common/NotificationBanner';
import { PipelineVisualizer } from './components/analytics/PipelineVisualizer';
import { SensorAnalyticsSummary } from './components/analytics/SensorAnalyticsSummary';
import { TimeSeriesChart } from './components/analytics/TimeSeriesChart';
import { HeaderBar } from './components/layout/HeaderBar';
import { LiveSensorReadings } from './components/dashboard/LiveSensorReadings';
import { HeroStatusCard } from './components/dashboard/HeroStatusCard';
import { ModeSwitcher } from './components/dashboard/ModeSwitcher';
import { FloatingChatWidget } from './components/dashboard/FloatingChatWidget';
import { PlantAnalysisCard } from './components/dashboard/PlantAnalysisCard';
import { PlantCareProfileCard } from './components/dashboard/PlantCareProfileCard';
import { QuickActionsPanel } from './components/dashboard/QuickActionsPanel';
import { SensorQuadGrid } from './components/dashboard/SensorQuadGrid';
import { useTelemetry } from './hooks/useTelemetry';
import { useDeviceTelemetry } from './hooks/useDeviceTelemetry';
import { type UserProfile } from './components/onboarding/OnboardingState';
import type { PlantProfile } from './types/plant';

type ThemeMode = 'light' | 'dark';

interface AppProps {
  user?: UserProfile;
  plant: PlantProfile | null;
  onSignOut?: () => void;
  onOpenSettings: () => void;
}

function App({ user, plant, onSignOut, onOpenSettings }: AppProps) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const savedTheme = window.localStorage.getItem('liveleaf-theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
    document.body.style.background = theme === 'dark' ? '#020817' : '#f4f7f5';
    window.localStorage.setItem('liveleaf-theme', theme);
  }, [theme]);

  const {
    telemetry,
    isAutoStreaming,
    activeTab,
    timeRange,
    notification,
    setActiveTab,
    setTimeRange,
    dismissNotification,
    handleResetSensors,
    toggleAutoStream,
  } = useTelemetry();
  const deviceTelemetry = useDeviceTelemetry();

  return (
    <div
      className={
        theme === 'dark'
          ? 'min-h-screen bg-slate-950 text-slate-100'
          : 'min-h-screen bg-[#F4F7F5] text-slate-800'
      }
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <HeaderBar
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
          isStreaming={isAutoStreaming}
          onReset={handleResetSensors}
          onToggleStream={toggleAutoStream}
          onSignOut={onSignOut || (() => {})}
          onOpenSettings={onOpenSettings}
          userName={user?.name || 'Grower'}
          planTier={user?.planTier || 'Free'}
          avatarUrl={user?.avatarDataUrl}
          appIconUrl={user?.appIconDataUrl}
        />

        <QuickActionsPanel />

        {notification && (
          <NotificationBanner
            message={notification.message}
            type={notification.type}
            onDismiss={dismissNotification}
          />
        )}

        <ModeSwitcher theme={theme} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'user-friendly' ? (
          <main className="mt-6 space-y-6">
            <p className="text-xs text-slate-500">
              The normalized cards are a local demo preview. Raw readings below are fetched from the device telemetry endpoint.
            </p>
            <HeroStatusCard telemetry={telemetry} />
            <SensorQuadGrid telemetry={telemetry} />
            <PlantCareProfileCard
              plant={plant}
              theme={theme}
              onEdit={onOpenSettings}
            />
            <LiveSensorReadings
              latest={deviceTelemetry.latest}
              error={deviceTelemetry.error}
              isLoading={deviceTelemetry.isLoading}
              onRefresh={() => void deviceTelemetry.refresh()}
              theme={theme}
            />
          </main>
        ) : activeTab === 'analytics' ? (
          <main className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
              <TimeSeriesChart
                history={deviceTelemetry.history}
                range={timeRange}
                onRangeChange={setTimeRange}
                theme={theme}
              />
              <PipelineVisualizer hasTelemetry={deviceTelemetry.latest !== null} />
            </div>
            <SensorAnalyticsSummary
              history={deviceTelemetry.history}
              range={timeRange}
              theme={theme}
            />
            <PlantAnalysisCard theme={theme} />
          </main>
        ) : null}
      </div>
      <FloatingChatWidget theme={theme} />
    </div>
  );
}

export default App;
