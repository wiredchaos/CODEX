export type AuditEntry = {
  timestamp: string;
  pr_id: string;
  action: string;
  details: Record<string, unknown>;
};

export type AuditLogger = {
  log: (entry: AuditEntry) => void;
  entries: () => AuditEntry[];
};

export const createAuditLogger = (): AuditLogger => {
  const logStore: AuditEntry[] = [];

  return {
    log: (entry) => {
      logStore.push(entry);
    },
    entries: () => [...logStore],
  };
};
