import { useEffect, useState, type FormEvent } from "react";
import { Save, UserRound, X } from "lucide-react";
import type { Client, ClientInput } from "@workspace/api-client-react";

type ClientFormProps = {
  open: boolean;
  client: Client | null;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (data: ClientInput) => void;
};

export function ClientForm({ open, client, pending, onClose, onSubmit }: ClientFormProps) {
  const [form, setForm] = useState({ name: "", company: "", industry: "", bio: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(client
      ? { name: client.name, company: client.company, industry: client.industry, bio: client.bio }
      : { name: "", company: "", industry: "", bio: "" });
    setError("");
  }, [open, client]);

  if (!open) return null;
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.company.trim() || !form.industry.trim()) {
      setError("Add your name, company, and industry.");
      return;
    }
    onSubmit({
      name: form.name.trim(),
      company: form.company.trim(),
      industry: form.industry.trim(),
      bio: form.bio.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-foreground/35 backdrop-blur-[2px] sm:items-stretch" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:max-w-[520px] sm:rounded-none sm:rounded-l-2xl sm:p-8" role="dialog" aria-modal="true">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <div className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary">{client ? "Edit client profile" : "New client profile"}</div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em]">{client ? "Update your profile" : "Tell consultants about you"}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <label><span className="field-label">Your name</span><input data-testid="input-client-name" value={form.name} onChange={(event) => set("name", event.target.value)} className="field-input" placeholder="e.g. Elena Rossi" /></label>
          <label><span className="field-label">Company</span><input data-testid="input-client-company" value={form.company} onChange={(event) => set("company", event.target.value)} className="field-input" placeholder="e.g. Northstar Health" /></label>
          <label><span className="field-label">Industry</span><input data-testid="input-client-industry" value={form.industry} onChange={(event) => set("industry", event.target.value)} className="field-input" placeholder="e.g. Healthcare" /></label>
          <label><span className="field-label">About your team <span className="font-normal normal-case tracking-normal text-muted-foreground">optional</span></span><textarea data-testid="input-client-bio" value={form.bio} onChange={(event) => set("bio", event.target.value)} className="min-h-28 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="What makes your team a great partner?" /></label>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
          <div className="flex gap-3 border-t border-border pt-5">
            <button type="button" onClick={onClose} className="button-secondary flex-1">Cancel</button>
            <button type="submit" disabled={pending} className="button-primary flex-1">{pending ? "Saving..." : <><UserRound size={15} /> <span>{client ? "Save changes" : "Create profile"}</span></>}</button>
          </div>
        </form>
      </section>
    </div>
  );
}