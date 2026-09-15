import { Router, type IRouter } from "express";
import {
  CreateProjectBody,
  CreateProjectResponse,
  DeleteProjectParams,
  ListProjectsQueryParams,
  ListProjectsResponse,
  UpdateProjectBody,
  UpdateProjectParams,
  UpdateProjectResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import { clientsTable, consultantsTable, engagementsTable, projectsTable } from "@workspace/db";
import { and, asc, eq, sql } from "drizzle-orm";
import { getUserId, requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function dateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

router.get("/projects", requireAuth, async (req, res) => {
  try {
    const { clientId } = ListProjectsQueryParams.parse(req.query);
    const rows = await db
      .select({ project: projectsTable })
      .from(projectsTable)
      .innerJoin(clientsTable, eq(projectsTable.clientId, clientsTable.id))
      .where(and(eq(projectsTable.clientId, clientId), eq(clientsTable.ownerId, getUserId(req)!)))
      .orderBy(asc(projectsTable.status), asc(projectsTable.name));
    return res.json(ListProjectsResponse.parse(rows.map((row) => row.project)));
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Choose a client before loading projects." });
    }
    req.log.error({ err: error }, "Unable to list projects");
    return res.status(500).json({ error: "We couldn't load the project list." });
  }
});

router.post("/projects", requireAuth, async (req, res) => {
  try {
    const body = CreateProjectBody.parse(req.body);
    const [client] = await db
      .select({ id: clientsTable.id })
      .from(clientsTable)
      .where(and(eq(clientsTable.id, body.clientId), eq(clientsTable.ownerId, getUserId(req)!)))
      .limit(1);
    if (!client) return res.status(400).json({ error: "Choose an existing client for this project." });

    const [project] = await db
      .insert(projectsTable)
      .values({
        clientId: body.clientId,
        name: body.name.trim(),
        description: body.description.trim(),
        skills: body.skills.map((skill) => skill.trim()).filter(Boolean),
        status: body.status,
        budget: body.budget ?? null,
        startDate: dateOnly(body.startDate),
        endDate: dateOnly(body.endDate),
      })
      .returning();
    return res.status(201).json(CreateProjectResponse.parse(project));
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Add a project name and at least 20 characters of detail." });
    }
    req.log.error({ err: error }, "Unable to create project");
    return res.status(500).json({ error: "We couldn't create that project." });
  }
});

router.patch("/projects/:id", requireAuth, async (req, res) => {
  try {
    const { id } = UpdateProjectParams.parse(req.params);
    const body = UpdateProjectBody.parse(req.body);
    const [ownedProject] = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .innerJoin(clientsTable, eq(projectsTable.clientId, clientsTable.id))
      .where(and(eq(projectsTable.id, id), eq(clientsTable.ownerId, getUserId(req)!)))
      .limit(1);
    if (!ownedProject) return res.status(404).json({ error: "That project no longer exists." });
    const [project] = await db
      .update(projectsTable)
      .set({
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description.trim() } : {}),
        ...(body.skills !== undefined ? { skills: body.skills.map((skill) => skill.trim()).filter(Boolean) } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.budget !== undefined ? { budget: body.budget ?? null } : {}),
        ...(body.startDate !== undefined ? { startDate: dateOnly(body.startDate) } : {}),
        ...(body.endDate !== undefined ? { endDate: dateOnly(body.endDate) } : {}),
      })
      .where(eq(projectsTable.id, id))
      .returning();
    if (!project) return res.status(404).json({ error: "That project no longer exists." });
    return res.json(UpdateProjectResponse.parse(project));
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Check the project details and try again." });
    }
    req.log.error({ err: error }, "Unable to update project");
    return res.status(500).json({ error: "We couldn't update that project." });
  }
});

router.post("/projects/:id/hire", requireAuth, async (req, res) => {
  try {
    const { id } = UpdateProjectParams.parse(req.params);
    const consultantId = Number(req.body?.consultantId);
    if (!Number.isInteger(consultantId) || consultantId <= 0) {
      return res.status(400).json({ error: "Choose a consultant to hire." });
    }

    const [project] = await db
      .select({ project: projectsTable })
      .from(projectsTable)
      .innerJoin(clientsTable, eq(projectsTable.clientId, clientsTable.id))
      .where(and(eq(projectsTable.id, id), eq(clientsTable.ownerId, getUserId(req)!)))
      .limit(1);
    if (!project) return res.status(404).json({ error: "That project no longer exists." });

    const [consultant] = await db
      .select({ id: consultantsTable.id })
      .from(consultantsTable)
      .where(eq(consultantsTable.id, consultantId))
      .limit(1);
    if (!consultant) return res.status(404).json({ error: "That consultant no longer exists." });

    const [engagement] = await db.transaction(async (tx) => {
      const [created] = await tx.insert(engagementsTable).values({
        consultantId,
        clientId: project.project.clientId,
        projectName: project.project.name,
        startDate: project.project.startDate ?? new Date().toISOString().slice(0, 10),
        endDate: project.project.endDate ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      }).returning();
      await tx.update(consultantsTable).set({ availabilityStatus: "deployed" }).where(eq(consultantsTable.id, consultantId));
      return [created];
    });
    return res.status(201).json({ message: "Consultant hired for this project.", engagement });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "That project identifier is invalid." });
    }
    req.log.error({ err: error }, "Unable to hire consultant");
    return res.status(500).json({ error: "We couldn't hire that consultant." });
  }
});

router.delete("/projects/:id", requireAuth, async (req, res) => {
  try {
    const { id } = DeleteProjectParams.parse(req.params);
    const deleted = await db
      .delete(projectsTable)
      .where(and(
        eq(projectsTable.id, id),
        sql`EXISTS (SELECT 1 FROM clients WHERE clients.id = ${projectsTable.clientId} AND clients.owner_id = ${getUserId(req)!})`,
      ))
      .returning({ id: projectsTable.id });
    if (!deleted.length) return res.status(404).json({ error: "That project no longer exists." });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "That project identifier is invalid." });
    }
    req.log.error({ err: error }, "Unable to delete project");
    return res.status(500).json({ error: "We couldn't remove that project." });
  }
});

export default router;