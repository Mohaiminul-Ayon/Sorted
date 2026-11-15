# Harden exports and verify complete data copies

Priority: Medium · Branch: `feature/export-hardening`

## User experience and benefit

A user exports before changing devices or clearing browser data and can verify that tasks, client context and histories are included. Export is the only V1 backup mechanism.

## Acceptance

- Version/document the JSON schema, relationships and soft deletes.
- Verify entities, UUIDs, contexts, histories and settings are complete.
- Test CSV quoting, formula protection, Unicode and large collections.
- Handle storage/export failures without discarding existing data.
- Document browser-origin separation and safe transfer expectations.
- Keep import/restore outside V1 unless the owner explicitly expands scope.
