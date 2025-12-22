"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../styles/IntakeProtocolPanel.module.css";

type JobStatus = "pending" | "running" | "complete" | "failed";

type JobArtifact = {
  type: string;
  url: string;
  label: string;
};

type JobResponse = {
  jobId: string;
  status: JobStatus;
  progress: number;
  message: string;
  artifacts: JobArtifact[];
};

type FormState = {
  entityName: string;
  entityType: "individual" | "organization" | "system" | "collective";
  vectorScope: string;
  dataPayload: string;
  timestamp: string;
};

const initialFormState = (): FormState => ({
  entityName: "",
  entityType: "individual",
  vectorScope: "",
  dataPayload: "",
  timestamp: new Date().toISOString()
});

const vectorScopeOptions = [
  "global",
  "regional",
  "node",
  "cluster",
  "experimental"
];

export default function IntakeProtocolPanel() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const validate = (state: FormState) => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!state.entityName.trim()) {
      newErrors.entityName = "Required";
    }
    if (!state.entityType) {
      newErrors.entityType = "Required";
    }
    if (!state.vectorScope.trim()) {
      newErrors.vectorScope = "Select a scope";
    }
    if (!state.dataPayload.trim()) {
      newErrors.dataPayload = "Required";
    }
    if (!state.timestamp.trim()) {
      newErrors.timestamp = "Required";
    }
    return newErrors;
  };

  const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form]);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const reset = () => {
    setForm(initialFormState());
    setErrors({});
    setIsSubmitting(false);
    setJob(null);
    setJobId(null);
    setPolling(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/3dt/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = typeof errorBody?.error === "string" ? errorBody.error : "Submission failed";
        setErrors((prev) => ({ ...prev, dataPayload: message }));
        return;
      }

      const data = (await response.json()) as { jobId: string };
      setJobId(data.jobId);
      setPolling(true);
    } catch (error) {
      setErrors((prev) => ({ ...prev, dataPayload: "Network error" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!jobId || !polling) return;

    const poll = async () => {
      try {
        const response = await fetch(`/api/3dt/jobs/${jobId}`);
        if (!response.ok) return;
        const payload = (await response.json()) as JobResponse;
        setJob(payload);
        if (payload.status === "complete" || payload.status === "failed") {
          setPolling(false);
        }
      } catch (error) {
        // swallow errors and continue polling
      }
    };

    const intervalId = setInterval(poll, 1500);
    poll();

    return () => clearInterval(intervalId);
  }, [jobId, polling]);

  const renderArtifacts = () => {
    if (!job || job.artifacts.length === 0) return null;
    return (
      <div className={styles.artifactBlock}>
        <div className={styles.sectionLabel}>Artifacts</div>
        <ul className={styles.artifactList}>
          {job.artifacts.map((artifact) => (
            <li key={artifact.url} className={styles.artifactItem}>
              <span className={styles.artifactType}>{artifact.type}</span>
              <a href={artifact.url} target="_blank" rel="noreferrer" className={styles.artifactLink}>
                {artifact.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderStatus = () => {
    if (!jobId) return null;
    const progressValue = job?.progress ?? 0;
    const statusLabel = job?.status ?? "pending";
    const message = job?.message ?? "Intake queued";
    return (
      <div className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <div className={styles.statusTitle}>Job Status</div>
          <div className={styles.statusMeta}>ID: {jobId}</div>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressValue}%` }} />
        </div>
        <div className={styles.statusLine}>
          <span className={styles.statusTag}>{statusLabel}</span>
          <span>{progressValue}%</span>
        </div>
        <div className={styles.statusMessage}>{message}</div>
        {renderArtifacts()}
        {(job?.status === "complete" || job?.status === "failed") && (
          <button type="button" className={styles.secondaryButton} onClick={reset}>
            Restart Intake
          </button>
        )}
      </div>
    );
  };

  const fieldClass = (key: keyof FormState) =>
    `${styles.input} ${errors[key] ? styles.inputError : ""}`.trim();

  return (
    <div className={styles.shell}>
      <div className={styles.header}>WIRED CHAOS Intake Protocol</div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.label}>
          <span className={styles.labelText}>Entity Name</span>
          <input
            className={fieldClass("entityName")}
            value={form.entityName}
            onChange={(e) => handleChange("entityName", e.target.value)}
            placeholder="Call sign or handle"
            autoComplete="off"
          />
          {errors.entityName && <span className={styles.error}>{errors.entityName}</span>}
        </label>

        <label className={styles.label}>
          <span className={styles.labelText}>Entity Type</span>
          <div className={styles.radioGroup}>
            {(
              ["individual", "organization", "system", "collective"] as FormState["entityType"][]
            ).map((option) => (
              <label key={option} className={styles.radioOption}>
                <input
                  type="radio"
                  name="entityType"
                  value={option}
                  checked={form.entityType === option}
                  onChange={(e) => handleChange("entityType", e.target.value as FormState["entityType"])}
                />
                <span className={styles.radioLabel}>{option}</span>
              </label>
            ))}
          </div>
          {errors.entityType && <span className={styles.error}>{errors.entityType}</span>}
        </label>

        <label className={styles.label}>
          <span className={styles.labelText}>Vector Scope</span>
          <select
            className={fieldClass("vectorScope")}
            value={form.vectorScope}
            onChange={(e) => handleChange("vectorScope", e.target.value)}
          >
            <option value="">Select scope</option>
            {vectorScopeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.vectorScope && <span className={styles.error}>{errors.vectorScope}</span>}
        </label>

        <label className={styles.label}>
          <span className={styles.labelText}>Data Payload</span>
          <textarea
            className={`${fieldClass("dataPayload")} ${styles.textArea}`}
            value={form.dataPayload}
            onChange={(e) => handleChange("dataPayload", e.target.value)}
            placeholder="Signals, constraints, payload description"
            rows={4}
          />
          {errors.dataPayload && <span className={styles.error}>{errors.dataPayload}</span>}
        </label>

        <label className={styles.label}>
          <span className={styles.labelText}>Timestamp</span>
         <input
            className={fieldClass("timestamp")}
            type="datetime-local"
            value={form.timestamp.slice(0, 16)}
            onChange={(e) => {
              const nextValue = e.target.value;
              if (!nextValue) {
                handleChange("timestamp", "");
                return;
              }
              handleChange("timestamp", new Date(nextValue).toISOString());
            }}
          />
          {errors.timestamp && <span className={styles.error}>{errors.timestamp}</span>}
        </label>

        <div className={styles.actions}>
          <button className={styles.primaryButton} type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Dispatching" : "Launch Intake"}
          </button>
          <button className={styles.secondaryButton} type="button" onClick={reset}>
            Clear
          </button>
        </div>
      </form>
      {renderStatus()}
    </div>
  );
}
