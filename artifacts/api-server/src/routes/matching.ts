import { Router, type IRouter } from "express";
import { MatchConsultantsBody, MatchConsultantsResponse } from "@workspace/api-zod";
import { ensureSeedData, getRosterRecords, toClientRecord } from "./consultants";

const router: IRouter = Router();
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-20b";

type Requirements = {
  skills: string[];
  seniority: string | null;
  domain: string | null;
};

type Candidate = {
  record: ReturnType<typeof toClientRecord>;
  matchingSkills: string[];
  score: number;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();
}

function tokens(value: string) {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function parseJson<T>(content: string): T {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  return JSON.parse(cleaned) as T;
}

async function groqJson<T>(system: string, user: string): Promise<T> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured");
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.15,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Groq request failed: ${response.status} ${detail}`);
  }
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response");
  return parseJson<T>(content);
}

function scoreCandidate(
  record: ReturnType<typeof toClientRecord>,
  requirements: Requirements,
): Candidate {
  const required = requirements.skills.map(normalize).filter(Boolean);
  const matchingSkills = record.skills.filter((skill) => {
    const skillName = normalize(skill);
    return required.some(
      (requiredSkill) =>
        skillName.includes(requiredSkill) || requiredSkill.includes(skillName),
    );
  });
  const profileText = normalize(`${record.title} ${record.skills.join(" ")} ${record.engagement?.projectName ?? ""}`);
  const domainMatch = requirements.domain
    ? tokens(requirements.domain).some((token) => profileText.includes(token))
    : false;
  const seniorityMatch = requirements.seniority
    ? profileText.includes(normalize(requirements.seniority))
    : false;
  const skillScore = required.length
    ? matchingSkills.length / required.length
    : 0;
  const score = Math.min(0.99, skillScore * 0.72 + (domainMatch ? 0.18 : 0) + (seniorityMatch ? 0.1 : 0));
  return { record, matchingSkills, score };
}

async function extractRequirements(jobDescription: string) {
  return groqJson<Requirements>(
    "Extract structured staffing requirements. Return JSON only with exactly these keys: skills (array of concise skill names), seniority (string or null), domain (string or null). Do not invent skills that are not supported by the job description.",
    jobDescription,
  );
}

async function explainMatches(requirements: Requirements, candidates: Candidate[]) {
  const candidateProfiles = candidates.map(({ record, matchingSkills, score }) => ({
    id: record.id,
    name: record.name,
    title: record.title,
    skills: record.skills,
    availabilityStatus: record.availabilityStatus,
    engagement: record.engagement
      ? {
          projectName: record.engagement.projectName,
          endDate: record.engagement.endDate,
        }
      : null,
    matchingSkills,
    preliminaryScore: score,
  }));

  return groqJson<{ matches: Array<{ id: number; matchingSkills: string[]; reason: string; score: number }> }>(
    "Rank the supplied consultant candidates for the staffing requirements. Return JSON only with a matches array containing one entry for every supplied candidate, in ranked order. Use only supplied IDs, keep matchingSkills to supplied consultant skills, and write a short specific reason grounded in the supplied profile. Mention availability or engagement timing only when it helps the manager.",
    JSON.stringify({ requirements, candidates: candidateProfiles }),
  );
}

router.post("/matching", async (req, res) => {
  try {
    const { jobDescription } = MatchConsultantsBody.parse(req.body);
    await ensureSeedData();

    const requirements = await extractRequirements(jobDescription);
    const normalizedRequirements: Requirements = {
      skills: Array.isArray(requirements.skills) ? requirements.skills.slice(0, 12) : [],
      seniority: requirements.seniority || null,
      domain: requirements.domain || null,
    };
    const roster = await getRosterRecords();
    const candidates = roster
      .map((row) => scoreCandidate(toClientRecord(row), normalizedRequirements))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    const ranked = await explainMatches(normalizedRequirements, candidates);
    const byId = new Map(ranked.matches.map((match) => [match.id, match]));
    const matches = candidates.map((candidate, index) => {
      const modelMatch = byId.get(candidate.record.id);
      const groundedSkills = modelMatch?.matchingSkills.filter((skill) =>
        candidate.record.skills.includes(skill),
      ) ?? candidate.matchingSkills;
      const fallbackReason = groundedSkills.length
        ? `${candidate.record.name} brings ${groundedSkills.join(", ")} from a ${candidate.record.title} profile.`
        : `${candidate.record.name} is a ${candidate.record.title} whose profile is the closest remaining roster fit for this brief.`;
      return {
        rank: index + 1,
        consultant: candidate.record,
        matchingSkills: groundedSkills,
        reason: modelMatch?.reason || fallbackReason,
        score: modelMatch && Number.isFinite(modelMatch.score)
          ? modelMatch.score
          : candidate.score,
      };
    });

    return res.json(
      MatchConsultantsResponse.parse({
        requirements: normalizedRequirements,
        matches,
      }),
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({
        error: "Paste a job description with a little more detail and try again.",
      });
    }
    req.log.error({ err: error }, "Unable to match consultants");
    return res.status(503).json({
      error: "Matching is temporarily unavailable. Please try again in a moment.",
    });
  }
});

export default router;