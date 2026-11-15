# Repository Guidelines

## Project Structure & Module Organization

This workspace currently contains `Sorted — Business Requirements Document v1.3.docx`, the requirements reference for Sorted, and this contributor guide. Sorted V1 is a single-user, offline Android task-management app with a minimum Android version of 8.0 (API 26).

There are no source modules, test directories, assets, dependency manifests, or build scripts yet. When implementation begins, document the actual module layout here; do not treat proposed directories or technologies as established conventions.

## Build, Test, and Development Commands

No build, test, lint, or local-run commands are configured. Review the requirements document in Word or another DOCX viewer before making product changes. In PowerShell, `Get-ChildItem -Force` lists the workspace contents.

When adding the application scaffold, include reproducible setup instructions and the exact build, test, and run commands supported by its checked-in tooling.

## Coding Style & Naming Conventions

No programming language, indentation standard, formatter, or linter has been selected. Follow the conventions of the eventual scaffold and document its formatter and lint commands here. Keep Markdown concise, use descriptive headings, and put commands and paths in backticks.

Use the requirements document's entity names consistently: Task, Project, and Meeting. Preserve original capture text and the specified UUIDs, timestamps, state history, and soft-delete behavior.

## Testing Guidelines

No test framework or coverage threshold exists. Use section 9 of the requirements document as the acceptance checklist. Implementation tests should cover readiness validation, missed-task handling, review limits, offline operation, and complete exports. Verify reminder behavior after reboot and during Doze; acceptance requires testing on at least three device brands. Record tested devices and results.

## Commit & Pull Request Guidelines

This workspace has no Git history from which to infer commit conventions. Use concise, imperative subjects, such as `docs: clarify weekly review acceptance criteria`.

For pull requests, describe the change, reference the relevant requirement or issue, and report validation results. Include screenshots for UI changes and flag unresolved product decisions rather than silently choosing behavior.

## Product Scope & Privacy

Keep V1 local and offline; accounts, cloud sync, and collaboration are outside its scope. Notification Listener access is optional and off by default; store notification content only after an accepted suggestion. Keep credentials and real personal task data out of contributions. Resolve relevant open questions in section 10 before implementing dependent behavior.
