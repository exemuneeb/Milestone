import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, Building2, LoaderCircle, Sparkles, UsersRound } from "lucide-react";
import { Redirect, useLocation } from "wouter";
import { useAuth, useUser } from "@clerk/react";
import { createAccountProfile, currentProfileQueryKey, useCurrentProfile, type AccountRole } from "@/lib/auth";

export default function Onboarding() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const current = useCurrentProfile(Boolean(isLoaded && isSignedIn));
  const [role, setRole] = useState<AccountRole>((localStorage.getItem("benchboard-role") as AccountRole) || "client");
  const [name, setName] = useState(user?.fullName ?? "");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (!isLoaded || current.isLoading) return <div className="grid min-h-[100dvh] place-items-center bg-background text-sm text-muted-foreground">Loading your workspace...</div>;
  if (!isSignedIn) return <Redirect to="/" />;
  if (current.data?.role === "consultant") return <Redirect to="/consultant" />;
  if (current.data?.role === "client") return <Redirect to="/client" />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await createAccountProfile({ role, name, title, company, industry });
      localStorage.removeItem("benchboard-role");
      await queryClient.invalidateQueries({ queryKey: currentProfileQueryKey });
      setLocation(result.role === "consultant" ? "/consultant" : "/client");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to finish setup.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[#f7f6ef] px-5 py-10 text-[#183e37] sm:px-8">
      <div className="mx-auto max-w-[920px]">
        <div className="flex items-center justify-between">
          <a href="/" className="font-display text-2xl font-bold tracking-[-0.05em] text-[#17483e]">benchboard</a>
          <span className="text-xs text-[#748078]">{user?.primaryEmailAddress?.emailAddress}</span>
        </div>
        <div className="mt-20 max-w-2xl">
          <div className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.16em] text-[#c16d49]"><Sparkles size={13} /> One last step</div>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,5.4rem)] font-semibold leading-[.94] tracking-[-.07em]">Choose the work<br /><span className="text-[#d4754d]">you bring here.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#69766e]">Your BenchBoard account can represent your independent practice or the team hiring for a project. You can always update the details later.</p>
        </div>
        <form onSubmit={submit} className="mt-12 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-3">
            <button type="button" onClick={() => setRole("consultant")} className={`w-full rounded-2xl border p-5 text-left transition ${role === "consultant" ? "border-[#17483e] bg-[#e7f1e8] shadow-[0_4px_0_#b6c9b5]" : "border-[#d7d8ce] bg-[#fbfaf5] hover:border-[#9ab5a1]"}`}>
              <div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#17483e] text-[#f9f7f0]"><BriefcaseBusiness size={18} /></span><span className="font-mono-ui text-[10px] uppercase tracking-[.12em] text-[#7a887f]">Offer</span></div>
              <h2 className="mt-6 font-display text-xl font-semibold">I&apos;m a consultant</h2>
              <p className="mt-2 text-sm leading-6 text-[#69766e]">Create a profile, offer your services, and get found for the work you do best.</p>
            </button>
            <button type="button" onClick={() => setRole("client")} className={`w-full rounded-2xl border p-5 text-left transition ${role === "client" ? "border-[#d4754d] bg-[#f9eadb] shadow-[0_4px_0_#edc5aa]" : "border-[#d7d8ce] bg-[#fbfaf5] hover:border-[#d7ae94]"}`}>
              <div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#d4754d] text-[#fff7ed]"><Building2 size={18} /></span><span className="font-mono-ui text-[10px] uppercase tracking-[.12em] text-[#7a887f]">Hire</span></div>
              <h2 className="mt-6 font-display text-xl font-semibold">I&apos;m hiring</h2>
              <p className="mt-2 text-sm leading-6 text-[#69766e]">Bring a project brief, search the bench with AI or manually, and hire the right specialist.</p>
            </button>
          </div>
          <div className="rounded-2xl border border-[#d7d8ce] bg-[#fbfaf5] p-6 shadow-[0_15px_40px_rgba(24,62,55,.08)] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold"><UsersRound size={16} className="text-[#246454]" /> Build your workspace</div>
            <div className="mt-6 space-y-4">
              <label className="block"><span className="field-label">Your name</span><input required value={name} onChange={(event) => setName(event.target.value)} className="field-input" placeholder="e.g. Maya Chen" /></label>
              {role === "consultant" ? <label className="block"><span className="field-label">Professional title</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="field-input" placeholder="e.g. Senior product strategist" /></label> : <><label className="block"><span className="field-label">Company</span><input required value={company} onChange={(event) => setCompany(event.target.value)} className="field-input" placeholder="e.g. Northstar Health" /></label><label className="block"><span className="field-label">Industry</span><input required value={industry} onChange={(event) => setIndustry(event.target.value)} className="field-input" placeholder="e.g. Healthcare" /></label></>}
            </div>
            {error && <p className="mt-4 rounded-lg bg-[#f9eadb] px-3 py-2 text-xs font-medium text-[#9a4d32]">{error}</p>}
            <button disabled={pending} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#17483e] px-5 text-sm font-semibold text-[#f9f7f0] shadow-[0_4px_0_#b6c9b5] transition hover:-translate-y-0.5 disabled:opacity-60">{pending ? <><LoaderCircle size={16} className="animate-spin" /> Setting up your workspace</> : <>Continue to BenchBoard <Sparkles size={15} /></>}</button>
          </div>
        </form>
      </div>
    </main>
  );
}