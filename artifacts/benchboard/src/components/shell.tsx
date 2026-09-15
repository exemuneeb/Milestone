import { Activity, BrainCircuit, BriefcaseBusiness, ChevronRight, LayoutDashboard, Sparkles, UsersRound } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useClerk, useUser } from '@clerk/react';
import { useHealthCheck } from '@workspace/api-client-react';
import type { ReactNode } from 'react';

type ShellProps = { children: ReactNode };

export function Shell({ children }: ShellProps) {
  const [location] = useLocation();
  const health = useHealthCheck();
  const { signOut } = useClerk();
  const { user } = useUser();
  const isConsultant = location === '/consultant' || location === '/availability';
  const isClient = location === '/client' || location === '/match';

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[246px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 px-7 pb-8 pt-8">
          <div className="grid size-9 place-items-center rounded-[11px] bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <Activity size={19} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-[20px] font-bold tracking-[-0.04em]">BenchBoard</div>
            <div className="font-mono-ui mt-0.5 text-[9px] uppercase tracking-[0.18em] text-sidebar-foreground/50">Bench intelligence</div>
          </div>
        </div>
        <div className="px-4">
          <div className="mb-3 px-3 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/45">Workspace</div>
          <nav className="space-y-1">
            <Link href="/consultant" data-testid="link-consultant-portal" className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isConsultant ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}>
              <BriefcaseBusiness size={17} />
              <span className="font-medium">Consultant portal</span>
              <ChevronRight size={14} className={`ml-auto transition-transform ${isConsultant ? 'translate-x-0 opacity-80' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'}`} />
            </Link>
            <Link href="/client" data-testid="link-client-portal" className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isClient ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}>
              <UsersRound size={17} />
              <span className="font-medium">Client portal</span>
              <ChevronRight size={14} className={`ml-auto transition-transform ${isClient ? 'translate-x-0 opacity-80' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'}`} />
            </Link>
            <Link href="/availability" data-testid="link-availability" className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${location === '/availability' ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}>
              <LayoutDashboard size={17} />
              <span className="font-medium">Availability</span>
              <ChevronRight size={14} className={`ml-auto transition-transform ${location === '/availability' ? 'translate-x-0 opacity-80' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'}`} />
            </Link>
            <Link href="/match" data-testid="link-match" className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${location === '/match' ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}>
              <BrainCircuit size={17} />
              <span className="font-medium">AI search</span>
              <ChevronRight size={14} className={`ml-auto transition-transform ${location === '/match' ? 'translate-x-0 opacity-80' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'}`} />
            </Link>
          </nav>
        </div>
        <div className="mt-auto px-5 pb-6">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`size-1.5 rounded-full ${health.isError ? 'bg-destructive' : 'bg-sidebar-primary animate-pulse-soft'}`} />
              {health.isError ? 'API needs attention' : 'Systems operational'}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-sidebar-foreground/50">Roster data is synced for this workspace.</p>
          </div>
          <div className="mt-5 flex items-center justify-between px-1 text-[11px] text-sidebar-foreground/40">
            <span>Northstar Staffing</span>
            <Sparkles size={13} />
          </div>
        </div>
      </aside>

      <div className="lg:pl-[246px]">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Activity size={16} /></div>
            <span className="font-display text-lg font-bold tracking-[-0.04em]">BenchBoard</span>
          </div>
          <div className="hidden text-xs text-muted-foreground lg:block">Tuesday, October 15, 2024 <span className="mx-2 text-border">/</span> Roster pulse</div>
          <div className="flex items-center gap-2">
            <Link href="/consultant" data-testid="mobile-link-consultant" className={`rounded-md px-2.5 py-1.5 text-xs font-semibold lg:hidden ${isConsultant ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}>Consultant</Link>
            <Link href="/client" data-testid="mobile-link-client" className={`rounded-md px-2.5 py-1.5 text-xs font-semibold lg:hidden ${isClient ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}>Client</Link>
            <button type="button" onClick={() => signOut({ redirectUrl: '/' })} className="ml-1 grid size-8 place-items-center rounded-full bg-secondary font-display text-xs font-bold text-secondary-foreground" title={`Sign out ${user?.fullName ?? ''}`}>{(user?.firstName?.[0] ?? 'B') + (user?.lastName?.[0] ?? '')}</button>
          </div>
        </header>
        <main className="mx-auto max-w-[1480px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">{children}</main>
      </div>
    </div>
  );
}