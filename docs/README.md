# Application pattern guide

This directory documents optional patterns that recur across maintained applications.
The boilerplate stays deliberately small: these guides explain when to add a capability,
which contracts to preserve, and how to validate it without making every new project
inherit the same product dependencies.

The guidance is distilled from working application patterns and rewritten for public
use. It does not reproduce project data, private repository details, infrastructure
identifiers, production configuration, customer information, or credentials.

## Guides

| Guide                                                   | Use it when                                               |
| ------------------------------------------------------- | --------------------------------------------------------- |
| [Application architecture](application-architecture.md) | Deciding where routes, state, contracts, and effects live |
| [Forms](forms.md)                                       | Adding validated, accessible, failure-aware forms         |
| [XState](xstate.md)                                     | Modeling a workflow with meaningful states and events     |
| [Coding agents](coding-agents.md)                       | Defining safe repository-local instructions for agents    |
| [Publication safety](publication-safety.md)             | Preparing code or documentation for a public repository   |

## How to use these patterns

1. Start with the product requirement and the smallest architecture that satisfies it.
2. Adopt a guide only when its triggering complexity exists in the product.
3. Record provider, persistence, analytics, or security choices in the product
   repository.
4. Add tests for the contract, not the current implementation shape.
5. Keep the repository's canonical quality gate and public-safety review green.

Examples in these guides are illustrative. They do not add dependencies to this starter,
select a deployment provider, or authorize a production change.

## Evidence vocabulary

Keep these claims separate in documentation and pull requests:

- **Documented**: a pattern or decision is written down.
- **Implemented**: code exists on a specific commit.
- **Validated**: named checks passed on that exact commit.
- **Merged**: the commit is reachable from the target branch.
- **Deployed**: an identified environment serves the merged behavior.
- **Verified**: the intended behavior was observed in that environment.

One claim never implies the next. This is especially important for agent-authored
changes, security controls, data migrations, and provider configuration.
