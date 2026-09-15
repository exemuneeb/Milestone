import { useEffect } from "react";
import { Redirect } from "wouter";
import { SignIn, SignUp, useAuth } from "@clerk/react";
import { shadcn } from "@clerk/themes";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const appearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#17483e",
    colorForeground: "#183e37",
    colorMutedForeground: "#6d7971",
    colorDanger: "#b94f4f",
    colorBackground: "#fbfaf5",
    colorInput: "#f4f5ef",
    colorInputForeground: "#183e37",
    colorNeutral: "#d7d8ce",
    fontFamily: "DM Sans, sans-serif",
    borderRadius: "0.85rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#fbfaf5] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-[0_24px_70px_rgba(24,62,55,0.12)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-display text-[#183e37]",
    headerSubtitle: "text-[#6d7971]",
    socialButtonsBlockButtonText: "text-[#183e37]",
    formFieldLabel: "text-[#52655c]",
    footerActionLink: "text-[#246454]",
    footerActionText: "text-[#6d7971]",
    dividerText: "text-[#7a887f]",
    formButtonPrimary: "bg-[#17483e] hover:bg-[#20584e]",
    formFieldInput: "bg-[#f4f5ef] border-[#d7d8ce] text-[#183e37]",
    footerAction: "text-[#6d7971]",
    dividerLine: "bg-[#d7d8ce]",
    alert: "bg-[#f9eadb] text-[#8f4b32]",
    alertText: "text-[#8f4b32]",
    formFieldSuccessText: "text-[#246454]",
  },
};

function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f7f6ef] px-4 py-10">
      <div className="pointer-events-none fixed inset-0 opacity-[0.12]" style={{ backgroundImage: "linear-gradient(#183e37 1px, transparent 1px), linear-gradient(90deg, #183e37 1px, transparent 1px)", backgroundSize: "34px 34px", maskImage: "linear-gradient(to bottom, black, transparent 80%)" }} />
      <div className="relative">
        <div className="mb-5 text-center">
          <a href={basePath || "/"} className="font-display text-2xl font-bold tracking-[-0.05em] text-[#17483e]">benchboard</a>
          <p className="mt-1 text-xs text-[#748078]">A considered marketplace for useful expertise.</p>
        </div>
        {children}
      </div>
    </main>
  );
}

export function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();
  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get("role");
    if (role === "consultant" || role === "client") localStorage.setItem("benchboard-role", role);
  }, []);
  if (isLoaded && isSignedIn) return <Redirect to="/onboarding" />;
  return <AuthFrame><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} appearance={appearance} /></AuthFrame>;
}

export function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();
  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get("role");
    if (role === "consultant" || role === "client") localStorage.setItem("benchboard-role", role);
  }, []);
  if (isLoaded && isSignedIn) return <Redirect to="/onboarding" />;
  return <AuthFrame><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} appearance={appearance} /></AuthFrame>;
}