import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Check, ChevronDown, CirclePlus, Clock3, Pencil, Search, Trash2, UsersRound, X } from 'lucide-react';
import { useCreateConsultant, useDeleteConsultant, useGetDashboardSummary, useListConsultants, useUpdateConsultant, getGetDashboardSummaryQueryKey, getListConsultantsQueryKey } from '@workspace/api-client-react';
import type { AvailabilityStatus, Consultant, ConsultantInput } from '@workspace/api-client-react';
import { ConsultantForm } from '@/components/consultant-form';

const statusMeta: Record<AvailabilityStatus, { label: string; color: string; dot: string }> = {
  available: { label: 'Available', color: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  deployed: { label: 'Deployed', color: 'bg-accent/15 text-foreground', dot: 'bg-accent' },
  unavailable: { label: 'Unavailable', color: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground/50' },
};

function formatDate(date?: string | null) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${date.slice(0, 10)}T12:00:00`));
}

function isEndingSoon(date?: string | null) {
  if (!date) return false;
  const days = (new Date(`${date.slice(0, 10)}T12:00:00`).getTime() - Date.now()) / 86400000;
  return days >= 0 && days <= 14;
}

function Metric({ label, value, accent, sub }: { label: string; value: number | string; accent?: string; sub?: string }) {
  return <div className="animate-rise rounded-xl border border-border bg-card p-4 shadow-[0_1px_0_hsl(var(--foreground)/.04)] sm:p-5">
    <div className="flex items-start justify-between"><span className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>{accent && <span className={`mt-0.5 size-2 rounded-full ${accent}`} />}</div>
    <div data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`} className="mt-3 font-display text-3xl font-bold tracking-[-0.06em]">{value}</div>
    {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
  </div>;
}

function RosterSkeleton() {
  return <div className="space-y-2 p-4">{[1, 2, 3, 4].map((item) => <div key={item} className="flex items-center gap-4 rounded-lg border border-border/70 p-4"><div className="size-9 animate-pulse rounded-full bg-muted" /><div className="flex-1 space-y-2"><div className="h-3 w-32 animate-pulse rounded bg-muted" /><div className="h-2.5 w-48 animate-pulse rounded bg-muted" /></div><div className="hidden h-5 w-20 animate-pulse rounded bg-muted sm:block" /></div>)}</div>;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<AvailabilityStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Consultant | null>(null);
  const [deleting, setDeleting] = useState<Consultant | null>(null);
  const [notice, setNotice] = useState('');
  const [expandedAlerts, setExpandedAlerts] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [search]);

  const params = useMemo(() => ({ ...(debouncedSearch ? { search: debouncedSearch } : {}), ...(status !== 'all' ? { status } : {}) }), [debouncedSearch, status]);
  const roster = useListConsultants(params, { query: { queryKey: getListConsultantsQueryKey(params) } });
  const summary = useGetDashboardSummary();
  const create = useCreateConsultant();
  const update = useUpdateConsultant();
  const remove = useDeleteConsultant();
  const consultants = roster.data ?? [];
  const endingSoon = consultants.filter((consultant) => isEndingSoon(consultant.engagement?.endDate));
  const visibleAlerts = expandedAlerts ? endingSoon : endingSoon.slice(0, 3);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getListConsultantsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3400);
  };

  const saveConsultant = (data: ConsultantInput) => {
    if (editing) {
      update.mutate({ id: editing.id, data }, { onSuccess: () => { refresh(); setFormOpen(false); setEditing(null); showNotice('Consultant profile updated'); }, onError: () => showNotice('Could not update this profile') });
    } else {
      create.mutate({ data }, { onSuccess: () => { refresh(); setFormOpen(false); showNotice('Consultant added to the roster'); }, onError: () => showNotice('Could not add this consultant') });
    }
  };

  const updateStatus = (consultant: Consultant, value: AvailabilityStatus) => {
    if (value === consultant.availabilityStatus) return;
    if (value === 'deployed' && !consultant.engagement) {
      openEdit({ ...consultant, availabilityStatus: value });
      return;
    }
    update.mutate({ id: consultant.id, data: { availabilityStatus: value } }, { onSuccess: () => { refresh(); showNotice(`${consultant.name} is now ${statusMeta[value].label.toLowerCase()}`); }, onError: () => showNotice('Status update failed') });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate({ id: deleting.id }, { onSuccess: () => { refresh(); setDeleting(null); showNotice('Consultant removed from the roster'); }, onError: () => showNotice('Could not remove this consultant') });
  };

  const openEdit = (consultant: Consultant) => { setEditing(consultant); setFormOpen(true); };
  const openAdd = () => { setEditing(null); setFormOpen(true); };

  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="animate-rise">
        <div className="mb-2 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary"><span className="size-1.5 rounded-full bg-primary" /> Live roster</div>
        <h1 className="font-display text-[clamp(2.1rem,4vw,3.3rem)] font-bold leading-[.98] tracking-[-0.07em]">Know your bench.<br /><span className="text-muted-foreground">Move with intent.</span></h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">A clear read on who is ready for what comes next, without the spreadsheet archaeology.</p>
      </div>
      <button onClick={openAdd} data-testid="button-add-consultant" className="button-primary animate-rise self-start sm:self-auto"><CirclePlus size={17} /> Add consultant</button>
    </div>

    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Metric label="Total roster" value={summary.data?.totalConsultants ?? '—'} accent="bg-foreground/40" sub="all consultants" />
      <Metric label="Available" value={summary.data?.available ?? '—'} accent="bg-primary" sub="ready to staff" />
      <Metric label="Deployed" value={summary.data?.deployed ?? '—'} accent="bg-accent" sub="on engagement" />
      <Metric label="Unavailable" value={summary.data?.unavailable ?? '—'} accent="bg-muted-foreground/50" sub="off the bench" />
      <Metric label="Ending soon" value={summary.data?.endingSoon ?? '—'} accent="bg-destructive" sub="next 14 days" />
    </section>

    {endingSoon.length > 0 && <section className="animate-rise stagger-1 rounded-xl border border-accent/30 bg-accent/8 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/20 text-accent-foreground"><Clock3 size={16} /></div><div><h2 className="text-sm font-semibold">Capacity opening soon</h2><p className="mt-1 text-xs text-muted-foreground">These engagements wrap in the next 14 days. Start the next conversation early.</p></div></div>
        <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">{visibleAlerts.map((consultant) => <button key={consultant.id} onClick={() => openEdit(consultant)} data-testid={`button-alert-consultant-${consultant.id}`} className="flex items-center gap-2 rounded-lg border border-accent/25 bg-card/70 px-3 py-2 text-left text-xs hover:bg-card"><span className="font-semibold">{consultant.name}</span><span className="text-muted-foreground">· {formatDate(consultant.engagement?.endDate)}</span></button>)}</div>
        {endingSoon.length > 3 && <button onClick={() => setExpandedAlerts((value) => !value)} data-testid="button-toggle-alerts" className="shrink-0 self-end text-xs font-semibold text-accent-foreground underline-offset-4 hover:underline sm:self-center">{expandedAlerts ? 'Show less' : `+${endingSoon.length - 3} more`}</button>}
      </div>
    </section>}

    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_0_hsl(var(--foreground)/.04)]">
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 className="font-display text-xl font-bold tracking-[-0.04em]">Consultant roster</h2><p className="mt-1 text-xs text-muted-foreground">{roster.isLoading ? 'Reading current roster...' : `${consultants.length} ${consultants.length === 1 ? 'person' : 'people'} in this view`}</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative"><Search size={15} className="absolute left-3 top-2.5 text-muted-foreground" /><input data-testid="input-roster-search" value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-56" placeholder="Search name, title, skill" /></label>
          <label className="relative"><select data-testid="select-roster-status" value={status} onChange={(event) => setStatus(event.target.value as AvailabilityStatus | 'all')} className="h-9 w-full appearance-none rounded-lg border border-input bg-background py-0 pl-3 pr-9 text-xs font-medium outline-none focus:border-primary sm:w-36"><option value="all">All statuses</option><option value="available">Available</option><option value="deployed">Deployed</option><option value="unavailable">Unavailable</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-2.5 text-muted-foreground" /></label>
        </div>
      </div>
      {roster.isError ? <div className="m-5 flex flex-col items-center rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-12 text-center"><AlertTriangle size={22} className="text-destructive" /><h3 className="mt-3 text-sm font-semibold">Roster unavailable</h3><p className="mt-1 text-xs text-muted-foreground">We could not read the consultant list right now.</p><button onClick={() => roster.refetch()} data-testid="button-retry-roster" className="button-secondary mt-4">Try again</button></div>
        : roster.isLoading ? <RosterSkeleton />
        : consultants.length === 0 ? <div data-testid="empty-roster" className="surface-grid flex flex-col items-center px-5 py-16 text-center"><div className="grid size-12 place-items-center rounded-2xl border border-border bg-secondary text-muted-foreground"><UsersRound size={21} /></div><h3 className="mt-4 font-display text-lg font-bold tracking-[-0.03em]">{search || status !== 'all' ? 'No one matches this view' : 'Your roster starts here'}</h3><p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{search || status !== 'all' ? 'Try clearing your filters or searching for another skill.' : 'Add your first consultant to get a live read on availability.'}</p>{search || status !== 'all' ? <button onClick={() => { setSearch(''); setStatus('all'); }} data-testid="button-clear-filters" className="button-secondary mt-5">Clear filters</button> : <button onClick={openAdd} data-testid="button-empty-add-consultant" className="button-primary mt-5"><CirclePlus size={15} /> Add consultant</button>}</div>
        : <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead><tr className="border-b border-border bg-secondary/35 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted-foreground"><th className="px-5 py-3 font-medium">Consultant</th><th className="px-4 py-3 font-medium">Skills</th><th className="px-4 py-3 font-medium">Rate</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Engagement</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead><tbody>{consultants.map((consultant) => <tr key={consultant.id} data-testid={`row-consultant-${consultant.id}`} className="group border-b border-border/70 last:border-0 hover:bg-secondary/25">
          <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 font-display text-sm font-bold text-primary">{consultant.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><div data-testid={`text-consultant-name-${consultant.id}`} className="text-sm font-semibold">{consultant.name}</div><div className="mt-0.5 text-xs text-muted-foreground">{consultant.title}</div></div></div></td>
          <td className="max-w-[270px] px-4 py-4"><div className="flex flex-wrap gap-1.5">{consultant.skills.slice(0, 3).map((skill) => <span key={skill} className="rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground">{skill}</span>)}{consultant.skills.length > 3 && <span className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">+{consultant.skills.length - 3}</span>}</div></td>
          <td className="px-4 py-4 font-mono-ui text-xs">${consultant.hourlyRate}<span className="text-muted-foreground">/hr</span></td>
          <td className="px-4 py-4"><label className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${statusMeta[consultant.availabilityStatus].color}`}><span className={`size-1.5 rounded-full ${statusMeta[consultant.availabilityStatus].dot}`} /><select aria-label={`Change status for ${consultant.name}`} data-testid={`select-status-${consultant.id}`} value={consultant.availabilityStatus} onChange={(event) => updateStatus(consultant, event.target.value as AvailabilityStatus)} className="cursor-pointer appearance-none bg-transparent text-[11px] font-semibold outline-none"><option value="available">Available</option><option value="deployed">Deployed</option><option value="unavailable">Unavailable</option></select><ChevronDown size={11} /></label></td>
          <td className="px-4 py-4">{consultant.engagement ? <div className="max-w-[165px]"><div className="truncate text-xs font-medium">{consultant.engagement.projectName}</div><div className={`mt-1 text-[10px] ${isEndingSoon(consultant.engagement.endDate) ? 'font-semibold text-destructive' : 'text-muted-foreground'}`}>{isEndingSoon(consultant.engagement.endDate) ? `Ends ${formatDate(consultant.engagement.endDate)}` : `${formatDate(consultant.engagement.startDate)} – ${formatDate(consultant.engagement.endDate)}`}</div></div> : <span className="text-xs text-muted-foreground">No engagement</span>}</td>
          <td className="px-5 py-4"><div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100"><button onClick={() => openEdit(consultant)} data-testid={`button-edit-consultant-${consultant.id}`} className="icon-button" title="Edit consultant"><Pencil size={15} /></button><button onClick={() => setDeleting(consultant)} data-testid={`button-delete-consultant-${consultant.id}`} className="icon-button text-destructive hover:bg-destructive/10" title="Delete consultant"><Trash2 size={15} /></button></div></td>
        </tr>)}</tbody></table></div>}
    </section>
    {notice && <div data-testid="status-action-notice" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl"><Check size={15} className="text-primary" />{notice}<button onClick={() => setNotice('')} data-testid="button-dismiss-notice" className="ml-2 text-background/60 hover:text-background"><X size={14} /></button></div>}
    {deleting && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-5 backdrop-blur-[2px]"><div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"><div className="grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive"><Trash2 size={18} /></div><h2 className="mt-4 font-display text-xl font-bold tracking-[-0.04em]">Remove {deleting.name}?</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">This will remove the consultant from the active roster. The action cannot be undone.</p><div className="mt-6 flex gap-3"><button onClick={() => setDeleting(null)} data-testid="button-cancel-delete" className="button-secondary flex-1">Keep profile</button><button onClick={confirmDelete} disabled={remove.isPending} data-testid="button-confirm-delete" className="button-danger flex-1">{remove.isPending ? 'Removing...' : 'Remove'}</button></div></div></div>}
    <ConsultantForm open={formOpen} consultant={editing} pending={create.isPending || update.isPending} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={saveConsultant} />
  </div>;
}