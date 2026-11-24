# Complete Project and Meeting editing and archive rules

Priority: High · Branch: `feature/project-meeting-management`

## User experience and benefit

A client moves a kickoff or renames a Project. The user edits it once while linked tasks keep their relationships and context.

## Acceptance

- Resolve archive/delete semantics and treatment of open linked tasks.
- Replace name-based Project references with stable IDs and migrate existing data safely.
- Edit names, dates, notes, participants, context and target dates.
- Prevent duplicate Project names from corrupting relationships.
- Verify progress excludes deleted tasks and Meeting inheritance remains correct.

## Implementation (code-complete)

- Projects use stable ids, unique names, archive without unlinking, and a labeled soft-delete that unlinks open tasks (BRD #4 default until the owner picks). Meetings store notes, time, optional project; tasks inherit that project when empty.
