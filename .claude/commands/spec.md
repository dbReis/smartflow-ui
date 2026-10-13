# Spec-Driven Development

Request: $ARGUMENTS

Follow this workflow:

1. Read `CLAUDE.md`.
2. Inspect `.claude/docs/specs/` and identify the specification relevant to the user's request.
3. If an existing spec directly covers the requested feature, read it completely and use it as the source of truth.
4. If no spec covers the requested feature, ask the user which specification should be used, or propose a new spec. Do not implement anything until a spec has been agreed.
5. Never silently modify an existing specification to accommodate an implementation. If the request conflicts with an existing specification, report the conflict and ask for clarification.
6. Explain your understanding of the requirements.
7. Propose an implementation plan.
8. Do NOT start implementing until the plan has been presented to the user and approved.
9. Once approved, implement in small steps, or guide the developer through them if they prefer to write the code.
10. Validate the implementation against the spec.
11. Provide a final summary of what was implemented.

For UI features:

- Follow the architecture defined in `CLAUDE.md`.
