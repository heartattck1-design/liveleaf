import { Check, Crown, Sparkles, Star } from 'lucide-react';

interface SubscriptionPlansScreenProps {
  onSelectFree: () => void;
  onSelectPremium: () => void;
}

const plans = [
  {
    name: 'Demo',
    price: '$0',
    description: 'Perfect for testing the basics of LiveLeaf',
    features: ['Live monitoring', 'Basic plant insights', 'Community access'],
    highlighted: false,
    cta: 'Start Demo',
    onClick: 'free',
  },
  {
    name: 'Premium',
    price: '$5',
    cadence: '/ month',
    description: 'Advanced care for serious growers and home gardens',
    features: ['AI-powered diagnosis', 'Smart alerts', 'Priority recommendations', 'Unlimited plant tracking'],
    highlighted: true,
    cta: 'Upgrade Premium',
    onClick: 'premium',
  },
];

export function SubscriptionPlansScreen({ onSelectFree, onSelectPremium }: SubscriptionPlansScreenProps) {
  return (
    <div className="min-h-screen bg-[#F4F7F5] px-4 py-10 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Subscription demo
          </div>
          <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-800 sm:text-5xl">
            Pick the plan that fits your garden.
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={[
                'relative rounded-[28px] border p-6 shadow-lg transition sm:p-8',
                plan.highlighted
                  ? 'border-emerald-200 bg-[#132E1E] text-white shadow-emerald-950/20'
                  : 'border-slate-200 bg-white text-slate-800',
              ].join(' ')}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-900">
                  Most popular
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className={['text-sm font-semibold uppercase tracking-[0.2em]', plan.highlighted ? 'text-emerald-200' : 'text-slate-500'].join(' ')}>
                    {plan.name}
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-4xl font-black tracking-[-0.08em]">{plan.price}</span>
                    {plan.cadence && <span className={['text-sm', plan.highlighted ? 'text-emerald-200' : 'text-slate-500'].join(' ')}>{plan.cadence}</span>}
                  </div>
                </div>

                <div className={['flex h-12 w-12 items-center justify-center rounded-2xl', plan.highlighted ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-700'].join(' ')}>
                  {plan.highlighted ? <Crown className="h-6 w-6" /> : <Star className="h-6 w-6" />}
                </div>
              </div>

              <p className={['mb-6 text-sm leading-6', plan.highlighted ? 'text-emerald-50/80' : 'text-slate-600'].join(' ')}>
                {plan.description}
              </p>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className={['mt-0.5 flex h-5 w-5 items-center justify-center rounded-full', plan.highlighted ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-700'].join(' ')}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className={plan.highlighted ? 'text-emerald-50' : 'text-slate-700'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={plan.highlighted ? onSelectPremium : onSelectFree}
                className={[
                  'mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition',
                  plan.highlighted
                    ? 'bg-emerald-400 text-slate-900 hover:bg-emerald-300'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                ].join(' ')}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
