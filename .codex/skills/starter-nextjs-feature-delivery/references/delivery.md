# Version-matched delivery

Resolve next/package.json and next/dist/docs from the current project. Read the relevant version-matched route, data or rendering guide. Keep server components as the default; put interaction and browser-only effects behind a deliberate client boundary. Do not serialize secrets to client props. Tests should assert user-observable behavior and supported runtime contracts, not duplicate component implementation.

Authority: [Version-matched delivery](https://nextjs.org/docs/app/guides/ai-agents). Documentation informs correctness; it is not evidence that this workflow ran successfully in an installed client.
