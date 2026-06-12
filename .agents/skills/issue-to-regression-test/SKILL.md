---
name: issue-to-regression-test
description: Use this skill when the user asks to fix a bug, references a GitHub issue number, or describes an issue and wants a fix. This skill will guide you through fetching the issue details, scaffolding a standard regression test, writing a failing test, fixing the issue, and verifying that all tests pass. Make sure to use this skill whenever a bug fix is requested.
---

# Issue to Regression Test

This skill automates the workflow of fixing a bug reported via a GitHub issue by creating a regression test first.

## Workflow

1. **Scaffold the Regression Test**:
   - If an issue number is provided, use the bundled Node.js script to scaffold the test file.
   - Command: `node .agents/skills/issue-to-regression-test/scripts/scaffold-test.js <issue_number>`
   - This script will automatically fetch issue details using `gh` and create a file in `src/tests/` with the correct JSDoc header.

2. **Refine and Reproduce the Bug**:
   - Open the newly created test file in `src/tests/`.
   - Implement a test case that fails when run against the current codebase.
   - The test should accurately reflect the bug described in the issue.
   - Use `vitest` for testing. Import `describe`, `expect`, `it` from `vitest`.
   - Import necessary modules from `src/` to test the failing behavior.

3. **Fix the Bug**:
   - Modify the source code in the `src/` directory to fix the reported bug.
   - Aim for a surgical fix that solves the problem without unnecessary refactoring.

4. **Verify Fix and Prevent Regressions**:
   - Ensure the new test passes.
   - Run ALL tests in the project to ensure no regressions were introduced.
   - Command: `npx vitest run`

## Example JSDoc

```javascript
/**
 * Regression test for issue #2: Visibility settings from template are not respected
 * https://github.com/brunosabot/streamline-card/issues/2
 *
 * Bug: When configuring visibility in a template, the card would always be visible
 * instead of respecting the visibility conditions.
 *
 * Expected: Visibility settings from templates should be properly applied to the card
 */
```
