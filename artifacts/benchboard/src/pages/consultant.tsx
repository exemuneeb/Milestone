import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, CirclePlus, Clock3, Edit3, Star, UsersRound } from "lucide-react";
import {
  getListClientsQueryKey,
  getListConsultantsQueryKey,
  useCreateConsultant,
  useListClients,
  useListConsultants,
  useUpdateConsultant,
} from "@workspace/api-client-react";
import type { Client, Consultant, ConsultantInput } from "@workspace/api-client-react";
import { ConsultantForm } from "@/components/consultant-form";

function formatDate(date?: string | null) {
  if (!date) return "Open ended";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date.slice(0, 10)}T12:00:00`));
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
}

function PortalMetric({ label, value, detail, accent }: { label: string; value: string | number; detail: string; accent: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_0_hsl(var(--foreground)/.04)]">
      <div className="flex items-start justify-between"><span className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span><span className={`size-2 rounded-full ${accent}`} /></div>
      <div className="mt-3 font-display text-3xl font-bold tracking-[-0.06em]">{value}</div>
      <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}

export default function ConsultantPortal() {
  const queryClient = useQueryClient();
  const roster = useListConsultants();
  const clients = useListClients();
  const create = useCreateConsultant();
  const update = useUpdateConsultant();
  const consultants = roster.data ?? [];
  const clientList = clients.data ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Consultant | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (selectedId && consultants.some((consultant) => consultant.id === selectedId)) return;
    if (consultants[0]) setSelectedId(consultants[0].id);
  }, [consultants, selectedId]);

  const selected = consultants.find((consultant) => consultant.id === selectedId) ?? consultants[0] ?? null;
  const ongoing = useMemo(() => consultants.filter((consultant) => consultant.engagement), [consultants]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getListConsultantsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const saveConsultant = (data: ConsultantInput) => {
    if (editing) {
      update.mutate({ id: editing.id, data }, {
        onSuccess: () => {
          refresh();
          setFormOpen(false);
          setEditing(null);
          showNotice("Your consultant profile is updated");
        },
        onError: () => showNotice("Could not update this profile"),
      });
    } else {
      create.mutate({ data }, {
        onSuccess: (created) => {
          refresh();
          setSelectedId(created.id);
          setFormOpen(false);
          showNotice("Your consultant profile is ready");
        },
        onError: () => showNotice("Could not create this profile"),
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="animate-rise">
          <div className="mb-2 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary"><span className="size-1.5 rounded-full bg-primary" /> Consultant portal</div>
          <h1 className="font-display text-[clamp(2.1rem,4vw,3.3rem)] font-bold leading-[.98] tracking-[-0.07em]">Make your work<br /><span className="text-muted-foreground">easy to find.</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Keep your profile current, show the services you offer, and stay close to the client work that fits your next move.</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} data-testid="button-consultant-profile" className="button-primary self-start sm:self-auto"><CirclePlus size={17} /> Enter your profile</button>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PortalMetric label="Profiles" value={roster.isLoading ? "—" : consultants.length} detail="consultants in the bench" accent="bg-primary" />
        <PortalMetric label="Live projects" value={ongoing.length} detail="ongoing engagements" accent="bg-accent" />
        <PortalMetric label="Service offers" value={selected?.serviceOffers.length ?? "—"} detail="in your selected profile" accent="bg-chart-3" />
        <PortalMetric label="Top clients" value={clientList.length} detail="rated client partners" accent="bg-chart-5" />
      </section>

      {selected && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
          <div className="animate-rise rounded-xl border border-border bg-card p-5 shadow-[0_1px_0_hsl(var(--foreground)/.04)] sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/12 font-display text-lg font-bold text-primary">{initials(selected.name)}</div>
                <div>
                  <div className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary">Selected consultant profile</div>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em]">{selected.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.title} · ${selected.hourlyRate}/hr</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select aria-label="Choose consultant profile" value={selected.id} onChange={(event) => setSelectedId(Number(event.target.value))} className="field-input w-auto max-w-[180px]">
                  {consultants.map((consultant) => <option key={consultant.id} value={consultant.id}>{consultant.name}</option>)}
                </select>
                <button onClick={() => { setEditing(selected); setFormOpen(true); }} className="icon-button" title="Edit profile"><Edit3 size={16} /></button>
              </div>
            </div>
            <div className="mt-6 grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-2">
              <div><div className="field-label">Core skills</div><div className="mt-2 flex flex-wrap gap-1.5">{selected.skills.map((skill) => <span key={skill} className="rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">{skill}</span>)}</div></div>
              <div><div className="field-label">Services offered</div><div className="mt-2 flex flex-wrap gap-1.5">{selected.serviceOffers.length ? selected.serviceOffers.map((service) => <span key={service} className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{service}</span>) : <span className="text-xs text-muted-foreground">Add the services you want clients to find.</span>}</div></div>
            </div>
          </div>
          <div className="surface-grid rounded-xl border border-border bg-secondary/40 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold"><BriefcaseBusiness size={15} className="text-primary" /> How your profile works</div>
            <div className="mt-5 space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p><span className="font-mono-ui mr-2 text-primary">01</span>Keep your skills and service offers specific so clients can search for the right fit.</p>
              <p><span className="font-mono-ui mr-2 text-primary">02</span>Attach ongoing engagement details when you are deployed so your next availability is clear.</p>
              <p><span className="font-mono-ui mr-2 text-primary">03</span>Browse highly rated client partners before you offer your services.</p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-xl border border-border bg-card shadow-[0_1px_0_hsl(var(--foreground)/.04)]">
          <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-display text-xl font-bold tracking-[-0.04em]">Ongoing projects</h2><p className="mt-1 text-xs text-muted-foreground">Engagements currently on your bench.</p></div><Clock3 size={18} className="text-accent-foreground" /></div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {ongoing.length ? ongoing.map((consultant) => <article key={consultant.id} className="rounded-lg border border-border/80 bg-secondary/25 p-4"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-full bg-primary/12 text-[10px] font-bold text-primary">{initials(consultant.name)}</div><div><h3 className="text-sm font-semibold">{consultant.name}</h3><p className="text-[11px] text-muted-foreground">{consultant.title}</p></div></div><span className="rounded-md bg-accent/15 px-2 py-1 text-[10px] font-semibold">Deployed</span></div><div className="mt-4 border-t border-border/70 pt-3"><div className="text-sm font-semibold">{consultant.engagement?.projectName}</div><div className="mt-1 text-[11px] text-muted-foreground">Through {formatDate(consultant.engagement?.endDate)}</div></div></article>) : <div className="col-span-full px-3 py-10 text-center text-sm text-muted-foreground">No ongoing projects yet. Add engagement details to your consultant profile.</div>}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-[0_1px_0_hsl(var(--foreground)/.04)]">
          <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-display text-xl font-bold tracking-[-0.04em]">Top-rated clients</h2><p className="mt-1 text-xs text-muted-foreground">Client partners consultants recommend.</p></div><Star size={18} className="text-accent-foreground" /></div>
          <div className="space-y-2 p-4">
            {clientList.map((client: Client) => <div key={client.id} className="flex items-center gap-3 rounded-lg border border-border/70 p-3"><div className="grid size-9 place-items-center rounded-full bg-secondary font-display text-xs font-bold">{initials(client.company)}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{client.company}</div><div className="text-[11px] text-muted-foreground">{client.industry}</div></div><div className="flex items-center gap-1 font-mono-ui text-xs text-accent-foreground"><Star size={12} fill="currentColor" />{client.rating.toFixed(1)}</div></div>)}
            {!clientList.length && <div className="px-3 py-8 text-center text-sm text-muted-foreground">No rated clients yet.</div>}
          </div>
        </div>
      </section>

      {!selected && !roster.isLoading && <div className="surface-grid rounded-xl border border-border px-5 py-14 text-center"><UsersRound className="mx-auto text-muted-foreground" size={24} /><h2 className="mt-3 font-display text-xl font-bold">Your profile starts here</h2><p className="mt-1 text-sm text-muted-foreground">Add your consultant information to become searchable.</p></div>}
      {notice && <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl">{notice}</div>}
      <ConsultantForm open={formOpen} consultant={editing} pending={create.isPending || update.isPending} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={saveConsultant} />
    </div>
  );
}