import { Link } from 'react-router-dom'

const steps = [
  {
    title: 'Create your profile',
    detail: 'Add a display name and a short intro so neighbours know you are real. Verified email is required to message or post.',
  },
  {
    title: 'Explore the marketplace',
    detail: 'Browse listings, favorite items to your wishlist, and message sellers. Meet in public places and confirm details before paying.',
  },
  {
    title: 'Join events and forums',
    detail: 'RSVP to cultural events and add your voice in forums. Keep it respectful and on-topic to help moderators keep things safe.',
  },
  {
    title: 'Support local businesses',
    detail: 'Use the directory to find Habesha-owned services. After a confirmed visit, leave a review to boost community trust.',
  },
]

const tips = [
  'Keep conversations on Pomi until you meet or complete a transaction.',
  'Ask for clear photos and details before committing to buy or sell.',
  'Use the report options if anything feels off—spam, harassment, or unsafe content.',
  'Respect cultural spaces: forums and events are moderated for safety and inclusion.',
]

export default function GuidesPage() {
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
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-10 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Resources</p>
          <h1 className="text-3xl font-bold text-white">Guides for newcomers</h1>
          <p className="text-slate-400">Your first steps on Pomi: messaging, marketplace, events, and community etiquette.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-sm font-semibold text-emerald-200">{step.title}</p>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Community basics</h2>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-200">
              <p className="font-semibold text-emerald-200 mb-1">Need a human?</p>
              <p>Message the Admin account in your inbox or email support@pomi.community for onboarding help.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
