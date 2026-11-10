# Liveleaf Dynamic Dashboard UI/UX Plan

## Goal

Build a standalone, responsive plant telemetry dashboard that presents live sensor values, status warnings, simulation controls, and a dual-mode analytics experience for a Liveleaf IoT client app.

## 1. Layout Blueprint

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [Logo] Liveleaf Dashboard       [● Stream Active]  [Reset Baseline]    │
├────────────────────────────────────────────────────────────────────────┤
│ Quick Actions: [💧 Water Plant (+35%)] [🔥 Heat Spike (+5.5°)]          │
├────────────────────────────────────────────────────────────────────────┤
│ ⚡ Action Notification Banner (Displays transient feedback)             │
├────────────────────────────────────────────────────────────────────────┤
│ [ Mode Switcher:  (•) User-Friendly Mode   ( ) Advanced Analytics ]    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ HERO STATUS CARD ]                                                  │
│  State: "Plant Needs Water Immediately" (Amber warning or Green OK)    │
│                                                                        │
│  [ SENSOR QUAD GRID ]                                                  │
│  ┌──────────────────┐ ┌──────────────────┐                             │
│  │ Soil Moisture    │ │ Temperature      │                             │
│  │ 22.5% [Crit Low] │ │ 31.8°C [Warm]    │                             │
│  └──────────────────┘ └──────────────────┘                             │
│  ┌──────────────────┐ ┌──────────────────┐                             │
│  │ Air Humidity     │ │ Light Intensity  │                             │
│  │ 40% [Optimal]    │ │ 18,500 Lux [Sun] │                             │
│  └──────────────────┘ └──────────────────┘                             │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. States to Manage

- `telemetry`: current sensor state
- `isAutoStreaming`: enable or pause simulated live updates
- `activeTab`: `user-friendly` or `analytics`
- `timeRange`: `24h`, `7d`, `30d`
- `notification`: transient action feedback

## 3. Live Interaction Rules

- `handleWaterPlant()`: increase soil moisture by `+35%`, capped at `85%`
- `handleSimulateHeatSpike()`: increase temperature by `+5.5°C`
- `handleResetSensors()`: restore baseline values (`65%`, `24.5°C`, etc.)
- `toggleAutoStream()`: pause/resume simulated background telemetry updates

## 4. Visual System

- Primary brand palette: deep forest green, mint, emerald, amber, slate
- Warning states use amber backgrounds and gold/yellow accents
- Healthy states use emerald/mint backgrounds and green progress bars
- Sensor cards include a label, value, status badge, and animated fill bar

## 5. Component Structure

```text
src/
├── components/
│   ├── common/
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   └── NotificationBanner.tsx
│   ├── layout/
│   │   └── HeaderBar.tsx
│   ├── dashboard/
│   │   ├── QuickActionsPanel.tsx
│   │   ├── HeroStatusCard.tsx
│   │   ├── SensorCard.tsx
│   │   ├── SensorQuadGrid.tsx
│   │   └── ModeSwitcher.tsx
│   └── analytics/
│       ├── TimeSeriesChart.tsx
│       ├── PipelineVisualizer.tsx
│       └── AdvancedAnalyticsView.tsx
├── hooks/
│   └── useTelemetry.ts
├── types/
│   └── telemetry.ts
├── constants/
│   └── theme.ts
├── App.tsx
└── index.css
```

## 6. Implementation Sequence

1. Create telemetry types and theme constants.
2. Build telemetry hook with simulation state and action handlers.
3. Implement header, quick actions, and notification banner.
4. Build hero status card and sensor grid.
5. Add analytics mode with chart and pipeline visualizer.
6. Compose app shell and verify rendering in the browser.

## 7. AI Agent Prompt Sequence

### Prompt 1

"Create a React 19 TypeScript header component `HeaderBar.tsx` for an IoT plant dashboard using Tailwind CSS. It must include the Liveleaf logo, a Live Stream Active button with a pulsating green LED dot indicator, and a 'Reset Baseline' button. Use `lucide-react` icons and deep forest green (`#1B4332`) accents."

### Prompt 2

"Create `QuickActionsPanel.tsx` and `NotificationBanner.tsx`. QuickActionsPanel should feature two action buttons: '💧 Water Plant (+35%)' and '🔥 Heat Spike (+5.5°)'. NotificationBanner should be a transient toast notification banner that slides down from top with a close button and dismisses automatically after 4 seconds."

### Prompt 3

"Build the User-Friendly View for the Liveleaf dashboard. Include a `HeroStatusCard.tsx` that dynamically calculates plant status (e.g. 'Plant Needs Water Immediately' in amber when soil moisture < 30% or temp > 30°C, vs 'Plant Thriving' in mint green). Below it, create `SensorQuadGrid.tsx` displaying 4 sensor cards (Soil Moisture, Temperature, Air Humidity, Light Intensity) with live numeric values, animated progress bars, and colored status badges ('Crit Low', 'Warm', 'Optimal', 'Sun')."

### Prompt 4

"Create a mode switcher component `ModeSwitcher.tsx` with pill buttons to toggle between 'User-Friendly Mode' and 'Advanced Analytics'. For Advanced Analytics mode, build an SVG time-series line chart `TimeSeriesChart.tsx` with period filters ('24h', '7d', '30d') and a data pipeline diagram `PipelineVisualizer.tsx` showing the flow from ESP32 sensors to UI state."

### Prompt 5

"Create a custom React hook `useTelemetry.ts` that manages the telemetry state (moisture, temp, humidity, light), auto-streaming interval (3s micro-jitter), `handleWaterPlant` (+35% capped at 85%), `handleSimulateHeatSpike` (+5.5°C), `handleResetSensors`, and transient notifications. Wire all components together in `App.tsx`."

## 8. Acceptance Criteria

- Header displays stream toggle and reset baseline control.
- Notification banner appears after each interaction.
- Plant status card changes based on thresholds.
- Watering and heat simulation update values immediately.
- Toggle between user-friendly and analytics modes without losing telemetry state.
- Dashboard remains usable on desktop and narrower screens.
