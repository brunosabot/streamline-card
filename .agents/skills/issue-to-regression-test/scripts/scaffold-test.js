import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

function kebabCase(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function main() {
  const issueNumber = process.argv[2];

  if (!issueNumber) {
    console.error('Usage: node scaffold-test.js <issue_number>');
    process.exit(1);
  }

  try {
    // Fetch issue details using gh
    const result = execSync(`gh issue view ${issueNumber} --json title,body,url`, {
      encoding: 'utf8',
    });
    const issue = JSON.parse(result);

    const title = issue.title;
    const body = issue.body;
    const url = issue.url;

    // Try to extract Bug and Expected from body if they exist
    const bugRegex = /\*\*To Reproduce\*\*(.*?)(?=\*\*Expected behavior\*\*|$)/is;
    const altBugRegex = /Bug:(.*?)(?=Expected:|$)/is;
    let bugMatch = body.match(bugRegex) || body.match(altBugRegex);
    
    let bugDesc = bugMatch ? bugMatch[1].trim() : 'See issue body for details.';
    if (bugDesc.length > 200) bugDesc = bugDesc.slice(0, 200) + '...';

    const expectedRegex = /\*\*Expected behavior\*\*(.*?)(?=\n\n|\*\*Screenshots\*\*|\Z)/is;
    const altExpectedRegex = /Expected:(.*?)(?=\n\n|\Z)/is;
    let expectedMatch = body.match(expectedRegex) || body.match(altExpectedRegex);
    
    let expectedDesc = expectedMatch ? expectedMatch[1].trim() : 'See issue body for details.';
    if (expectedDesc.length > 200) expectedDesc = expectedDesc.slice(0, 200) + '...';

    const fileName = `issue-${issueNumber}-${kebabCase(title)}.test.js`;
    const filePath = join('src', 'tests', fileName);

    const content = `import { describe, expect, it } from "vitest";
import evaluateConfig from "../evaluateConfig-helper.js";

/**
 * Regression test for issue #${issueNumber}: ${title}
 * ${url}
 *
 * Bug: ${bugDesc.replace(/\n/g, '\n * ')}
 *
 * Expected: ${expectedDesc.replace(/\n/g, '\n * ')}
 */
describe("Issue #${issueNumber} - ${title}", () => {
  it("should reproduce the bug", () => {
    // TODO: Implement reproduction case
    // const templateConfig = { ... };
    // const hass = { states: {} };
    // const result = evaluateConfig(templateConfig, {}, { hass });
    // expect(result).toBeDefined();
  });
});
`;

    mkdirSync(join('src', 'tests'), { recursive: true });
    writeFileSync(filePath, content);
    console.log(`Successfully scaffolded test file: ${filePath}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
