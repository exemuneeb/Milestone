import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { clientsTable, consultantsTable } from "@workspace/db";
import { requireAuth, getUserId } from "../middlewares/auth";

const router: IRouter = Router();

type Role = "consultant" | "client";

function profileResponse(role: Role, profile: typeof consultantsTable.$inferSelect | typeof clientsTable.$inferSelect) {
  return { role, profile };
}

router.get("/me", requireAuth, async (req, res) => {
  const userId = getUserId(req)!;
  const [consultant] = await db.select().from(consultantsTable).where(eq(consultantsTable.ownerId, userId)).limit(1);
  if (consultant) return res.json(profileResponse("consultant", consultant));
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.ownerId, userId)).limit(1);
  if (client) return res.json(profileResponse("client", client));
  return res.json({ role: null, profile: null });
});

router.post("/me/role", requireAuth, async (req, res) => {
  const userId = getUserId(req)!;
  const role = req.body?.role as Role;
  if (role !== "consultant" && role !== "client") {
    return res.status(400).json({ error: "Choose a consultant or client account." });
  }

  const [existingConsultant] = await db.select().from(consultantsTable).where(eq(consultantsTable.ownerId, userId)).limit(1);
  const [existingClient] = await db.select().from(clientsTable).where(eq(clientsTable.ownerId, userId)).limit(1);
  if (existingConsultant) return res.json(profileResponse("consultant", existingConsultant));
  if (existingClient) return res.json(profileResponse("client", existingClient));

  const name = String(req.body?.name ?? "").trim();
  if (!name) return res.status(400).json({ error: "Add your name to finish setting up your account." });

  if (role === "consultant") {
    const [consultant] = await db.insert(consultantsTable).values({
      ownerId: userId,
      name,
      title: String(req.body?.title ?? "Independent consultant").trim() || "Independent consultant",
      skills: [],
      serviceOffers: [],
      hourlyRate: Number(req.body?.hourlyRate ?? 0) || 0,
      availabilityStatus: "available",
    }).returning();
    return res.status(201).json(profileResponse("consultant", consultant));
  }

  const company = String(req.body?.company ?? "").trim();
  const industry = String(req.body?.industry ?? "").trim();
  if (!company || !industry) {
    return res.status(400).json({ error: "Add your company and industry to finish setup." });
  }
  const [client] = await db.insert(clientsTable).values({
    ownerId: userId,
    name,
    company,
    industry,
    bio: String(req.body?.bio ?? "").trim(),
  }).returning();
  return res.status(201).json(profileResponse("client", client));
});

export default router;