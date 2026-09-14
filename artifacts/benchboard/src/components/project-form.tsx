import { useEffect, useState, type FormEvent } from "react";
import { FolderPlus, Save, X } from "lucide-react";
import type { Project, ProjectInput, ProjectStatus } from "@workspace/api-client-react";

type ProjectFormProps = {
  open: boolean;
  clientId: number;
  project: Project | null;
  pending?: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectInput | Omit<ProjectInput, "clientId">) => void;
};

const empty = {
  name: "",
  description: "",
  skills: "",
  status: "planning" as ProjectStatus,
  budget: "",
  startDate: "",
  endDate: "",
};

export function ProjectForm({ open, clientId, project, pending, onClose, onSubmit }: ProjectFormProps) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(project
      ? {
          name: project.name,
          description: project.description,
          skills: project.skills.join(", "),
          status: project.status,
          budget: project.budget == null ? "" : String(project.budget),
          startDate: project.startDate?.slice(0, 10) ?? "",
          endDate: project.endDate?.slice(0, 10) ?? "",
        }
      : empty);
    setError("");
  }, [open, project]);

  if (!open) return null;
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const skills = form.skills.split(",").map((skill) => skill.trim()).filter(Boolean);
    if (!form.name.trim() || form.description.trim().length < 20) {
      setError("Add a project name and at least 20 characters of detail.");
      return;
    }
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      skills,
      status: form.status,
      budget: form.budget ? Number(form.budget) : null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };
    onSubmit(project ? data : { clientId, ...data });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-foreground/35 backdrop-blur-[2px] sm:items-stretch" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:max-w-[580px] sm:rounded-none sm:rounded-l-2xl sm:p-8" role="dialog" aria-modal="true">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <div className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary">{project ? "Edit project" : "New project"}</div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em]">{project ? "Update project details" : "Add a project brief"}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <label><span className="field-label">Project name</span><input data-testid="input-project-name" value={form.name} onChange={(event) => set("name", event.target.value)} className="field-input" placeholder="e.g. Customer growth reset" /></label>
          <label><span className="field-label">Project details</span><textarea data-testid="input-project-description" value={form.description} onChange={(event) => set("description", event.target.value)} className="min-h-32 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Describe the outcome, context, and work you need help with..." /></label>
          <label><span className="field-label">Needed capabilities <span className="font-normal normal-case tracking-normal text-muted-foreground">comma separated</span></span><input data-testid="input-project-skills" value={form.skills} onChange={(event) => set("skills", event.target.value)} className="field-input" placeholder="Strategy, Research, Pricing" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="field-label">Status</span><select data-testid="select-project-status" value={form.status} onChange={(event) => set("status", event.target.value as ProjectStatus)} className="field-input"><option value="planning">Planning</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select></label>
            <label><span className="field-label">Budget <span className="font-normal normal-case tracking-normal text-muted-foreground">optional</span></span><input data-testid="input-project-budget" type="number" min="0" value={form.budget} onChange={(event) => set("budget", event.target.value)} className="field-input" placeholder="85000" /></label>
            <label><span className="field-label">Start date</span><input data-testid="input-project-start" type="date" value={form.startDate} onChange={(event) => set("startDate", event.target.value)} className="field-input" /></label>
            <label><span className="field-label">Target end</span><input data-testid="input-project-end" type="date" value={form.endDate} onChange={(event) => set("endDate", event.target.value)} className="field-input" /></label>
          </div>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
          <div className="flex gap-3 border-t border-border pt-5">
            <button type="button" onClick={onClose} className="button-secondary flex-1">Cancel</button>
            <button type="submit" disabled={pending} className="button-primary flex-1">{pending ? "Saving..." : <>{project ? <Save size={15} /> : <FolderPlus size={15} />} <span>{project ? "Save changes" : "Add project"}</span></>}</button>
          </div>
        </form>
      </section>
    </div>
  );
}