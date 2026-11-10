---
name: react-iot-app
description: "Guidelines and best practices for senior React.js, TypeScript, and Tailwind CSS development in IoT client applications interfacing with ESP32 devices, RESTful APIs, WebSockets, mDNS, and third-party integrations. Use when building, architecting, or refactoring modular IoT dashboard components and real-time frontend features."
user-invocable: true
disable-model-invocation: false
---

# Senior React.js IoT Client Application Development

Guidelines and architectural practices for building high-performance, modular, real-time IoT client applications in React.js, TypeScript, and Tailwind CSS.

## Core Engineering Principles

### 1. Modular & Reusable Component Architecture

- **Single Responsibility**: Every component must focus on one specific UI responsibility or logical concern.
- **Component Decomposition**: Break down complex IoT dashboards into atomic, reusable components (e.g., `SensorGauge`, `DeviceCard`, `StatusBadge`, `ToggleSwitch`, `TelemetryChart`).
- **Composition over Inheritance**: Use React `children`, slot patterns, and custom hooks to separate UI representation from IoT network logic.
- **Strict Exports**: Keep components organized under `src/components/` with clean `index.ts` barrel exports or modular file structures.

### 2. Strict TypeScript & Type Safety

- **Strict Mode Enforcement**: Ensure `strict: true` is enabled in `tsconfig.json`.
- **Explicit Telemetry Types**: Define strict interfaces for all ESP32 device states, sensor readings, configuration payloads, and WebSocket events.

  ```typescript
  export interface SensorReading {
    sensorId: string;
    type: "temperature" | "humidity" | "moisture" | "light";
    value: number;
    unit: string;
    timestamp: number;
  }

  export interface ESP32DeviceState {
    deviceId: string;
    hostname: string; // e.g., liveleaf-esp32.local
    ipAddress: string;
    isOnline: boolean;
    firmwareVersion: string;
    rssi: number;
    relays: Record<string, boolean>;
    sensors: SensorReading[];
  }
  ```

- **Zero `any` Policy**: Avoid type assertions (`as Any`) or weak types. Handle `undefined`, `null`, and network failure states explicitly using discriminant unions.

### 3. Smart Dependency Usage (Don't Reinvent the Wheel)

- **State & Data Fetching**: Use `@tanstack/react-query` or `swr` for REST API caching and polling; use `zustand` for lightweight global state.
- **Real-Time Data Visualization**: Use `recharts` or `chart.js` with `react-chartjs-2` for live telemetry graphing.
- **Icons & Styling**: Use `lucide-react` for clean IoT status icons and `clsx` / `tailwind-merge` (`cn` utility) for conditional Tailwind classes.
- **HTTP Client**: Use `axios` or standard `fetch` wrapper with typed interceptors and timeout control suitable for microcontrollers.

---

## IoT & Embedded Systems Communication

### 1. ESP32 & mDNS Hostname Resolution

- ESP32 devices advertise local hostnames via mDNS (e.g., `http://liveleaf-node.local`).
- Implement dynamic IP discovery and fallback mechanisms:
  - Primary target: mDNS hostname (`.local`).
  - Secondary fallback: IP address scanning or stored static IP configuration.
- Handle CORS constraints when communicating directly with ESP32 Web Servers in local networks.

### 2. Real-Time WebSockets

- Encapsulate WebSocket logic in reusable custom hooks (e.g., `useESP32WebSocket`).
- **Connection Lifecycle**: Actively track states: `CONNECTING`, `CONNECTED`, `DISCONNECTED`, `RECONNECTING`.
- **Auto-Reconnection**: Exponential backoff reconnection with configurable retry limits.
- **Heartbeat & Keepalive**: Periodically send ping frames to detect silent TCP drops from ESP32 clients.

### 3. RESTful API Integration

- Structure REST calls with concise service layers (e.g., `src/services/esp32Api.ts`).
- Support common IoT endpoints:
  - `GET /api/v1/status` — Device health and diagnostic data.
  - `POST /api/v1/control` — Relay/actuator toggle actions.
  - `POST /api/v1/wifi` — Wi-Fi network provisioning.
  - `GET /api/v1/telemetry` — Historical sensor logs.

---

## Recommended Workflow & Code Structure

```
src/
├── assets/             # Static icons, images
├── components/         # Modular reusable UI components
│   ├── common/         # Generic UI (Button, Card, Badge, Modal)
│   ├── dashboard/      # Telemetry gauges, status indicators
│   └── device/         # ESP32 controls, settings forms
├── hooks/              # Custom hooks (useWebSocket, useESP32, useTelemetry)
├── services/           # REST API client, WebSocket manager, mDNS resolver
├── types/              # Strict TypeScript interfaces & types
├── utils/              # Formatting helpers, units, class merger (cn)
├── App.tsx
└── main.tsx
```

## Checklist for New Features

1. Is every reusable element separated into a reusable component?
2. Are all ESP32 inputs/outputs strictly typed in TypeScript without `any`?
3. Is real-time state managed gracefully with connection status feedback shown to the user?
4. Are standard libraries installed for icons, charting, and network state management instead of custom wheel-reinvention?
