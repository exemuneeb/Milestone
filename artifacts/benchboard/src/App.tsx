import { type ReactNode, useEffect, useRef } from "react";
import { ClerkProvider, RedirectToSignIn, useAuth, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Redirect, Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { Shell } from "@/components/shell";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCurrentProfile } from "@/lib/auth";
import { SignInPage, SignUpPage } from "@/pages/auth";
import ClientPortal from "@/pages/client";
import ConsultantPortal from "@/pages/consultant";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import Match from "@/pages/match";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

function AuthCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previousUser = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const nextUser = user?.id ?? null;
      if (previousUser.current !== undefined && previousUser.current !== nextUser) client.clear();
      previousUser.current = nextUser;
    });
    return unsubscribe;
  }, [addListener, client]);

  return null;
}

function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const current = useCurrentProfile(Boolean(isLoaded && isSignedIn));
  if (!isLoaded || (isSignedIn && current.isLoading)) return <div className="grid min-h-[100dvh] place-items-center bg-background text-sm text-muted-foreground">Loading BenchBoard...</div>;
  if (!isSignedIn) return <Landing />;
  if (current.data?.role === "consultant") return <Redirect to="/consultant" />;
  if (current.data?.role === "client") return <Redirect to="/client" />;
  return <Redirect to="/onboarding" />;
}

function ProtectedPortal({ role, children }: { role?: "consultant" | "client"; children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const current = useCurrentProfile(Boolean(isLoaded && isSignedIn));
  if (!isLoaded || (isSignedIn && current.isLoading)) return <div className="grid min-h-[100dvh] place-items-center bg-background text-sm text-muted-foreground">Loading your workspace...</div>;
  if (!isSignedIn) return <RedirectToSignIn />;
  if (!current.data?.role) return <Redirect to="/onboarding" />;
  if (role && current.data.role !== role) return <Redirect to={current.data.role === "consultant" ? "/consultant" : "/client"} />;
  return <Shell>{children}</Shell>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Routes() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/consultant" component={() => <ProtectedPortal role="consultant"><ConsultantPortal /></ProtectedPortal>} />
        <Route path="/client" component={() => <ProtectedPortal role="client"><ClientPortal /></ProtectedPortal>} />
        <Route path="/availability" component={() => <ProtectedPortal><Dashboard /></ProtectedPortal>} />
        <Route path="/match" component={() => <ProtectedPortal><Match /></ProtectedPortal>} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function ClerkApp() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <AuthCacheInvalidator />
        <Routes />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY.");
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkApp />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}