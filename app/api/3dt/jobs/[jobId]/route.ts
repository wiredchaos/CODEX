import { NextResponse } from "next/server";
import { advanceJob, jobStore } from "../store";

type RouteContext = {
  params: { jobId: string };
};

export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = context.params;
  const job = jobStore.get(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const updated = advanceJob(job);

  return NextResponse.json({
    jobId: updated.jobId,
    status: updated.status,
    progress: updated.progress,
    message: updated.message,
    artifacts: updated.artifacts
  });
}
