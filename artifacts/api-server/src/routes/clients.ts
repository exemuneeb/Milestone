import { Router, type IRouter } from "express";
import {
  CreateClientBody,
  CreateClientResponse,
  ListClientsResponse,
  UpdateClientBody,
  UpdateClientParams,
  UpdateClientResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import { clientsTable, projectsTable } from "@workspace/db";
import { asc, eq, and } from "drizzle-orm";
import { getUserId, requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
let seedPromise: Promise<void> | null = null;

export async function ensureClientSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await db.select({ id: clientsTable.id }).from(clientsTable).limit(1);
      if (existing.length > 0) return;

      await db.transaction(async (tx) => {
        const clients = await tx
          .insert(clientsTable)
          .values([
            {
              name: "Elena Rossi",
              company: "Northstar Health",
              industry: "Healthcare",
              bio: "A thoughtful partner building patient-first digital products.",
              rating: 4.9,
            },
            {
              name: "Daniel Okafor",
              company: "Meridian Commerce",
              industry: "Retail technology",
              bio: "Fast-moving product team with a clear appetite for measurable outcomes.",
              rating: 4.8,
            },
            {
              name: "Aisha Rahman",
              company: "Harborline Capital",
              industry: "Financial services",
              bio: "A strategic client for transformation, operating model, and data work.",
              rating: 4.7,
            },
          ])
          .returning({ id: clientsTable.id });

        await tx.insert(projectsTable).values([
          {
            clientId: clients[0].id,
            name: "Northstar patient experience",
            description:
              "Redesign the patient onboarding journey and service blueprint across digital and in-person touchpoints.",
            skills: ["Service design", "Customer research", "Healthcare"],
            status: "active",
            budget: 85000,
            startDate: "2026-07-01",
            endDate: "2026-10-30",
          },
          {
            clientId: clients[1].id,
            name: "Meridian growth reset",
            description:
              "Create a new B2B commerce growth strategy with pricing, customer segmentation, and launch planning.",
            skills: ["Product strategy", "Pricing", "B2B SaaS"],
            status: "planning",
            budget: 110000,
            startDate: "2026-10-15",
            endDate: "2027-01-30",
          },
          {
            clientId: clients[2].id,
            name: "Harborline operating model",
            description:
              "Define a future-ready operating model for a growing investment platform and its data teams.",
            skills: ["Operating model", "Change management", "Data strategy"],
            status: "active",
            budget: 140000,
            startDate: "2026-06-15",
            endDate: "2026-12-15",
          },
        ]);
      });
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  return seedPromise;
}

router.get("/clients", async (req, res) => {
  try {
    await ensureClientSeedData();
    const clients = await db
      .select()
      .from(clientsTable)
      .orderBy(asc(clientsTable.rating), asc(clientsTable.company));
    return res.json(ListClientsResponse.parse(clients.reverse()));
  } catch (error) {
    req.log.error({ err: error }, "Unable to list clients");
    return res.status(500).json({ error: "We couldn't load the client directory." });
  }
});

router.post("/clients", requireAuth, async (req, res) => {
  try {
    const body = CreateClientBody.parse(req.body);
    const [client] = await db
      .insert(clientsTable)
      .values({
        name: body.name.trim(),
        ownerId: getUserId(req),
        company: body.company.trim(),
        industry: body.industry.trim(),
        bio: body.bio?.trim() ?? "",
      })
      .returning();
    return res.status(201).json(CreateClientResponse.parse(client));
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Check the client profile details and try again." });
    }
    req.log.error({ err: error }, "Unable to create client");
    return res.status(500).json({ error: "We couldn't create that client profile." });
  }
});

router.patch("/clients/:id", requireAuth, async (req, res) => {
  try {
    const { id } = UpdateClientParams.parse(req.params);
    const body = UpdateClientBody.parse(req.body);
    const [client] = await db
      .update(clientsTable)
      .set({
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.company !== undefined ? { company: body.company.trim() } : {}),
        ...(body.industry !== undefined ? { industry: body.industry.trim() } : {}),
        ...(body.bio !== undefined ? { bio: body.bio.trim() } : {}),
      })
      .where(and(eq(clientsTable.id, id), eq(clientsTable.ownerId, getUserId(req)!)))
      .returning();
    if (!client) return res.status(404).json({ error: "That client profile no longer exists." });
    return res.json(UpdateClientResponse.parse(client));
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Check the client profile details and try again." });
    }
    req.log.error({ err: error }, "Unable to update client");
    return res.status(500).json({ error: "We couldn't update that client profile." });
  }
});

export default router;