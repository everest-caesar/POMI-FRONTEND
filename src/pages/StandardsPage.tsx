import { Link } from 'react-router-dom'

const rules = [
  {
    title: 'Respectful conduct',
    body: 'No harassment, bullying, hate speech, or discrimination. Posts and replies should stay on-topic and constructive.',
  },
  {
    title: 'Authentic profiles',
    body: 'Use a real name or consistent handle. Impersonation or fake identities are not allowed.',
  },
  {
    title: 'Safe commerce',
    body: 'Listings must be accurate. No illegal items, weapons, or fraudulent offers. Meet in public and use trusted payment methods.',
  },
  {
    title: 'Trusted reviews',
    body: 'Only review businesses or sellers after a confirmed transaction or visit. Keep feedback factual and fair.',
  },
  {
    title: 'Zero tolerance content',
    body: 'No explicit content, violent threats, or misinformation. Report violations—moderators act within 48 hours.',
  },
]

export default function StandardsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Pomi</p>
              <p className="text-sm font-semibold text-white">Back to home</p>
            </div>
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Resources</p>
          <h1 className="text-3xl font-bold text-white">Community standards</h1>
          <p className="text-slate-400">Principles that keep forums, marketplace, and events safe for the Habesha community.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((rule) => (
            <div key={rule.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm font-semibold text-emerald-200">{rule.title}</p>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">{rule.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-3 text-sm text-slate-200">
          <p className="font-semibold text-white">Enforcement</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Reports are reviewed within 48 hours.</li>
            <li>Content may be removed; repeat offenders can be suspended.</li>
            <li>Appeals: email support@pomi.community with context and screenshots.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
