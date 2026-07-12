export function scheduleKdaoJobs() { return [{ name: 'treasury.snapshot', cron: '0 * * * *' }, { name: 'proposal.close-expired', cron: '*/5 * * * *' }]; }
