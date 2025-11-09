import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
const SAMPLE_POSTS = [
    {
        id: 'thread-1',
        community: 'r/OttawaHabesha',
        author: 'u/selamDesigns',
        timeAgo: '5h',
        votes: '1.2k',
        title: 'Recap: Sunday coffee ceremony & networking wins',
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e63?auto=format&fit=crop&w=900&q=80',
        comments: 256,
    },
    {
        id: 'thread-2',
        community: 'r/PomiMarketplace',
        author: 'u/danTech',
        timeAgo: '2h',
        votes: '847',
        title: 'Looking for the best accountant for small businesses',
        excerpt: 'Trying to wrap up year-end and need someone who understands Ethiopian-owned businesses and CRA expectations. Any trusted referrals?',
        comments: 102,
    },
    {
        id: 'thread-3',
        community: 'r/NewcomerWins',
        author: 'u/munaMoves',
        timeAgo: '1d',
        votes: '612',
        title: 'Secured my first Ottawa apartment thanks to the Pomi listings!',
        excerpt: 'Sharing tips on the documents I prepared, the questions I asked, and how the landlord vetting felt. Hopefully it helps the next person in line.',
        comments: 88,
    },
];
const TRENDING_COMMUNITIES = [
    { name: 'r/PomiMarketplace', members: '5.6k' },
    { name: 'r/OttawaHabesha', members: '8.1k' },
    { name: 'r/NewcomerWins', members: '3.4k' },
    { name: 'r/PomiMentors', members: '2.7k' },
];
const SITE_RULES = [
    'Be respectful—assume good intent, disagree with care.',
    'No spam, scams, or unsolicited promotions.',
    'Tag your posts so neighbours can find the right help fast.',
    'Flag anything that breaks community guidelines for moderators.',
];
function formatVotes(votes) {
    return `${votes}`;
}
export default function ForumPage() {
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: [_jsx("header", { className: "border-b border-white/10 bg-slate-950/80 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6", children: [_jsx(Link, { to: "/", className: "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white", children: "\u2190 Home" }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/60", children: "Pomi Forums" }), _jsx("h1", { className: "text-xl font-black text-white", children: "Threaded discussions for every neighbour" })] })] }) }), _jsxs("main", { className: "mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[2fr,1fr]", children: [_jsx("section", { className: "space-y-4", children: SAMPLE_POSTS.map((post) => (_jsxs("article", { className: "flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1", children: [_jsxs("header", { className: "flex flex-wrap items-center gap-2 text-xs text-white/60", children: [_jsx("span", { className: "font-semibold text-white", children: post.community }), _jsxs("span", { children: ["\u2022 Posted by ", post.author] }), _jsxs("span", { children: ["\u2022 ", post.timeAgo] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-[minmax(0,1fr),auto] md:items-start", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: post.title }), post.excerpt && _jsx("p", { className: "text-sm text-white/70", children: post.excerpt }), !post.excerpt && post.image && (_jsx("div", { className: "aspect-video w-full overflow-hidden rounded-3xl border border-white/10", style: {
                                                        backgroundImage: `url(${post.image})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                    } }))] }), _jsxs("aside", { className: "flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-semibold text-white/70", children: [_jsxs("span", { className: "inline-flex items-center gap-1 text-white", children: ["\u2B06\uFE0F ", formatVotes(post.votes)] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: ["\uD83D\uDCAC ", post.comments, " comments"] }), _jsx("span", { className: "inline-flex items-center gap-1", children: "\uD83D\uDD16 Save thread" })] })] })] }, post.id))) }), _jsxs("aside", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsx("h3", { className: "text-sm font-semibold uppercase tracking-[0.3em] text-white/50", children: "Trending communities" }), _jsx("ul", { className: "mt-4 space-y-3 text-sm text-white/70", children: TRENDING_COMMUNITIES.map((community, index) => (_jsxs("li", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-lg font-bold text-white/50", children: index + 1 }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-semibold text-white", children: community.name }), _jsxs("span", { children: [community.members, " members"] })] })] }, community.name))) })] }), _jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur", children: _jsx("button", { className: "w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5", children: "Create post" }) }), _jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsx("h3", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Forum rules" }), _jsx("ul", { className: "mt-3 space-y-2", children: SITE_RULES.map((rule) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "mt-0.5", children: "\u2022" }), _jsx("span", { children: rule })] }, rule))) })] })] })] })] }));
}
//# sourceMappingURL=ForumPage.js.map