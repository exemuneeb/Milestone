import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  Command,
  Layers3,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  UsersRound,
  X,
} from 'lucide-react';

type Audience = 'consultant' | 'client';

const consultantServices = [
  'Product strategy',
  'Data & analytics',
  'Service design',
  'Change leadership',
];

const clientBriefs = [
  {
    title: 'Product discovery for a regulated launch',
    meta: 'Strategy · 8–12 weeks',
    match: '94% match',
    tone: 'bg-[#e7f1e8] text-[#246454]',
  },
  {
    title: 'Untangle our operating model',
    meta: 'Org design · 6 weeks',
    match: '89% match',
    tone: 'bg-[#f9eadb] text-[#a34f2d]',
  },
  {
    title: 'A sharper story for our next round',
    meta: 'Positioning · 4 weeks',
    match: '86% match',
    tone: 'bg-[#e8edf1] text-[#38566a]',
  },
];

function Wordmark() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3"
      data-testid="link-brand"
      aria-label="BenchBoard home"
    >
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-[10px] bg-[#17483e] text-[#f9f7f0] shadow-[0_4px_0_#d5aa83] transition-transform duration-300 group-hover:-translate-y-0.5">
        <span className="absolute -right-1 -top-1 size-5 rounded-full border border-[#f6c09b]/70" />
        <span className="absolute bottom-1 left-1.5 h-2.5 w-2.5 rounded-full bg-[#f6c09b]" />
        <span className="font-display text-[15px] font-bold tracking-[-0.08em]">B</span>
      </span>
      <span className="font-display text-[18px] font-bold tracking-[-0.045em] text-[#183e37]">
        benchboard
      </span>
    </Link>
  );
}

function RoleToggle({
  audience,
  onChange,
}: {
  audience: Audience;
  onChange: (audience: Audience) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-[#d7d8ce] bg-[#f4f2ea] p-1" role="tablist" aria-label="Choose a BenchBoard path">
      <button
        type="button"
        role="tab"
        aria-selected={audience === 'consultant'}
        onClick={() => onChange('consultant')}
        className={`rounded-full px-4 py-2 font-mono-ui text-[10px] font-medium uppercase tracking-[0.12em] transition-all duration-300 ${
          audience === 'consultant'
            ? 'bg-[#17483e] text-[#f9f7f0] shadow-[0_2px_0_rgba(23,72,62,0.18)]'
            : 'text-[#68726c] hover:text-[#183e37]'
        }`}
        data-testid="button-role-consultant"
      >
        I&apos;m a consultant
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={audience === 'client'}
        onClick={() => onChange('client')}
        className={`rounded-full px-4 py-2 font-mono-ui text-[10px] font-medium uppercase tracking-[0.12em] transition-all duration-300 ${
          audience === 'client'
            ? 'bg-[#17483e] text-[#f9f7f0] shadow-[0_2px_0_rgba(23,72,62,0.18)]'
            : 'text-[#68726c] hover:text-[#183e37]'
        }`}
        data-testid="button-role-client"
      >
        I&apos;m hiring
      </button>
    </div>
  );
}

function MatchPreview({ audience }: { audience: Audience }) {
  const isConsultant = audience === 'consultant';

  return (
    <div className="relative mx-auto w-full max-w-[650px]">
      <div className="absolute -inset-5 rounded-[34px] bg-[#efc8a8]/35 blur-2xl" />
      <div className="relative overflow-hidden rounded-[22px] border border-[#d8d5c8] bg-[#fbfaf5] shadow-[0_26px_70px_rgba(24,62,55,0.14)]">
        <div className="flex items-center justify-between border-b border-[#e4e1d6] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-[#e4f0e6] text-[#246454]">
              {isConsultant ? <BriefcaseBusiness size={14} strokeWidth={2.2} /> : <Search size={14} strokeWidth={2.2} />}
            </span>
            <span className="font-mono-ui text-[10px] font-medium uppercase tracking-[0.12em] text-[#69756e]">
              {isConsultant ? 'Your BenchBoard profile' : 'Search the bench'}
            </span>
          </div>
          <span className="font-mono-ui text-[10px] tracking-[0.1em] text-[#9aa19b]">LIVE PREVIEW</span>
        </div>

        {isConsultant ? (
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-[#f3c3a1] font-display text-lg font-semibold text-[#6a3928]">MC</div>
                <div>
                  <p className="font-display text-[17px] font-semibold tracking-[-0.04em] text-[#183e37]">Maya Chen</p>
                  <p className="mt-0.5 text-xs text-[#748078]">Product strategy · Portland, OR</p>
                </div>
              </div>
              <span className="rounded-full bg-[#e7f1e8] px-2.5 py-1 font-mono-ui text-[9px] font-medium uppercase tracking-[0.08em] text-[#246454]">Available</span>
            </div>
            <p className="mt-5 max-w-[500px] text-sm leading-6 text-[#55655e]">
              I help teams turn a stuck product decision into a clear, testable next move — without adding another layer of process.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {consultantServices.map((service) => (
                <span key={service} className="rounded-full border border-[#d9ddd5] bg-[#f4f5ef] px-3 py-1.5 text-[11px] text-[#52665e]">
                  {service}
                </span>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 border-t border-[#e6e3d9] pt-4">
              <div>
                <p className="font-display text-lg font-semibold text-[#183e37]">11 yrs</p>
                <p className="mt-0.5 font-mono-ui text-[9px] uppercase tracking-[0.1em] text-[#8a948d]">experience</p>
              </div>
              <div className="border-l border-[#e6e3d9] pl-4">
                <p className="font-display text-lg font-semibold text-[#183e37]">18</p>
                <p className="mt-0.5 font-mono-ui text-[9px] uppercase tracking-[0.1em] text-[#8a948d]">engagements</p>
              </div>
              <div className="border-l border-[#e6e3d9] pl-4">
                <p className="font-display text-lg font-semibold text-[#183e37]">4.9/5</p>
                <p className="mt-0.5 font-mono-ui text-[9px] uppercase tracking-[0.1em] text-[#8a948d]">client rating</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 rounded-xl border border-[#dedfd6] bg-[#f5f5ef] px-3.5 py-3 text-sm text-[#4e625a]">
              <Search size={15} className="shrink-0 text-[#8b968d]" />
              <span>Someone to steady our launch strategy...</span>
              <Command size={13} className="ml-auto text-[#9ca59f]" />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <p className="font-mono-ui text-[10px] font-medium uppercase tracking-[0.12em] text-[#87928b]">Best-fit consultants</p>
              <span className="flex items-center gap-1.5 text-[11px] text-[#829087]">
                <Sparkles size={12} className="text-[#c8744d]" /> AI-ranked
              </span>
            </div>
            <div className="mt-3 space-y-2.5">
              {clientBriefs.map((brief, index) => (
                <div
                  key={brief.title}
                  className="group flex items-center gap-3 rounded-xl border border-[#e4e2d8] bg-[#fffefa] px-3.5 py-3 transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#c3d5c8]"
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold ${index === 0 ? 'bg-[#f3c3a1] text-[#6a3928]' : index === 1 ? 'bg-[#d8e7d8] text-[#2c624f]' : 'bg-[#d9e3ea] text-[#38566a]'}`}>
                    {['JR', 'AK', 'TS'][index]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#294a42]">{brief.title}</p>
                    <p className="mt-0.5 text-[10px] text-[#88938c]">{brief.meta}</p>
                  </div>
                  <span className={`hidden rounded-full px-2 py-1 font-mono-ui text-[9px] font-medium uppercase tracking-[0.06em] sm:block ${brief.tone}`}>
                    {brief.match}
                  </span>
                  <ArrowUpRight size={14} className="text-[#afbbb2] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between bg-[#f0eee5] px-5 py-3 sm:px-6">
          <span className="flex items-center gap-2 text-[10px] text-[#738078]">
            <span className="size-1.5 rounded-full bg-[#5b9a77]" />
            Built for thoughtful work
          </span>
          <span className="font-mono-ui text-[9px] uppercase tracking-[0.1em] text-[#8f9992]">benchboard.co</span>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  index,
  icon,
  title,
  children,
}: {
  index: string;
  icon: typeof Search;
  title: string;
  children: string;
}) {
  const Icon = icon;
  return (
    <div className="relative border-t border-[#d7d8ce] pt-5">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-9 place-items-center rounded-xl bg-[#e7f1e8] text-[#246454]">
          <Icon size={16} strokeWidth={1.8} />
        </span>
        <span className="font-mono-ui text-[10px] tracking-[0.14em] text-[#a0a7a0]">{index}</span>
      </div>
      <h3 className="mt-6 font-display text-[21px] font-semibold tracking-[-0.045em] text-[#183e37]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#69766e]">{children}</p>
    </div>
  );
}

export default function Landing() {
  const [audience, setAudience] = useState<Audience>('client');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    void fetch('/api/demo-accounts', { credentials: 'include' });
  }, []);

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#f7f6ef] text-[#183e37]">
      <style>{`
        @keyframes bb-float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes bb-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(7px, -5px, 0); }
        }
        .bb-float { animation: bb-float 7s ease-in-out infinite; }
        .bb-drift { animation: bb-drift 8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .bb-float, .bb-drift { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[660px] overflow-hidden">
        <div className="absolute -left-20 top-32 size-64 rounded-full bg-[#dceadd]/55 blur-3xl" />
        <div className="absolute right-[-9rem] top-10 size-[28rem] rounded-full bg-[#f2d4bd]/55 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[560px] opacity-[0.16]" style={{ backgroundImage: 'linear-gradient(#183e37 1px, transparent 1px), linear-gradient(90deg, #183e37 1px, transparent 1px)', backgroundSize: '32px 32px', maskImage: 'linear-gradient(to bottom, black, transparent 82%)' }} />
      </div>

      <header className="relative z-20 mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Wordmark />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          <a href="#how-it-works" className="text-[13px] font-medium text-[#66736b] transition-colors hover:text-[#183e37]" data-testid="link-how-it-works">How it works</a>
          <a href="#for-consultants" className="text-[13px] font-medium text-[#66736b] transition-colors hover:text-[#183e37]" data-testid="link-for-consultants">For consultants</a>
          <a href="#for-clients" className="text-[13px] font-medium text-[#66736b] transition-colors hover:text-[#183e37]" data-testid="link-for-clients">For clients</a>
        </nav>
        <div className="hidden items-center gap-2.5 md:flex">
          <Link href="/sign-in" className="rounded-full px-4 py-2.5 text-[13px] font-semibold text-[#3f5a50] transition-colors hover:bg-[#e9e9df]" data-testid="link-sign-in">Sign in</Link>
          <Link href="/sign-up?role=client" className="inline-flex items-center gap-2 rounded-full bg-[#17483e] px-4 py-2.5 text-[13px] font-semibold text-[#f9f7f0] shadow-[0_3px_0_#b6c9b5] transition-transform hover:-translate-y-0.5" data-testid="link-header-get-started">
            Get started <ArrowUpRight size={14} />
          </Link>
        </div>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-[#d7d8ce] text-[#416157] md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          data-testid="button-mobile-menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {menuOpen && (
        <div className="relative z-20 mx-5 rounded-2xl border border-[#d7d8ce] bg-[#fbfaf5] p-4 shadow-lg md:hidden" data-testid="menu-mobile-navigation">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-[#3f5a50] hover:bg-[#f0eee5]" data-testid="link-mobile-how-it-works">How it works</a>
            <a href="#for-consultants" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-[#3f5a50] hover:bg-[#f0eee5]" data-testid="link-mobile-consultants">For consultants</a>
            <a href="#for-clients" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-[#3f5a50] hover:bg-[#f0eee5]" data-testid="link-mobile-clients">For clients</a>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#e5e3d9] pt-3">
              <Link href="/sign-in" className="rounded-xl border border-[#d7d8ce] px-3 py-3 text-center text-sm font-semibold text-[#3f5a50]" data-testid="link-mobile-sign-in">Sign in</Link>
              <Link href="/sign-up?role=client" className="rounded-xl bg-[#17483e] px-3 py-3 text-center text-sm font-semibold text-[#f9f7f0]" data-testid="link-mobile-get-started">Get started</Link>
            </div>
          </nav>
        </div>
      )}

      <section className="relative z-10 mx-auto grid max-w-[1240px] items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[0.93fr_1.07fr] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-28">
        <div className="animate-rise">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d7d8ce] bg-[#fbfaf5]/75 px-3 py-2 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-[#d4754d]" />
            <span className="font-mono-ui text-[10px] font-medium uppercase tracking-[0.13em] text-[#63736a]">The human side of smart matching</span>
          </div>
          <h1 className="max-w-[650px] font-display text-[clamp(3.35rem,7vw,6.8rem)] font-semibold leading-[0.93] tracking-[-0.075em] text-[#17483e]">
            Good work<br />
            <span className="text-[#d16f48]">finds its way.</span>
          </h1>
          <p className="mt-7 max-w-[520px] text-[17px] leading-7 text-[#607068] sm:text-[18px]">
            BenchBoard brings independent consultants and ambitious teams together around the work itself — not a polished pitch deck.
          </p>
          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link href="/sign-up?role=client" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#17483e] px-6 text-sm font-semibold text-[#f9f7f0] shadow-[0_4px_0_#b6c9b5] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_0_#b6c9b5]" data-testid="link-hero-find-consultant">
              Find a consultant <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/sign-up?role=consultant" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#c9d0c8] bg-[#fbfaf5]/70 px-5 text-sm font-semibold text-[#31584d] transition-colors hover:border-[#17483e] hover:bg-[#eef1e7]" data-testid="link-hero-join-bench">
              Join the bench <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="grid size-7 place-items-center rounded-full border-2 border-[#f7f6ef] bg-[#f3c3a1] font-mono-ui text-[8px] font-medium text-[#6a3928]">MC</span>
              <span className="grid size-7 place-items-center rounded-full border-2 border-[#f7f6ef] bg-[#d8e7d8] font-mono-ui text-[8px] font-medium text-[#2c624f]">AK</span>
              <span className="grid size-7 place-items-center rounded-full border-2 border-[#f7f6ef] bg-[#d9e3ea] font-mono-ui text-[8px] font-medium text-[#38566a]">TS</span>
              <span className="grid size-7 place-items-center rounded-full border-2 border-[#f7f6ef] bg-[#ece2c8] font-mono-ui text-[8px] font-medium text-[#786343]">+8</span>
            </div>
            <p className="text-xs leading-5 text-[#77837b]">
              A considered network of<br className="sm:hidden" /> independent specialists.
            </p>
          </div>
        </div>

        <div className="animate-rise stagger-2">
          <div className="mb-5 flex justify-end">
            <RoleToggle audience={audience} onChange={setAudience} />
          </div>
          <MatchPreview audience={audience} />
          <p className="mt-5 text-center font-mono-ui text-[10px] uppercase tracking-[0.13em] text-[#89948b]">
            {audience === 'client' ? 'Describe the work. Meet the right mind.' : 'Make the work you want easier to find.'}
          </p>
        </div>
      </section>

      <div className="relative z-10 border-y border-[#dfe0d6] bg-[#f0eee5]/70">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-9 gap-y-3 px-5 py-5 sm:justify-between sm:px-8 lg:px-10">
          <span className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-[#8a948d]">A better brief starts here</span>
          <span className="hidden h-4 w-px bg-[#d4d6cb] sm:block" />
          <span className="text-[12px] font-medium text-[#68776e]">Strategy &amp; transformation</span>
          <span className="text-[12px] font-medium text-[#68776e]">Product &amp; design</span>
          <span className="text-[12px] font-medium text-[#68776e]">Data &amp; technology</span>
          <span className="text-[12px] font-medium text-[#68776e]">People &amp; operations</span>
        </div>
      </div>

      <section id="how-it-works" className="relative z-10 mx-auto max-w-[1240px] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <span className="font-mono-ui text-[10px] font-medium uppercase tracking-[0.15em] text-[#c16d49]">Less noise, better fit</span>
            <h2 className="mt-5 max-w-[430px] font-display text-[clamp(2.55rem,5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.07em] text-[#17483e]">
              The right brief changes everything.
            </h2>
            <p className="mt-6 max-w-[380px] text-[16px] leading-7 text-[#6d7971]">
              Search by the shape of the challenge. Share what you actually need. Let experience, context, and timing do the talking.
            </p>
            <Link href="/sign-up?role=client" className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#246454]" data-testid="link-how-it-works-cta">
              Start with your brief <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
            <StepCard index="01" icon={Search} title="Say what is stuck">
              Put the real problem on the table. BenchBoard helps shape your words into a brief that experienced people can respond to.
            </StepCard>
            <StepCard index="02" icon={Sparkles} title="Find the useful signal">
              AI search gets you close, then context gets you there. Explore a shortlist of people whose track record fits the work.
            </StepCard>
            <StepCard index="03" icon={UsersRound} title="Meet before you match">
              Compare working styles, availability, and the details that make collaboration click before you commit to a project.
            </StepCard>
            <StepCard index="04" icon={ShieldCheck} title="Keep it human">
              BenchBoard gives the process structure without taking the relationship away. Clear expectations, fewer surprises.
            </StepCard>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-[#17483e] text-[#f7f6ef]">
        <div className="mx-auto grid max-w-[1240px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-24 lg:px-10 lg:py-28">
          <div id="for-consultants" className="scroll-mt-8">
            <span className="font-mono-ui text-[10px] font-medium uppercase tracking-[0.15em] text-[#f3b18d]">For independent consultants</span>
            <h2 className="mt-5 max-w-[500px] font-display text-[clamp(2.6rem,5vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.07em]">
              Your best work deserves a better signal.
            </h2>
            <p className="mt-6 max-w-[450px] text-[16px] leading-7 text-[#c1d0c5]">
              Build a profile around the work you know how to do, not a list of keywords. Keep your availability current and let the right briefs come to you.
            </p>
            <Link href="/sign-up?role=consultant" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#f3c3a1] px-5 py-3 text-sm font-semibold text-[#5f392c] transition-transform hover:-translate-y-0.5" data-testid="link-consultant-sign-up">
              Create your consultant profile <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="relative min-h-[310px]">
            <div className="absolute right-0 top-0 w-full max-w-[480px] rotate-2 rounded-[20px] border border-[#49736b] bg-[#20584e] p-5 shadow-[14px_18px_0_rgba(12,49,42,0.28)] sm:p-6">
              <div className="flex items-center justify-between border-b border-[#4a776e] pb-4">
                <span className="font-mono-ui text-[10px] uppercase tracking-[0.12em] text-[#b6cec1]">What you bring</span>
                <SlidersHorizontal size={15} className="text-[#9bb8aa]" />
              </div>
              <div className="mt-5 space-y-4">
                {['Can make a messy decision legible', 'Knows when research is enough', 'Leaves teams more capable'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="grid size-6 place-items-center rounded-full bg-[#3b7667] text-[#f3c3a1]"><Check size={13} strokeWidth={2.5} /></span>
                    <span className="text-sm text-[#e0e9df]">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex items-center gap-3 border-t border-[#4a776e] pt-4">
                <span className="grid size-10 place-items-center rounded-xl bg-[#f3c3a1] font-display text-sm font-semibold text-[#6a3928]">MC</span>
                <div>
                  <p className="text-sm font-semibold text-[#f7f6ef]">Maya Chen</p>
                  <p className="text-[11px] text-[#a8c1b4]">Independent product strategist</p>
                </div>
                <span className="ml-auto rounded-full bg-[#d9e8d9] px-2.5 py-1 font-mono-ui text-[9px] font-medium uppercase tracking-[0.07em] text-[#246454]">Open to work</span>
              </div>
            </div>
            <div className="bb-float absolute bottom-0 left-0 w-[230px] rounded-[17px] border border-[#466f67] bg-[#123f37] p-4 shadow-[0_16px_40px_rgba(9,35,29,0.28)] sm:left-5">
              <div className="flex items-center gap-2 text-[#f3b18d]">
                <Clock3 size={14} />
                <span className="font-mono-ui text-[9px] uppercase tracking-[0.12em]">Availability</span>
              </div>
              <p className="mt-4 font-display text-2xl font-semibold tracking-[-0.05em] text-[#f7f6ef]">2 weeks</p>
              <p className="mt-1 text-[11px] text-[#a8c1b4]">until first conversations</p>
            </div>
          </div>
        </div>
      </section>

      <section id="for-clients" className="relative z-10 mx-auto max-w-[1240px] scroll-mt-8 px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
          <div className="order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-[23px] border border-[#dddcd2] bg-[#f0eee5] p-5 sm:p-7">
              <div className="absolute -right-12 -top-14 size-40 rounded-full border-[20px] border-[#f3c3a1]/50" />
              <div className="absolute -bottom-16 -left-10 size-36 rounded-full border-[17px] border-[#cfe0d2]/70" />
              <div className="relative rounded-[17px] border border-[#dddcd2] bg-[#fbfaf5] p-5 shadow-[0_15px_40px_rgba(24,62,55,0.08)] sm:p-6">
                <div className="flex items-center gap-2 text-[#7c8980]">
                  <Layers3 size={15} />
                  <span className="font-mono-ui text-[10px] uppercase tracking-[0.13em]">Brief builder</span>
                  <span className="ml-auto font-mono-ui text-[9px] text-[#a2aaa2]">STEP 1 / 3</span>
                </div>
                <h3 className="mt-7 max-w-[440px] font-display text-2xl font-semibold tracking-[-0.05em] text-[#183e37] sm:text-3xl">What kind of help would move this forward?</h3>
                <div className="mt-6 space-y-2.5">
                  {['We need a clear product direction', 'We are changing how the team works', 'We have the data, not the answer'].map((item, index) => (
                    <div key={item} className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-sm ${index === 0 ? 'border-[#8fb29a] bg-[#e7f1e8] text-[#246454]' : 'border-[#e1e0d6] bg-[#fffefa] text-[#66756c]'}`}>
                      <span>{item}</span>
                      {index === 0 ? <Check size={15} /> : <ArrowRight size={14} className="text-[#aeb9b0]" />}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[#e6e3d9] pt-5">
                  <span className="text-xs text-[#8a958d]">No job description required.</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#17483e] px-4 py-2 text-xs font-semibold text-[#f9f7f0]">Continue <ArrowRight size={13} /></span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="font-mono-ui text-[10px] font-medium uppercase tracking-[0.15em] text-[#c16d49]">For teams doing important work</span>
            <h2 className="mt-5 max-w-[500px] font-display text-[clamp(2.6rem,5vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.07em] text-[#17483e]">
              Start with the problem, not the title.
            </h2>
            <p className="mt-6 max-w-[450px] text-[16px] leading-7 text-[#6d7971]">
              Turn the thing your team keeps circling into a focused brief. Search for the perspective you are missing, then meet people who have been there before.
            </p>
            <Link href="/sign-up?role=client" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#d4754d] px-5 py-3 text-sm font-semibold text-[#fff7ed] transition-transform hover:-translate-y-0.5" data-testid="link-client-sign-up">
              Bring a brief to life <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden border-y border-[#dfe0d6] bg-[#eee9dc]">
        <div className="pointer-events-none absolute right-12 top-1/2 size-44 -translate-y-1/2 rounded-full border border-[#d4754d]/25 sm:right-24" />
        <div className="pointer-events-none absolute right-20 top-1/2 size-28 -translate-y-1/2 rounded-full border border-[#d4754d]/25 sm:right-32" />
        <div className="mx-auto flex max-w-[1240px] flex-col gap-7 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10 lg:py-20">
          <div>
            <span className="font-mono-ui text-[10px] font-medium uppercase tracking-[0.15em] text-[#bd6847]">A smaller, sharper network</span>
            <p className="mt-4 max-w-[680px] font-display text-[clamp(1.8rem,3.5vw,3.15rem)] font-semibold leading-[1.03] tracking-[-0.06em] text-[#17483e]">
              “The best match is not always the biggest name. It is the person who understands the moment you are in.”
            </p>
          </div>
          <div className="bb-drift shrink-0">
            <div className="rounded-2xl border border-[#d5cfbf] bg-[#f9f7f0]/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[#d8e7d8] font-display text-sm font-semibold text-[#2c624f]">JR</div>
                <div>
                  <p className="text-sm font-semibold text-[#294a42]">Jordan Rivera</p>
                  <p className="mt-0.5 text-[11px] text-[#87928a]">Fractional operations lead</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-[#ddd9cd] pt-3 text-[11px] text-[#718077]">
                <span className="size-1.5 rounded-full bg-[#5b9a77]" /> Matched on working style
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1240px] px-5 py-24 text-center sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[760px]">
          <span className="font-mono-ui text-[10px] font-medium uppercase tracking-[0.15em] text-[#c16d49]">Make the next move a good one</span>
          <h2 className="mt-5 font-display text-[clamp(3rem,7vw,6.2rem)] font-semibold leading-[0.92] tracking-[-0.075em] text-[#17483e]">
            Meet the work<br /><span className="text-[#d4754d]">halfway.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[470px] text-[16px] leading-7 text-[#6d7971]">
            Whether you are bringing a point of view or looking for one, BenchBoard is a more considered way to get moving.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/sign-up?role=client" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#17483e] px-6 text-sm font-semibold text-[#f9f7f0] shadow-[0_4px_0_#b6c9b5] transition-transform hover:-translate-y-1" data-testid="link-final-client-sign-up">
              I have a project <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/sign-up?role=consultant" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#c9d0c8] bg-[#fbfaf5] px-5 text-sm font-semibold text-[#31584d] transition-colors hover:border-[#17483e] hover:bg-[#eef1e7]" data-testid="link-final-consultant-sign-up">
              I have a point of view <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-[#dfe0d6] bg-[#e7f1e8]">
        <div className="mx-auto grid max-w-[1240px] gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-10">
          <div>
            <span className="font-mono-ui text-[10px] font-medium uppercase tracking-[0.15em] text-[#246454]">Try BenchBoard first</span>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-[#17483e]">Demo workspaces are ready.</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#607068]">Use either account to test the consultant or client experience without creating a new profile.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/sign-in?role=consultant" className="rounded-2xl border border-[#b6cdbb] bg-[#fbfaf5] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[#246454]">Consultant demo</span>
              <span className="mt-2 block text-xs font-semibold text-[#294a42]">demo.consultant@example.com</span>
              <span className="mt-1 block font-mono-ui text-[11px] text-[#748078]">Password: BenchBoardDemo1!</span>
            </Link>
            <Link href="/sign-in?role=client" className="rounded-2xl border border-[#edc5aa] bg-[#fffaf3] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[#a34f2d]">Client demo</span>
              <span className="mt-2 block text-xs font-semibold text-[#294a42]">demo.client@example.com</span>
              <span className="mt-1 block font-mono-ui text-[11px] text-[#748078]">Password: BenchBoardDemo1!</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#dfe0d6] bg-[#f0eee5]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <Wordmark />
            <p className="mt-3 text-xs text-[#7d8980]">A considered marketplace for useful expertise.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-[#69776e]">
            <Link href="/sign-in" className="transition-colors hover:text-[#17483e]" data-testid="link-footer-sign-in">Sign in</Link>
            <Link href="/sign-up?role=consultant" className="transition-colors hover:text-[#17483e]" data-testid="link-footer-consultant-sign-up">Consultant sign up</Link>
            <Link href="/sign-up?role=client" className="transition-colors hover:text-[#17483e]" data-testid="link-footer-client-sign-up">Client sign up</Link>
            <span className="font-mono-ui text-[10px] tracking-[0.1em] text-[#a0a79f]">© 2025 BenchBoard</span>
          </div>
        </div>
      </footer>
    </main>
  );
}