import { Link } from 'react-router-dom'

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-white">Privacy & safety</h1>
          <p className="text-slate-400">How Pomi protects your data and helps you stay safe while connecting with the community.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <p className="text-sm font-semibold text-emerald-200">Data we collect</p>
            <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
              <li>Email for login and verification codes</li>
              <li>Profile basics you choose to share (name, avatar)</li>
              <li>Messages and listings for safety reviews when reported</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <p className="text-sm font-semibold text-emerald-200">How we protect it</p>
            <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
              <li>Encrypted transport (HTTPS) for all traffic</li>
              <li>Scoped access for moderators reviewing reports</li>
              <li>Data removal upon request: support@pomi.community</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-3 text-sm text-slate-200">
          <p className="font-semibold text-white">Your safety toolkit</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use in-app messaging until you meet or close a deal.</li>
            <li>Report spam, harassment, or suspicious content via the 3-dot menu.</li>
            <li>Meet in public places and verify payment details before sending money.</li>
            <li>For urgent safety issues, contact local authorities first, then report in Pomi.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
