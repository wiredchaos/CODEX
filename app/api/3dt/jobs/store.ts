import crypto from "crypto";

export type JobStatus = "pending" | "running" | "complete" | "failed";

export type JobRecord = {
  jobId: string;
  entityName: string;
  entityType: "individual" | "organization" | "system" | "collective";
  vectorScope: string;
  dataPayload: string;
  timestamp: string;
  status: JobStatus;
  progress: number;
  message: string;
  artifacts: { type: string; url: string; label: string }[];
  createdAt: number;
  updatedAt: number;
};

type JobStore = Map<string, JobRecord>;

const globalStore = globalThis as typeof globalThis & { __jobStore?: JobStore };

if (!globalStore.__jobStore) {
  globalStore.__jobStore = new Map<string, JobRecord>();
}

export const jobStore = globalStore.__jobStore;

export function createJob(payload: Omit<JobRecord, "jobId" | "status" | "progress" | "message" | "artifacts" | "createdAt" | "updatedAt">): JobRecord {
  const jobId = crypto.randomUUID();
  const now = Date.now();
  const record: JobRecord = {
    jobId,
    ...payload,
    status: "pending",
    progress: 0,
    message: "Intake queued",
    artifacts: [],
    createdAt: now,
    updatedAt: now
  };
  jobStore.set(jobId, record);
  return record;
}

function buildArtifacts(jobId: string) {
  return [
    {
      type: "log",
      url: `/artifacts/${jobId}/intake.log`,
      label: "Intake log"
    },
    {
      type: "payload",
      url: `/artifacts/${jobId}/payload.json`,
      label: "Captured payload"
    }
  ];
}

export function advanceJob(job: JobRecord): JobRecord {
  const now = Date.now();
  const elapsed = now - job.createdAt;

  if (job.status === "complete" || job.status === "failed") {
    return job;
  }

  let status: JobStatus = job.status;
  let progress = job.progress;
  let message = job.message;
  let artifacts = job.artifacts;

  if (elapsed < 2000) {
    status = "pending";
    progress = Math.max(progress, 10);
    message = "Queued";
  } else if (elapsed < 6000) {
    status = "running";
    progress = Math.max(progress, 35 + Math.floor((elapsed - 2000) / 40));
    message = "Routing vectors";
  } else if (elapsed < 9000) {
    status = "running";
    progress = Math.max(progress, 70 + Math.floor((elapsed - 6000) / 30));
    message = "Stabilizing intake";
  } else {
    status = "complete";
    progress = 100;
    message = "Intake sealed";
    artifacts = buildArtifacts(job.jobId);
  }

  const updated: JobRecord = {
    ...job,
    status,
    progress: Math.min(progress, 100),
    message,
    artifacts,
    updatedAt: now
  };
  jobStore.set(job.jobId, updated);
  return updated;
}
