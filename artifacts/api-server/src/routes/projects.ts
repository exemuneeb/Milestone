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
import { clientsTable, projectsTable } from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";

const router: IRouter = Router();

function dateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

router.get("/projects", async (req, res) => {
  try {
    const { clientId } = ListProjectsQueryParams.parse(req.query);
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.clientId, clientId))
      .orderBy(asc(projectsTable.status), asc(projectsTable.name));
    return res.json(ListProjectsResponse.parse(projects));
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Choose a client before loading projects." });
    }
    req.log.error({ err: error }, "Unable to list projects");
    return res.status(500).json({ error: "We couldn't load the project list." });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const body = CreateProjectBody.parse(req.body);
    const [client] = await db
      .select({ id: clientsTable.id })
      .from(clientsTable)
      .where(eq(clientsTable.id, body.clientId))
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

router.patch("/projects/:id", async (req, res) => {
  try {
    const { id } = UpdateProjectParams.parse(req.params);
    const body = UpdateProjectBody.parse(req.body);
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

router.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = DeleteProjectParams.parse(req.params);
    const deleted = await db
      .delete(projectsTable)
      .where(and(eq(projectsTable.id, id)))
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