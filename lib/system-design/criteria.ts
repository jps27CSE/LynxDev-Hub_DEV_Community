/**
 * Which claimed pass criteria still need a server-side simulation.
 *
 * Verifying criteria on the server is what stops a learner forging a pass, so
 * it cannot be skipped on trust. But it is also the most expensive thing this
 * module does (`simulate()` costs ~200–500 ms of CPU per call), and the client
 * saves every 2 s of idle time — so the vast majority of saves claim nothing at
 * all and have nothing to verify.
 *
 * A criterion only needs re-checking when it is claimed *and* not already
 * stored for this task. Two cases fall out of that for free:
 *
 * 1. Autosaves (`criteriaMet` absent) return `[]` — no simulation.
 * 2. A replayed save whose criteria are all earned returns `[]` — no
 *    simulation. This also absorbs the duplicate POST that
 *    `acceptSimulationResult` produces when it re-arms the debounce effect.
 *
 * Only ids returned here are ever merged into `criteriaMet`, so skipping the
 * simulation can never grant anything: the merge still unions the server's own
 * stored set.
 *
 * Pure and DB-free by design — the route passes in what it read from TiDB, so
 * this can be tested without a database (see `.agent/ENGINEERING.md`).
 */
export function criteriaNeedingVerification(
  requested: Iterable<string>,
  alreadyMet: Iterable<string>,
): string[] {
  const met = new Set(alreadyMet);
  const pending = new Set<string>();
  for (const id of requested) {
    if (!met.has(id)) pending.add(id);
  }
  return [...pending];
}
