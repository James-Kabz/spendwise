import { GlassCard } from "@jameskabz/nextcraft-ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Spendwise
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            A calmer way to track money and meals.
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            I want one place to manage my finance and eating habits, so I can
            build discipline and tame my behavior. I am a Kenyan building this
            for myself and anyone who wants gentle, honest accountability.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard tone="ocean" intensity="strong" className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-sky-200">
                Why Spendwise
              </p>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Track what you spend, then connect it to how you eat.
              </h2>
              <p className="text-sm leading-7 text-slate-200/80">
                Most budget apps ignore habits. Spendwise links daily spending
                with meals and mood so I can see what triggers unnecessary
                purchases and unhealthy snacks.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                Start tracking
              </button>
              <button className="rounded-full border border-slate-500 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-300">
                See the flow
              </button>
            </div>
          </GlassCard>

          <GlassCard tone="midnight" className="space-y-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300">
              <span>Today</span>
              <span className="text-emerald-300">Kes 2,540</span>
            </div>
            <div className="rounded-2xl border border-slate-600/50 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Lunch budget</p>
              <p className="mt-2 text-2xl font-semibold text-white">Kes 450</p>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-700">
                <div className="h-2 w-2/3 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-600/50 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Top expense category</p>
              <p className="mt-2 text-lg font-semibold text-white">
                Transport &amp; fuel
              </p>
              <p className="mt-1 text-xs text-slate-400">
                4 transactions this week
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                Habit cue
              </p>
              <p className="mt-2 text-sm text-emerald-50">
                When I skip breakfast, I spend 25% more on snacks. Plan a simple
                morning meal.
              </p>
            </div>
          </GlassCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Capture expenses fast",
              body: "Log spending in seconds with quick tags. I want to see patterns without extra work.",
            },
            {
              title: "Track eating habits",
              body: "Record meals with simple labels to connect energy, cravings, and spending.",
            },
            {
              title: "Turn data into routines",
              body: "Weekly insights explain what to keep, stop, and improve so habits stick.",
            },
          ].map((item) => (
            <GlassCard key={item.title} tone="aurora" className="space-y-3">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-6 text-slate-200/80">{item.body}</p>
            </GlassCard>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard tone="cosmic" className="space-y-4">
            <h2 className="text-2xl font-semibold">How Spendwise works</h2>
            <p className="text-sm leading-7 text-slate-200/80">
              Spendwise is a personal routine: track, reflect, and reset. I want
              the app to feel calm and private so it supports behavior change.
            </p>
            <div className="space-y-3 text-sm text-slate-200/80">
              <div className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-pink-300" />
                <p>Daily check-ins for money and meals in under 2 minutes.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-pink-300" />
                <p>Weekly digest that explains what happened and why.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-pink-300" />
                <p>Monthly targets with realistic budgets and meal goals.</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard tone="midnight" intensity="strong" className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
              Stack choice
            </p>
            <h3 className="text-xl font-semibold">Is Next.js the best stack?</h3>
            <p className="text-sm leading-7 text-slate-200/80">
              I chose Next.js because it is fast to build with, easy to deploy,
              and flexible for web plus mobile-friendly layouts. If the app
              grows, I can add a mobile client later.
            </p>
            <button className="rounded-full border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-300">
              Join the beta list
            </button>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
