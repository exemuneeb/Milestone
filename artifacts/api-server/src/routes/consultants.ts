import { Router, type IRouter } from "express";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import {
  CreateConsultantBody,
  CreateConsultantResponse,
  DeleteConsultantParams,
  ListConsultantsQueryParams,
  ListConsultantsResponse,
  UpdateConsultantBody,
  UpdateConsultantParams,
  UpdateConsultantResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import {
  consultantsTable,
  engagementsTable,
  type Consultant,
  type Engagement,
} from "@workspace/db";
import { ensureClientSeedData } from "./clients";
import { getUserId, requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
let seedPromise: Promise<void> | null = null;

type RosterRecord = {
  consultant: Consultant;
  engagement: Engagement | null;
};

function dateOnly(daysFromToday: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function toDateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

export function toClientRecord(row: RosterRecord) {
  return {
    ...row.consultant,
    engagement: row.engagement
      ? {
          id: row.engagement.id,
          projectName: row.engagement.projectName,
          startDate: row.engagement.startDate,
          endDate: row.engagement.endDate,
        }
      : null,
  };
}

export async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureClientSeedData();
      const existing = await db
        .select({ id: consultantsTable.id })
        .from(consultantsTable)
        .limit(1);
      if (existing.length > 0) {
        const serviceDefaults: Record<string, string[]> = {
          "Maya Chen": ["Product strategy", "Customer discovery", "Go-to-market planning"],
          "Owen Patel": ["Data strategy", "Operations design", "Analytics enablement"],
          "Sofia Martinez": ["Change strategy", "Leadership alignment", "Team enablement"],
          "Marcus Williams": ["Cloud modernization", "Platform architecture", "FinOps"],
          "Priya Shah": ["Program leadership", "Agile delivery", "Stakeholder alignment"],
        };
        const profiles = await db
          .select({
            id: consultantsTable.id,
            name: consultantsTable.name,
            serviceOffers: consultantsTable.serviceOffers,
          })
          .from(consultantsTable);
        await Promise.all(
          profiles
            .filter((profile) => profile.serviceOffers.length === 0 && serviceDefaults[profile.name])
            .map((profile) =>
              db
                .update(consultantsTable)
                .set({ serviceOffers: serviceDefaults[profile.name] })
                .where(eq(consultantsTable.id, profile.id)),
            ),
        );
        return;
      }

      await db.transaction(async (tx) => {
        const consultants = await tx
          .insert(consultantsTable)
          .values([
            {
              name: "Maya Chen",
              title: "Senior Product Consultant",
              skills: ["Product strategy", "Discovery", "B2B SaaS", "Facilitation"],
              serviceOffers: ["Product strategy", "Customer discovery", "Go-to-market planning"],
              hourlyRate: 185,
              availabilityStatus: "deployed",
            },
            {
              name: "Owen Patel",
              title: "Data & Operations Lead",
              skills: ["SQL", "Data modeling", "Looker", "Operations"],
              serviceOffers: ["Data strategy", "Operations design", "Analytics enablement"],
              hourlyRate: 165,
              availabilityStatus: "available",
            },
            {
              name: "Sofia Martinez",
              title: "Change Management Consultant",
              skills: ["Change management", "Training", "Communications", "Healthcare"],
              serviceOffers: ["Change strategy", "Leadership alignment", "Team enablement"],
              hourlyRate: 145,
              availabilityStatus: "deployed",
            },
            {
              name: "Marcus Williams",
              title: "Principal Technology Consultant",
              skills: ["Cloud architecture", "AWS", "Platform engineering", "FinOps"],
              serviceOffers: ["Cloud modernization", "Platform architecture", "FinOps"],
              hourlyRate: 210,
              availabilityStatus: "unavailable",
            },
            {
              name: "Priya Shah",
              title: "Senior Delivery Consultant",
              skills: ["Program management", "Agile delivery", "Stakeholder management", "Retail"],
              serviceOffers: ["Program leadership", "Agile delivery", "Stakeholder alignment"],
              hourlyRate: 155,
              availabilityStatus: "available",
            },
          ])
          .returning({ id: consultantsTable.id });

        await tx.insert(engagementsTable).values([
          {
            consultantId: consultants[0].id,
            clientId: 1,
            projectName: "Northstar product discovery",
            startDate: dateOnly(-42),
            endDate: dateOnly(8),
          },
          {
            consultantId: consultants[2].id,
            clientId: 3,
            projectName: "CarePath transformation",
            startDate: dateOnly(-76),
            endDate: dateOnly(34),
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

export async function getRosterRecords(filters?: {
  search?: string;
  status?: "available" | "deployed" | "unavailable";
}) {
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(consultantsTable.availabilityStatus, filters.status));
  }
  if (filters?.search) {
    const search = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(consultantsTable.name, search),
        ilike(consultantsTable.title, search),
        sql`array_to_string(${consultantsTable.skills}, ' ') ILIKE ${search}`,
        ilike(engagementsTable.projectName, search),
      ),
    );
  }

  return db
    .select({
      consultant: consultantsTable,
      engagement: engagementsTable,
    })
    .from(consultantsTable)
    .leftJoin(
      engagementsTable,
      eq(consultantsTable.id, engagementsTable.consultantId),
    )
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(consultantsTable.name);
}

router.get("/consultants", async (req, res) => {
  try {
    await ensureSeedData();
    const query = ListConsultantsQueryParams.parse(req.query);
    const rows = await getRosterRecords({
      search: query.search?.trim() || undefined,
      status: query.status,
    });
    res.json(ListConsultantsResponse.parse(rows.map(toClientRecord)));
  } catch (error) {
    req.log.error({ err: error }, "Unable to list consultants");
    res.status(500).json({ error: "We couldn't load the consultant roster." });
  }
});

router.post("/consultants", requireAuth, async (req, res) => {
  try {
    const body = CreateConsultantBody.parse(req.body);
    const isDeployed = body.availabilityStatus === "deployed";
    if (
      isDeployed &&
      (!body.projectName || !body.engagementStartDate || !body.engagementEndDate)
    ) {
      return res.status(400).json({
        error: "Add a project and end date for a deployed consultant.",
      });
    }

    const created = await db.transaction(async (tx) => {
      const [consultant] = await tx
        .insert(consultantsTable)
        .values({
          name: body.name.trim(),
          ownerId: getUserId(req),
          title: body.title.trim(),
          skills: body.skills.map((skill) => skill.trim()).filter(Boolean),
          serviceOffers: (body.serviceOffers ?? []).map((service) => service.trim()).filter(Boolean),
          hourlyRate: body.hourlyRate,
          availabilityStatus: body.availabilityStatus,
        })
        .returning();

      if (isDeployed) {
        await tx.insert(engagementsTable).values({
          consultantId: consultant.id,
          projectName: body.projectName!.trim(),
          startDate: toDateOnly(body.engagementStartDate)!,
          endDate: toDateOnly(body.engagementEndDate)!,
        });
      }
      return consultant.id;
    });

    const [row] = await getRosterRecords().then((rows) =>
      rows.filter((item) => item.consultant.id === created),
    );
    return res.status(201).json(CreateConsultantResponse.parse(toClientRecord(row)));
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Check the consultant details and try again." });
    }
    req.log.error({ err: error }, "Unable to create consultant");
    return res.status(500).json({ error: "We couldn't add that consultant." });
  }
});

router.patch("/consultants/:id", requireAuth, async (req, res) => {
  try {
    const { id } = UpdateConsultantParams.parse(req.params);
    const body = UpdateConsultantBody.parse(req.body);
    const currentRows = await getRosterRecords();
    const current = currentRows.find((row) => row.consultant.id === id && row.consultant.ownerId === getUserId(req));
    if (!current) return res.status(404).json({ error: "That consultant no longer exists." });

    const nextStatus = body.availabilityStatus ?? current.consultant.availabilityStatus;
    const nextProject = body.projectName === undefined
      ? current.engagement?.projectName
      : body.projectName;
    const nextStart = body.engagementStartDate === undefined
      ? current.engagement?.startDate
      : toDateOnly(body.engagementStartDate);
    const nextEnd = body.engagementEndDate === undefined
      ? current.engagement?.endDate
      : toDateOnly(body.engagementEndDate);

    if (nextStatus === "deployed" && (!nextProject || !nextStart || !nextEnd)) {
      return res.status(400).json({
        error: "Add a project and end date for a deployed consultant.",
      });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(consultantsTable)
        .set({
          ...(body.name !== undefined ? { name: body.name.trim() } : {}),
          ...(body.title !== undefined ? { title: body.title.trim() } : {}),
          ...(body.skills !== undefined
            ? { skills: body.skills.map((skill) => skill.trim()).filter(Boolean) }
            : {}),
          ...(body.serviceOffers !== undefined
            ? { serviceOffers: body.serviceOffers.map((service) => service.trim()).filter(Boolean) }
            : {}),
          ...(body.hourlyRate !== undefined ? { hourlyRate: body.hourlyRate } : {}),
          availabilityStatus: nextStatus,
        })
        .where(eq(consultantsTable.id, id));

      await tx.delete(engagementsTable).where(eq(engagementsTable.consultantId, id));
      if (nextStatus === "deployed") {
        await tx.insert(engagementsTable).values({
          consultantId: id,
          projectName: nextProject!,
          startDate: nextStart!,
          endDate: nextEnd!,
        });
      }
    });

    const [row] = await getRosterRecords().then((rows) =>
      rows.filter((item) => item.consultant.id === id),
    );
    return res.json(UpdateConsultantResponse.parse(toClientRecord(row)));
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Check the consultant details and try again." });
    }
    req.log.error({ err: error }, "Unable to update consultant");
    return res.status(500).json({ error: "We couldn't update that consultant." });
  }
});

router.delete("/consultants/:id", requireAuth, async (req, res) => {
  try {
    const { id } = DeleteConsultantParams.parse(req.params);
    const deleted = await db
      .delete(consultantsTable)
      .where(and(eq(consultantsTable.id, id), eq(consultantsTable.ownerId, getUserId(req)!)))
      .returning({ id: consultantsTable.id });
    if (!deleted.length) return res.status(404).json({ error: "That consultant no longer exists." });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "That consultant identifier is invalid." });
    }
    req.log.error({ err: error }, "Unable to delete consultant");
    return res.status(500).json({ error: "We couldn't remove that consultant." });
  }
});

export default router;