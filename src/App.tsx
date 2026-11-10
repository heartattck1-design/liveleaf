import { useEffect, useState } from 'react';

import { LoginPage } from './components/auth/LoginPage';
import { NotificationBanner } from './components/common/NotificationBanner';
import { PipelineVisualizer } from './components/analytics/PipelineVisualizer';
import { TimeSeriesChart } from './components/analytics/TimeSeriesChart';
import { HeaderBar } from './components/layout/HeaderBar';
import { HeroStatusCard } from './components/dashboard/HeroStatusCard';
import { ModeSwitcher } from './components/dashboard/ModeSwitcher';
import { QuickActionsPanel } from './components/dashboard/QuickActionsPanel';
import { SensorQuadGrid } from './components/dashboard/SensorQuadGrid';
import { useTelemetry } from './hooks/useTelemetry';

type ThemeMode = 'light' | 'dark';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

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
          onSignOut={() => setIsLoggedIn(false)}
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
            <HeroStatusCard telemetry={telemetry} />
            <SensorQuadGrid telemetry={telemetry} />
          </main>
        ) : (
          <main className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
            <TimeSeriesChart range={timeRange} onRangeChange={setTimeRange} />
            <PipelineVisualizer />
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
