import { useState } from 'react';
import { ArrowRight, BrainCircuit, Check, CircleAlert, LoaderCircle, RotateCcw, Sparkles, Target, WandSparkles } from 'lucide-react';
import { useMatchConsultants } from '@workspace/api-client-react';
import type { FormEvent } from 'react';

const sampleDescription = 'We are looking for a senior product strategist to lead a B2B SaaS go-to-market reset. The right partner has deep customer research experience, pricing strategy skills, and a track record working with Series B technology companies.';

function scoreTone(score: number) {
  if (score >= 0.8) return 'text-primary';
  if (score >= 0.6) return 'text-accent-foreground';
  return 'text-muted-foreground';
}

export default function Match() {
  const [description, setDescription] = useState('');
  const match = useMatchConsultants();
  const response = match.data;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (description.trim().length >= 20) match.mutate({ data: { jobDescription: description.trim() } });
  };

  return <div className="space-y-8">
    <div className="animate-rise max-w-3xl">
      <div className="mb-2 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-accent-foreground"><span className="size-1.5 rounded-full bg-accent" /> Match studio</div>
      <h1 className="font-display text-[clamp(2.1rem,4vw,3.3rem)] font-bold leading-[.98] tracking-[-0.07em]">Put the brief<br /><span className="text-muted-foreground">against the bench.</span></h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Paste a role description. BenchBoard extracts the signal, ranks your people, and shows the reasoning behind every recommendation.</p>
    </div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="animate-rise stagger-1 rounded-xl border border-border bg-card p-5 shadow-[0_1px_0_hsl(var(--foreground)/.04)] sm:p-6">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-display text-xl font-bold tracking-[-0.04em]">Role brief</h2><p className="mt-1 text-xs text-muted-foreground">The more context, the sharper the shortlist.</p></div><div className="grid size-9 place-items-center rounded-lg bg-accent/15 text-accent-foreground"><WandSparkles size={17} /></div></div>
        <form onSubmit={submit}>
          <textarea data-testid="textarea-job-description" value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-[260px] w-full resize-y rounded-xl border border-input bg-background p-4 text-sm leading-relaxed outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Paste the role description here..." />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-[11px] text-muted-foreground">{description.length > 0 ? `${description.length} characters` : 'Minimum 20 characters'}</span><div className="flex gap-2"><button type="button" onClick={() => setDescription(sampleDescription)} data-testid="button-use-sample" className="button-secondary">Use sample brief</button><button type="submit" disabled={match.isPending || description.trim().length < 20} data-testid="button-run-match" className="button-primary min-w-[132px]">{match.isPending ? <><LoaderCircle size={15} className="animate-spin" /> Reading brief</> : <><Sparkles size={15} /> Find matches</>}</button></div></div>
        </form>
        {match.isError && <div data-testid="status-match-error" className="mt-5 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive"><CircleAlert size={16} className="mt-0.5 shrink-0" /><div><strong>Match run failed.</strong><p className="mt-1 text-destructive/75">Check the brief and try again.</p></div></div>}
      </section>
      <aside className="surface-grid animate-rise stagger-2 rounded-xl border border-border bg-secondary/45 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold"><Target size={15} className="text-primary" /> How matching works</div>
        <div className="mt-6 space-y-5">{[['01', 'Extract the signal', 'Skills, seniority, and domain are pulled from the brief.'], ['02', 'Read the bench', 'Every current consultant is compared against the role.'], ['03', 'Explain the call', 'You get a ranked shortlist with grounded reasons.']].map(([number, title, body]) => <div key={number} className="flex gap-3"><span className="font-mono-ui text-[10px] text-primary">{number}</span><div><h3 className="text-xs font-semibold">{title}</h3><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{body}</p></div></div>)}</div>
      </aside>
    </div>
    {response && <section className="animate-rise space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary"><Check size={13} /> Analysis complete</div><h2 className="font-display text-2xl font-bold tracking-[-0.05em]">Your shortlist</h2><p className="mt-1 text-xs text-muted-foreground">{response.matches.length} recommendations grounded in the role brief.</p></div><button onClick={() => { setDescription(''); }} data-testid="button-new-match" className="button-secondary self-start"><RotateCcw size={14} /> Start another match</button></div>
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2 text-xs font-semibold"><BrainCircuit size={15} className="text-primary" /> Extracted requirements</div><div className="mt-5 space-y-4"><div><div className="field-label">Skills</div><div className="mt-2 flex flex-wrap gap-1.5">{response.requirements.skills.length ? response.requirements.skills.map((skill) => <span key={skill} className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{skill}</span>) : <span className="text-xs text-muted-foreground">Not specified</span>}</div></div><div><div className="field-label">Seniority</div><div className="mt-1 text-sm font-medium">{response.requirements.seniority || 'Not specified'}</div></div><div><div className="field-label">Domain</div><div className="mt-1 text-sm font-medium">{response.requirements.domain || 'Not specified'}</div></div></div></div>
        <div className="space-y-3">{response.matches.length === 0 ? <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No close matches found for this brief.</div> : response.matches.map((item) => <article key={`${item.rank}-${item.consultant.id}`} data-testid={`match-card-${item.consultant.id}`} className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary/35 hover:shadow-[0_6px_24px_hsl(var(--foreground)/.05)]"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary font-mono-ui text-sm font-medium text-secondary-foreground">0{item.rank}</div><div><h3 className="font-display text-lg font-bold tracking-[-0.035em]">{item.consultant.name}</h3><p className="mt-0.5 text-xs text-muted-foreground">{item.consultant.title}</p></div></div><div className="ml-auto flex items-center gap-2"><span className={`font-mono-ui text-2xl font-medium tracking-[-0.06em] ${scoreTone(item.score)}`}>{Math.round(item.score * 100)}%</span><ArrowRight size={15} className="text-muted-foreground transition-transform group-hover:translate-x-1" /></div></div><div className="mt-4 grid gap-4 border-t border-border/70 pt-4 sm:grid-cols-[1fr_1.4fr]"><div><div className="field-label">Matching skills</div><div className="mt-2 flex flex-wrap gap-1.5">{item.matchingSkills.map((skill) => <span key={skill} className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{skill}</span>)}</div></div><div><div className="field-label">Why this match</div><p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.reason}</p></div></div></article>)}</div>
      </div>
    </section>}
  </div>;
}