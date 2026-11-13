import { ArrowRight, Leaf, Sparkles, Wifi } from 'lucide-react';

interface ProjectBriefScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

const pillars = [
  {
    icon: Leaf,
    title: 'Live sensing',
    description: 'Track soil moisture, temperature, and health signals from every plant moment by moment.',
  },
  {
    icon: Sparkles,
    title: 'AI diagnosis',
    description: 'Turn raw readings into simple, actionable care advice for healthier growth.',
  },
  {
    icon: Wifi,
    title: 'Reliable sync',
    description: 'Keep updates moving even when the environment shifts or your connection is unstable.',
  },
];

export function ProjectBriefScreen({ onContinue, onSkip }: ProjectBriefScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EDF6EE] text-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(65,170,95,0.12),_transparent_42%)]" />
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <img
          src="/LiveLeafLogo.png"
          alt="LiveLeaf brand logo"
          className="w-[90%] max-w-[1000px] object-contain"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm backdrop-blur-sm">
            Project brief
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white"
          >
            Skip
          </button>
        </header>

        <section className="rounded-[30px] border border-emerald-100 bg-white/75 p-6 shadow-[0_24px_80px_rgba(13,70,38,0.12)] backdrop-blur-md sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Smart plant care
              </div>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-black tracking-[-0.06em] text-slate-800 sm:text-5xl">
                  Your plants, monitored with live insight.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  LiveLeaf combines intelligent sensors, gentle automation, and AI-powered guidance to keep your garden healthier,
                  greener, and easier to manage.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {pillars.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="rounded-2xl border border-emerald-100 bg-[#F8FBF9] p-4 shadow-sm">
                    <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mb-2 text-sm font-bold text-slate-800">{title}</h2>
                    <p className="text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-[#0E2F1D] p-5 text-white shadow-xl sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">System status</p>
                  <p className="mt-2 text-2xl font-bold">Green & healthy</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
                  <Leaf className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-emerald-100">
                    <span>Soil moisture</span>
                    <span>82%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[82%] rounded-full bg-gradient-to-r from-emerald-300 to-lime-300" />
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-emerald-100">
                    <span>Plant health</span>
                    <span>Excellent</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[92%] rounded-full bg-gradient-to-r from-emerald-300 to-green-400" />
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-emerald-100">
                    <span>AI guidance</span>
                    <span>Ready</span>
                  </div>
                  <p className="text-sm leading-6 text-emerald-50/80">
                    Your garden is on track. Increase light exposure slightly for the next 12 hours to maintain peak growth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-emerald-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Built for home growers, hobbyists, and plant-first living.
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2D6A4F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B4332]"
            >
              Continue to plans
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
