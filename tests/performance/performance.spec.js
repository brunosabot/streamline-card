import { test, expect } from "@playwright/test";

test.describe("Streamline Card Performance", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto("/tests/performance/index.html");
    // Wait for the custom element to be registered
    await page.waitForFunction(() => customElements.get("streamline-card") !== undefined);
  });

  test("Initialisation Workflow: Bulk instantiate 100 cards", async ({ page }) => {
    const metrics = await page.evaluate(async () => {
      const container = document.getElementById("test-container");

      const start = performance.now();

      // Create 100 cards
      const cards = [];
      for (let i = 0; i < 100; i++) {
        const card = document.createElement("streamline-card");
        // Needs a config and variables
        card.setConfig({
          type: "custom:streamline-card",
          template: "complex_template",
          variables: {
            name: `Card ${i}`,
            state: i % 2 === 0 ? "on" : "off",
            bg_color: "red"
          }
        });
        cards.push(card);
        container.appendChild(card);
      }

      const syncEnd = performance.now();

      // Wait for all requestAnimationFrames to flush.
      // We use requestAnimationFrame twice to ensure microtasks and the first rAF are flushed.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const asyncEnd = performance.now();

      return {
        syncDuration: syncEnd - start,
        totalDuration: asyncEnd - start
      };
    });

    console.log(`Initialisation Workflow: Insert: ${metrics.syncDuration.toFixed(2)}ms`);
    console.log(`Initialisation Workflow: Total: ${metrics.totalDuration.toFixed(2)}ms`);

    // We assert that the total duration for 100 cards is within acceptable bounds (e.g. < 500ms)
    // to prove it "loads at the speed of light"
    expect(metrics.syncDuration).toBeLessThan(10);
    expect(metrics.totalDuration).toBeLessThan(25);
  });

  test("Heavy Hass Updates: 10,000 entities on 100 active cards", async ({ page }) => {
    const metrics = await page.evaluate(async () => {
      const container = document.getElementById("test-container");

      // Setup 100 cards first
      const cards = [];
      for (let i = 0; i < 100; i++) {
        const card = document.createElement("streamline-card");
        card.setConfig({
          type: "custom:streamline-card",
          template: "complex_template",
          variables: {
            name: `Card ${i}`,
            state: "on",
            bg_color: "blue"
          }
        });
        cards.push(card);
        container.appendChild(card);
      }

      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      // Generate a massive hass object
      const heavyHass = { states: {} };
      for (let i = 0; i < 10000; i++) {
        heavyHass.states[`sensor.dummy_${i}`] = { state: Math.random().toString(), attributes: { battery: 100 } };
      }

      const start = performance.now();

      // Trigger update on all 100 cards
      for (const card of cards) {
        card.hass = heavyHass;
      }

      const syncEnd = performance.now();

      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const asyncEnd = performance.now();

      return {
        syncDuration: syncEnd - start,
        totalDuration: asyncEnd - start
      };
    });

    console.log(`Heavy Hass Updates: Update: ${metrics.syncDuration.toFixed(2)}ms`);
    console.log(`Heavy Hass Updates: Total: ${metrics.totalDuration.toFixed(2)}ms`);

    // Synchronous block shouldn't freeze the browser for more than 50ms total for 100 cards.
    expect(metrics.syncDuration).toBeLessThan(10);
    expect(metrics.totalDuration).toBeLessThan(25);
  });
});