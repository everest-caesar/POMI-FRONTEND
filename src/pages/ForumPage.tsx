import { Link } from 'react-router-dom'

interface ForumPost {
  id: string
  community: string
  author: string
  timeAgo: string
  votes: string
  title: string
  excerpt?: string
  image?: string
  comments: number
}

const SAMPLE_POSTS: ForumPost[] = [
  {
    id: 'thread-1',
    community: 'r/OttawaHabesha',
    author: 'u/selamDesigns',
    timeAgo: '5h',
    votes: '1.2k',
    title: 'Recap: Sunday coffee ceremony & networking wins',
    image:
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e63?auto=format&fit=crop&w=900&q=80',
    comments: 256,
  },
  {
    id: 'thread-2',
    community: 'r/PomiMarketplace',
    author: 'u/danTech',
    timeAgo: '2h',
    votes: '847',
    title: 'Looking for the best accountant for small businesses',
    excerpt:
      'Trying to wrap up year-end and need someone who understands Ethiopian-owned businesses and CRA expectations. Any trusted referrals?',
    comments: 102,
  },
  {
    id: 'thread-3',
    community: 'r/NewcomerWins',
    author: 'u/munaMoves',
    timeAgo: '1d',
    votes: '612',
    title: 'Secured my first Ottawa apartment thanks to the Pomi listings!',
    excerpt:
      'Sharing tips on the documents I prepared, the questions I asked, and how the landlord vetting felt. Hopefully it helps the next person in line.',
    comments: 88,
  },
]

const TRENDING_COMMUNITIES = [
  { name: 'r/PomiMarketplace', members: '5.6k' },
  { name: 'r/OttawaHabesha', members: '8.1k' },
  { name: 'r/NewcomerWins', members: '3.4k' },
  { name: 'r/PomiMentors', members: '2.7k' },
]

const SITE_RULES = [
  'Be respectful—assume good intent, disagree with care.',
  'No spam, scams, or unsolicited promotions.',
  'Tag your posts so neighbours can find the right help fast.',
  'Flag anything that breaks community guidelines for moderators.',
]

function formatVotes(votes: string) {
  return `${votes}`
}

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
          >
            ← Home
          </Link>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Pomi Forums
            </p>
            <h1 className="text-xl font-black text-white">Threaded discussions for every neighbour</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-4">
          {SAMPLE_POSTS.map((post) => (
            <article
              key={post.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1"
            >
              <header className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                <span className="font-semibold text-white">{post.community}</span>
                <span>• Posted by {post.author}</span>
                <span>• {post.timeAgo}</span>
              </header>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr),auto] md:items-start">
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-white">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-white/70">{post.excerpt}</p>}
                  {!post.excerpt && post.image && (
                    <div
                      className="aspect-video w-full overflow-hidden rounded-3xl border border-white/10"
                      style={{
                        backgroundImage: `url(${post.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  )}
                </div>
                <aside className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-semibold text-white/70">
                  <span className="inline-flex items-center gap-1 text-white">
                    ⬆️ {formatVotes(post.votes)}
                  </span>
                  <span className="inline-flex items-center gap-1">💬 {post.comments} comments</span>
                  <span className="inline-flex items-center gap-1">🔖 Save thread</span>
                </aside>
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
              Trending communities
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {TRENDING_COMMUNITIES.map((community, index) => (
                <li key={community.name} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white/50">{index + 1}</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{community.name}</span>
                    <span>{community.members} members</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
            <button className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5">
              Create post
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-lg shadow-slate-900/40 backdrop-blur">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Forum rules
            </h3>
            <ul className="mt-3 space-y-2">
              {SITE_RULES.map((rule) => (
                <li key={rule} className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  )
}
