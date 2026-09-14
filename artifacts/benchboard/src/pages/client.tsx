import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BriefcaseBusiness, CircleAlert, CirclePlus, Edit3, FolderKanban, LoaderCircle, Search, Sparkles, Star, Trash2, UsersRound } from "lucide-react";
import {
  getListClientsQueryKey,
  getListProjectsQueryKey,
  useCreateClient,
  useCreateProject,
  useDeleteProject,
  useListClients,
  useListProjects,
  useMatchConsultants,
  useUpdateClient,
  useUpdateProject,
} from "@workspace/api-client-react";
import type { Client, ClientInput, Project, ProjectInput, ProjectStatus } from "@workspace/api-client-react";
import { ClientForm } from "@/components/client-form";
import { ProjectForm } from "@/components/project-form";

function formatDate(date?: string | null) {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date.slice(0, 10)}T12:00:00`));
}

function statusLabel(status: ProjectStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClass(status: ProjectStatus) {
  if (status === "active") return "bg-primary/10 text-primary";
  if (status === "completed") return "bg-secondary text-secondary-foreground";
  if (status === "paused") return "bg-accent/15 text-accent-foreground";
  return "bg-muted text-muted-foreground";
}

export default function ClientPortal() {
  const queryClient = useQueryClient();
  const clientsQuery = useListClients();
  const clientList = clientsQuery.data ?? [];
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [projectOpen, setProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [notice, setNotice] = useState("");
  const [brief, setBrief] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (selectedClientId && clientList.some((client) => client.id === selectedClientId)) return;
    if (clientList[0]) setSelectedClientId(clientList[0].id);
  }, [clientList, selectedClientId]);

  const activeClient = clientList.find((client) => client.id === selectedClientId) ?? clientList[0] ?? null;
  const projectsQuery = useListProjects(
    { clientId: activeClient?.id ?? 0 },
    {
      query: {
        queryKey: getListProjectsQueryKey({ clientId: activeClient?.id ?? 0 }),
        enabled: Boolean(activeClient?.id),
      },
    },
  );
  const projects = projectsQuery.data ?? [];
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const match = useMatchConsultants();
  const activeProjects = useMemo(() => projects.filter((project) => project.status === "active"), [projects]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const refreshClients = () => queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
  const refreshProjects = () => {
    if (activeClient) queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey({ clientId: activeClient.id }) });
  };

  const saveClient = (data: ClientInput) => {
    if (editingClient) {
      updateClient.mutate({ id: editingClient.id, data }, {
        onSuccess: () => {
          refreshClients();
          setProfileOpen(false);
          setEditingClient(null);
          showNotice("Client profile updated");
        },
        onError: () => showNotice("Could not update this profile"),
      });
    } else {
      createClient.mutate({ data }, {
        onSuccess: (created) => {
          refreshClients();
          setSelectedClientId(created.id);
          setProfileOpen(false);
          showNotice("Client profile created");
        },
        onError: () => showNotice("Could not create this profile"),
      });
    }
  };

  const saveProject = (data: ProjectInput | Omit<ProjectInput, "clientId">) => {
    if (editingProject) {
      updateProject.mutate({ id: editingProject.id, data }, {
        onSuccess: () => {
          refreshProjects();
          setProjectOpen(false);
          setEditingProject(null);
          showNotice("Project details updated");
        },
        onError: () => showNotice("Could not update this project"),
      });
    } else if ("clientId" in data) {
      createProject.mutate({ data }, {
        onSuccess: () => {
          refreshProjects();
          setProjectOpen(false);
          showNotice("Project added to your workspace");
        },
        onError: () => showNotice("Could not add this project"),
      });
    }
  };

  const confirmDeleteProject = () => {
    if (!deletingProject) return;
    deleteProject.mutate({ id: deletingProject.id }, {
      onSuccess: () => {
        refreshProjects();
        setDeletingProject(null);
        showNotice("Project removed");
      },
      onError: () => showNotice("Could not remove this project"),
    });
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchText.trim().length < 20) return;
    match.mutate({ data: { jobDescription: searchText.trim() } });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="animate-rise">
          <div className="mb-2 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-accent-foreground"><span className="size-1.5 rounded-full bg-accent" /> Client portal</div>
          <h1 className="font-display text-[clamp(2.1rem,4vw,3.3rem)] font-bold leading-[.98] tracking-[-0.07em]">Bring the brief.<br /><span className="text-muted-foreground">Find the right bench.</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Manage your client profile and projects, then use AI search to find consultants who can move the work forward.</p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button onClick={() => { setEditingClient(null); setProfileOpen(true); }} data-testid="button-client-profile" className="button-secondary"><UsersRound size={15} /> Add client profile</button>
          <button onClick={() => { setEditingProject(null); setProjectOpen(true); }} disabled={!activeClient} data-testid="button-add-project" className="button-primary"><CirclePlus size={15} /> Add project</button>
        </div>
      </div>

      {activeClient ? (
        <>
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_0_hsl(var(--foreground)/.04)] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary">Active client profile</div>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em]">{activeClient.company}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{activeClient.name} · {activeClient.industry}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select aria-label="Choose client profile" value={activeClient.id} onChange={(event) => setSelectedClientId(Number(event.target.value))} className="field-input w-auto max-w-[190px]">
                    {clientList.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}
                  </select>
                  <button onClick={() => { setEditingClient(activeClient); setProfileOpen(true); }} className="icon-button" title="Edit client profile"><Edit3 size={16} /></button>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{activeClient.bio || "Add a short description so consultants understand how your team works."}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border/70 pt-4 text-xs"><span className="flex items-center gap-1.5 font-semibold text-accent-foreground"><Star size={14} fill="currentColor" /> {activeClient.rating.toFixed(1)} partner rating</span><span className="text-muted-foreground">{projects.length} saved projects</span><span className="text-muted-foreground">{activeProjects.length} active now</span></div>
            </div>
            <div className="surface-grid rounded-xl border border-border bg-secondary/40 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-semibold"><BriefcaseBusiness size={15} className="text-primary" /> Client workspace</div>
              <div className="mt-5 space-y-4 text-xs leading-relaxed text-muted-foreground"><p><span className="font-mono-ui mr-2 text-primary">01</span>Add a project with enough context for the AI search to understand the work.</p><p><span className="font-mono-ui mr-2 text-primary">02</span>Save project status, timing, budget, and the capabilities you need.</p><p><span className="font-mono-ui mr-2 text-primary">03</span>Compare grounded consultant recommendations before you reach out.</p></div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card shadow-[0_1px_0_hsl(var(--foreground)/.04)]">
            <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-display text-xl font-bold tracking-[-0.04em]">Your projects</h2><p className="mt-1 text-xs text-muted-foreground">Add, edit, or remove the project details consultants will search against.</p></div><button onClick={() => { setEditingProject(null); setProjectOpen(true); }} className="button-secondary self-start"><FolderKanban size={15} /> New project</button></div>
            {projectsQuery.isLoading ? <div className="p-10 text-center text-sm text-muted-foreground">Loading projects...</div> : projects.length === 0 ? <div className="surface-grid px-5 py-14 text-center"><FolderKanban className="mx-auto text-muted-foreground" size={24} /><h3 className="mt-3 font-display text-lg font-bold">No projects yet</h3><p className="mt-1 text-sm text-muted-foreground">Create a project brief to start your consultant search.</p></div> : <div className="grid gap-3 p-4 lg:grid-cols-2">{projects.map((project) => <article key={project.id} className="rounded-lg border border-border/80 bg-secondary/20 p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{project.name}</h3><span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${statusClass(project.status)}`}>{statusLabel(project.status)}</span></div><p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{project.description}</p></div><div className="flex shrink-0 gap-1"><button onClick={() => { setEditingProject(project); setProjectOpen(true); }} className="icon-button" title="Edit project"><Edit3 size={14} /></button><button onClick={() => setDeletingProject(project)} className="icon-button text-destructive hover:bg-destructive/10" title="Remove project"><Trash2 size={14} /></button></div></div><div className="mt-4 flex flex-wrap gap-1.5">{project.skills.map((skill) => <span key={skill} className="rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground">{skill}</span>)}</div><div className="mt-4 flex flex-wrap gap-4 border-t border-border/70 pt-3 text-[11px] text-muted-foreground"><span>Timeline: {formatDate(project.startDate)} – {formatDate(project.endDate)}</span>{project.budget != null && <span>Budget: ${project.budget.toLocaleString()}</span>}</div></article>)}</div>}
          </section>
        </>
      ) : (
        <div className="surface-grid rounded-xl border border-border px-5 py-16 text-center"><UsersRound className="mx-auto text-muted-foreground" size={25} /><h2 className="mt-3 font-display text-xl font-bold">Create your client profile</h2><p className="mt-1 text-sm text-muted-foreground">Add your company details before creating projects.</p><button onClick={() => { setEditingClient(null); setProfileOpen(true); }} className="button-primary mt-5"><CirclePlus size={15} /> Create profile</button></div>
      )}

      <section className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_0_hsl(var(--foreground)/.04)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.16em] text-accent-foreground"><Sparkles size={13} /> AI consultant search</div><h2 className="font-display text-2xl font-bold tracking-[-0.04em]">Find the people for this project.</h2><p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">Search from your saved project or paste a fresh brief. BenchBoard extracts the signal, reads the live consultant profiles, and explains the recommendations.</p></div>{projects.length > 0 && <select aria-label="Use saved project" onChange={(event) => { const project = projects.find((item) => item.id === Number(event.target.value)); if (project) setSearchText(project.description); }} className="field-input w-full sm:w-56"><option value="">Use a saved project...</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>}</div>
        <form onSubmit={submitSearch} className="mt-5"><textarea data-testid="textarea-client-search" value={searchText} onChange={(event) => setSearchText(event.target.value)} className="min-h-32 w-full resize-y rounded-xl border border-input bg-background p-4 text-sm leading-relaxed outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Describe the project outcome, context, and capabilities you need..." /><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-[11px] text-muted-foreground">{searchText.length > 0 ? `${searchText.length} characters` : "Minimum 20 characters"}</span><button type="submit" disabled={match.isPending || searchText.trim().length < 20} data-testid="button-client-search" className="button-primary self-start sm:self-auto">{match.isPending ? <><LoaderCircle size={15} className="animate-spin" /> Searching consultants</> : <><Search size={15} /> Find consultants</>}</button></div></form>
        {match.isError && <div className="mt-5 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive"><CircleAlert size={16} className="mt-0.5 shrink-0" /><div><strong>Search failed.</strong><p className="mt-1 text-destructive/75">Check the brief and try again.</p></div></div>}
        {match.data && <div className="mt-6 space-y-3 border-t border-border/70 pt-5"><div className="flex items-end justify-between"><div><div className="field-label">Recommended consultants</div><p className="mt-1 text-xs text-muted-foreground">{match.data.matches.length} profiles compared against your brief.</p></div><ArrowRight size={17} className="text-primary" /></div>{match.data.matches.slice(0, 5).map((item) => <article key={`${item.rank}-${item.consultant.id}`} className="rounded-lg border border-border/80 bg-secondary/20 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 font-mono-ui text-xs font-semibold text-primary">0{item.rank}</div><div><h3 className="text-sm font-semibold">{item.consultant.name}</h3><p className="text-[11px] text-muted-foreground">{item.consultant.title} · ${item.consultant.hourlyRate}/hr</p></div></div><div className="ml-auto font-mono-ui text-lg font-medium text-primary">{Math.round(item.score * 100)}%</div></div><div className="mt-3 grid gap-3 border-t border-border/70 pt-3 sm:grid-cols-[.8fr_1.6fr]"><div><div className="field-label">Fit signals</div><div className="mt-1 flex flex-wrap gap-1.5">{item.matchingSkills.length ? item.matchingSkills.map((skill) => <span key={skill} className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{skill}</span>) : <span className="text-[11px] text-muted-foreground">Profile overlap is limited</span>}</div></div><div><div className="field-label">Why this fit</div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.reason}</p></div></div></article>)}</div>}
      </section>

      {notice && <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl">{notice}</div>}
      {deletingProject && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-5 backdrop-blur-[2px]"><div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"><div className="grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive"><Trash2 size={18} /></div><h2 className="mt-4 font-display text-xl font-bold tracking-[-0.04em]">Remove {deletingProject.name}?</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">This removes the saved project brief and its details from your client workspace.</p><div className="mt-6 flex gap-3"><button onClick={() => setDeletingProject(null)} className="button-secondary flex-1">Keep project</button><button onClick={confirmDeleteProject} disabled={deleteProject.isPending} className="button-danger flex-1">{deleteProject.isPending ? "Removing..." : "Remove"}</button></div></div></div>}
      <ClientForm open={profileOpen} client={editingClient} pending={createClient.isPending || updateClient.isPending} onClose={() => { setProfileOpen(false); setEditingClient(null); }} onSubmit={saveClient} />
      {activeClient && <ProjectForm open={projectOpen} clientId={activeClient.id} project={editingProject} pending={createProject.isPending || updateProject.isPending} onClose={() => { setProjectOpen(false); setEditingProject(null); }} onSubmit={saveProject} />}
    </div>
  );
}