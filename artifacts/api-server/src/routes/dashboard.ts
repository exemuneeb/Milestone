import { Router, type IRouter } from "express";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { getRosterRecords, ensureSeedData } from "./consultants";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    await ensureSeedData();
    const rows = await getRosterRecords();
    const endingSoon = rows.filter((row) => {
      if (!row.engagement?.endDate) return false;
      const end = new Date(`${row.engagement.endDate}T00:00:00Z`).getTime();
      const now = Date.now();
      const twoWeeks = now + 14 * 24 * 60 * 60 * 1000;
      return end >= now && end <= twoWeeks;
    }).length;
    res.json(
      GetDashboardSummaryResponse.parse({
        totalConsultants: rows.length,
        available: rows.filter((row) => row.consultant.availabilityStatus === "available").length,
        deployed: rows.filter((row) => row.consultant.availabilityStatus === "deployed").length,
        unavailable: rows.filter((row) => row.consultant.availabilityStatus === "unavailable").length,
        endingSoon,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Unable to load dashboard summary");
    res.status(500).json({ error: "We couldn't load the dashboard summary." });
  }
});

export default router;