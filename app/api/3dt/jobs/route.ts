import { NextResponse } from "next/server";
import { advanceJob, createJob } from "./store";

const ENTITY_TYPES = new Set(["individual", "organization", "system", "collective"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entityName, entityType, vectorScope, dataPayload, timestamp } = body ?? {};

    if (!entityName || typeof entityName !== "string" || !entityName.trim()) {
      return NextResponse.json({ error: "entityName required" }, { status: 400 });
    }

    if (!ENTITY_TYPES.has(entityType)) {
      return NextResponse.json({ error: "entityType invalid" }, { status: 400 });
    }

    if (!vectorScope || typeof vectorScope !== "string" || !vectorScope.trim()) {
      return NextResponse.json({ error: "vectorScope required" }, { status: 400 });
    }

    if (!dataPayload || typeof dataPayload !== "string" || !dataPayload.trim()) {
      return NextResponse.json({ error: "dataPayload required" }, { status: 400 });
    }

    if (!timestamp || typeof timestamp !== "string") {
      return NextResponse.json({ error: "timestamp required" }, { status: 400 });
    }

    const job = createJob({
      entityName: entityName.trim(),
      entityType,
      vectorScope: vectorScope.trim(),
      dataPayload: dataPayload.trim(),
      timestamp
    });

    const updated = advanceJob(job);

    return NextResponse.json({ jobId: updated.jobId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
