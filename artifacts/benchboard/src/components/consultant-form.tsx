import { useEffect, useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import type { AvailabilityStatus, Consultant, ConsultantInput } from '@workspace/api-client-react';
import type { FormEvent } from 'react';

type FormValue = {
  name: string;
  title: string;
  skills: string;
  serviceOffers: string;
  hourlyRate: string;
  availabilityStatus: AvailabilityStatus;
  projectName: string;
  engagementStartDate: string;
  engagementEndDate: string;
};

type ConsultantFormProps = {
  open: boolean;
  consultant: Consultant | null;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (data: ConsultantInput) => void;
};

const blankForm: FormValue = {
  name: '',
  title: '',
  skills: '',
  serviceOffers: '',
  hourlyRate: '',
  availabilityStatus: 'available',
  projectName: '',
  engagementStartDate: '',
  engagementEndDate: '',
};

export function ConsultantForm({ open, consultant, pending, onClose, onSubmit }: ConsultantFormProps) {
  const [form, setForm] = useState<FormValue>(blankForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (consultant) {
      setForm({
        name: consultant.name,
        title: consultant.title,
        skills: consultant.skills.join(', '),
        serviceOffers: consultant.serviceOffers.join(', '),
        hourlyRate: String(consultant.hourlyRate),
        availabilityStatus: consultant.availabilityStatus,
        projectName: consultant.engagement?.projectName ?? '',
        engagementStartDate: consultant.engagement?.startDate?.slice(0, 10) ?? '',
        engagementEndDate: consultant.engagement?.endDate?.slice(0, 10) ?? '',
      });
    } else {
      setForm(blankForm);
    }
    setError('');
  }, [open, consultant]);

  if (!open) return null;
  const set = (key: keyof FormValue, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const skills = form.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
    if (!form.name.trim() || !form.title.trim() || skills.length === 0 || !form.hourlyRate) {
      setError('Add a name, title, hourly rate, and at least one skill.');
      return;
    }
    onSubmit({
      name: form.name.trim(),
      title: form.title.trim(),
      skills,
      serviceOffers: form.serviceOffers.split(',').map((service) => service.trim()).filter(Boolean),
      hourlyRate: Number(form.hourlyRate),
      availabilityStatus: form.availabilityStatus,
      projectName: form.projectName.trim() || null,
      engagementStartDate: form.engagementStartDate || null,
      engagementEndDate: form.engagementEndDate || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-foreground/35 backdrop-blur-[2px] sm:items-stretch" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:max-w-[520px] sm:rounded-none sm:rounded-l-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="consultant-form-title">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <div className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary">{consultant ? 'Edit profile' : 'New profile'}</div>
            <h2 id="consultant-form-title" className="mt-1 font-display text-2xl font-bold tracking-[-0.04em]">{consultant ? 'Update consultant' : 'Add to roster'}</h2>
          </div>
          <button type="button" onClick={onClose} data-testid="button-close-consultant-form" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="field-label">Full name</span><input data-testid="input-consultant-name" value={form.name} onChange={(event) => set('name', event.target.value)} className="field-input" placeholder="e.g. Priya Shah" /></label>
            <label className="sm:col-span-2"><span className="field-label">Title</span><input data-testid="input-consultant-title" value={form.title} onChange={(event) => set('title', event.target.value)} className="field-input" placeholder="e.g. Senior Product Strategist" /></label>
            <label><span className="field-label">Hourly rate</span><div className="relative"><span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span><input data-testid="input-consultant-rate" type="number" min="0" value={form.hourlyRate} onChange={(event) => set('hourlyRate', event.target.value)} className="field-input pl-7" placeholder="185" /></div></label>
            <label><span className="field-label">Availability</span><select data-testid="select-consultant-status" value={form.availabilityStatus} onChange={(event) => set('availabilityStatus', event.target.value)} className="field-input"><option value="available">Available</option><option value="deployed">Deployed</option><option value="unavailable">Unavailable</option></select></label>
          </div>
          <label><span className="field-label">Skills <span className="font-normal normal-case tracking-normal text-muted-foreground">comma separated</span></span><input data-testid="input-consultant-skills" value={form.skills} onChange={(event) => set('skills', event.target.value)} className="field-input" placeholder="Research, Go-to-market, SaaS" /></label>
          <label><span className="field-label">Services you offer <span className="font-normal normal-case tracking-normal text-muted-foreground">comma separated</span></span><input data-testid="input-consultant-services" value={form.serviceOffers} onChange={(event) => set('serviceOffers', event.target.value)} className="field-input" placeholder="Strategy, Discovery, Workshop facilitation" /></label>
          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <div className="mb-3 text-xs font-semibold text-foreground">Engagement context <span className="font-normal text-muted-foreground">optional</span></div>
            <div className="space-y-3">
              <label><span className="field-label">Project name</span><input data-testid="input-consultant-project" value={form.projectName} onChange={(event) => set('projectName', event.target.value)} className="field-input bg-card" placeholder="e.g. Meridian launch" /></label>
              <div className="grid gap-3 sm:grid-cols-2"><label><span className="field-label">Starts</span><input data-testid="input-engagement-start" type="date" value={form.engagementStartDate} onChange={(event) => set('engagementStartDate', event.target.value)} className="field-input bg-card" /></label><label><span className="field-label">Ends</span><input data-testid="input-engagement-end" type="date" value={form.engagementEndDate} onChange={(event) => set('engagementEndDate', event.target.value)} className="field-input bg-card" /></label></div>
            </div>
          </div>
          {error && <p data-testid="status-form-error" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
          <div className="flex gap-3 border-t border-border pt-5">
            <button type="button" onClick={onClose} data-testid="button-cancel-consultant" className="button-secondary flex-1">Cancel</button>
            <button type="submit" disabled={pending} data-testid="button-save-consultant" className="button-primary flex-1">{pending ? <span className="animate-pulse-soft">Saving...</span> : consultant ? <><Save size={15} /> Save changes</> : <><Plus size={15} /> Add consultant</>}</button>
          </div>
        </form>
      </section>
    </div>
  );
}