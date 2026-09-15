import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";

const router: IRouter = Router();

const demoAccounts = [
  {
    role: "consultant" as const,
    email: "demo.consultant@example.com",
    password: "BenchBoardDemo1!",
    firstName: "Maya",
    lastName: "Chen",
  },
  {
    role: "client" as const,
    email: "demo.client@example.com",
    password: "BenchBoardDemo1!",
    firstName: "Elena",
    lastName: "Rossi",
  },
];

let ensurePromise: Promise<void> | null = null;

async function ensureDemoAccounts() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      for (const account of demoAccounts) {
        const existing = await clerkClient.users.getUserList({
          emailAddress: [account.email],
          limit: 1,
        });
        if (existing.data.length) continue;
        await clerkClient.users.createUser({
          emailAddress: [account.email],
          password: account.password,
          firstName: account.firstName,
          lastName: account.lastName,
          publicMetadata: { role: account.role },
        });
      }
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  return ensurePromise;
}

router.get("/demo-accounts", async (req, res) => {
  try {
    await ensureDemoAccounts();
    return res.json({
      accounts: demoAccounts.map(({ role, email, password }) => ({ role, email, password })),
    });
  } catch (error) {
    req.log.error({ err: error }, "Unable to provision demo accounts");
    return res.status(500).json({ error: "Demo accounts are temporarily unavailable." });
  }
});

export default router;