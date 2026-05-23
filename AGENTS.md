# Streamline Card

## Project Purpose
A Home Assistant Lovelace custom card that leverages advanced JavaScript and YAML template evaluation to streamline and dynamically render UI configurations.

## Core Tech Stack
- **Languages:** JavaScript (ESM)
- **Build System:** Vite
- **Package Manager:** pnpm

## Operational Commands
- **Install dependencies:** `pnpm install`
- **Run tests:** `pnpm test`
- **Enforce styling:** `pnpm lint --fix` (Rely entirely on this command for code style determinism. Do not manually format code.)
- **Build project:** `pnpm build`

## Key Directories & Progressive Disclosure
- `src/`: Core card logic, template evaluation, and helpers.
- `src/tests/`: Test specs, mock helpers, and Home Assistant fixtures.
- `examples/`: Card configuration examples.
- **Task Playbooks:** Deep agent workflows and skills live in `.agents/skills/` (e.g., `issue-to-regression-test`, `changelog-generator`). Read these *exclusively* when relevant to the immediate task.

## Architectural & Execution Rules

### 1. Karpathy's Axioms
- **Ask, don't assume:** Flag ambiguity and unstated assumptions before writing any code.
- **Simplest solution first:** Implement exactly what was asked. No speculative abstractions.
- **Isolate the blast radius:** Only modify code directly related to the task.
- **Flag uncertainty explicitly.**

### 2. Goal-Driven Execution (EPIC Workflow)
Transform imperative tasks into verifiable goals using the following loop:
1. **Explore:** Map data flow and identify dependencies (especially the `hass` object).
2. **Plan:** Define explicit, verifiable success criteria.
3. **Implement:** Write code. If fixing a bug, write a failing regression test first.
4. **Commit:** Verify `pnpm test` and linters pass before concluding.

### 3. Constraints & Quirks
- **Home Assistant Environment:** Strict reliance on the simulated `hass` API defined in `src/__fixtures__/hass.fixture.js`.
- **Linter Deference:** Never introduce explicit style rules in planning. Run formatting commands to finalize code structure.