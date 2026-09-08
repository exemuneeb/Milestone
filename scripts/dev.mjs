import { spawn } from "node:child_process";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const environment = {
  ...process.env,
  PORT: process.env.PORT ?? "5173",
  BASE_PATH: process.env.BASE_PATH ?? "/",
  VITE_API_TARGET: process.env.VITE_API_TARGET ?? "http://localhost:8080",
};

const child = spawn(
  pnpmCommand,
  ["--filter", "@workspace/benchboard", "run", "dev"],
  {
    env: environment,
    stdio: "inherit",
  },
);

const forwardSignal = (signal) => {
  if (!child.killed) child.kill(signal);
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});