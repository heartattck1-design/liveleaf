import { ArrowRight, Leaf, Radio, Wifi } from 'lucide-react';

interface PipelineVisualizerProps {
  hasTelemetry: boolean;
}

export function PipelineVisualizer({ hasTelemetry }: PipelineVisualizerProps) {
  const stages = [
    {
      title: 'Sensors',
      description: hasTelemetry ? 'Latest device packet received' : 'Waiting for sensor packet',
      icon: Leaf,
      accent: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Gateway',
      description: hasTelemetry ? 'Backend telemetry available' : 'No device telemetry available',
      icon: Wifi,
      accent: 'bg-sky-100 text-sky-700',
    },
    {
      title: 'Analytics',
      description: hasTelemetry ? 'Calculations use received samples' : 'Waiting for readings',
      icon: Radio,
      accent: 'bg-violet-100 text-violet-700',
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Data Pipeline
      </p>
      <h3 className="mt-1 text-lg font-semibold text-slate-800">Live telemetry flow</h3>

      <div className="mt-6 space-y-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon;

          return (
            <div key={stage.title} className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stage.accent}`}>
                <Icon size={18} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-slate-700">{stage.title}</p>
                <p className="text-xs text-slate-500">{stage.description}</p>
              </div>

              {index < stages.length - 1 && <ArrowRight className="text-slate-400" size={18} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
