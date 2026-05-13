# Streamline Card — Technical Audit

> **Date:** 2026-05-13  
> **Branch:** `main`  
> **Scope:** all files under `src/`  
> **Goal:** zero regressions · faster load · no HA main-loop blocking · cleaner architecture

---

## 1. Critical Bugs

### BUG-1 · Null dereference + inverted logic operator in `getTemplates()`
**File:** `streamline-card.js` · lines 178–185

```js
const lovelace = getLovelace() || getLovelaceCast();
if (!lovelace.config && !lovelace.config.streamline_templates) {   // ← CRASH + WRONG
  thrower("...");
}
this._inlineTemplates = lovelace.config.streamline_templates;      // ← also crashes
```

Two independent problems:

1. **Null crash.** Both `getLovelace()` and `getLovelaceCast()` return `null` when HA hasn't finished rendering (see `getLovelace.helper.js` lines 39, 17). When both return `null`, `lovelace` is `null` and `lovelace.config` throws `TypeError` before the guard runs.

2. **Wrong logical operator.** The guard uses `&&`. If `lovelace.config` is falsy, the `&&` short-circuits and `thrower()` is never called — the guard silently passes. Then line 185 crashes accessing `.streamline_templates` on `undefined`. The operator must be `||`.

**Fix:**
```js
const lovelace = getLovelace() || getLovelaceCast();
if (!lovelace?.config?.streamline_templates) {
  thrower("The object streamline_templates doesn't exist…");
  return;
}
this._inlineTemplates = lovelace.config.streamline_templates;
```

---

### BUG-2 · Fallback URL chain in `templateLoader.js` is completely broken
**File:** `templateLoader.js` · lines 8–30

```js
const fetchRemoteTemplates = (url) => {
  if (isTemplateLoaded === null) {          // guard keyed on null
    isTemplateLoaded = fetch(url)…;
  }
  return isTemplateLoaded;
};

export const loadRemoteTemplates = () => {
  if (isTemplateLoaded === null) {
    isTemplateLoaded = fetchRemoteTemplates(`/hacsfiles/…`)
      .catch(() => fetchRemoteTemplates(`/local/…`))          // never works
      .catch(() => fetchRemoteTemplates(`/local/community/…`));
  }
  return isTemplateLoaded;
};
```

**Trace when the first fetch fails:**
1. `loadRemoteTemplates` calls `fetchRemoteTemplates('/hacsfiles/…')`.
2. Inside `fetchRemoteTemplates`: `isTemplateLoaded === null` → true → sets `isTemplateLoaded = P_inner` (the inner fetch promise) → returns it.
3. Back in `loadRemoteTemplates`: `isTemplateLoaded = P_inner.catch(cb1).catch(cb2)` = `P_outer`. But `isTemplateLoaded` is already `P_inner` from step 2, not `P_outer`.
4. When `P_inner` rejects, `cb1` runs: calls `fetchRemoteTemplates('/local/…')`.
5. Inside: `isTemplateLoaded` is `P_inner` (rejected, not `null`) → guard skips → new fetch never starts → returns the already-rejected `P_inner`.
6. **Result: the second and third URLs are never fetched.** All fallbacks silently collapse to the first failure.

**Fix:** rewrite as a clean sequential async function:
```js
let loadPromise = null;
let remoteTemplates = {};

export const getRemoteTemplates = () => remoteTemplates;

export const loadRemoteTemplates = () => {
  if (loadPromise !== null) return loadPromise;
  const filename = "streamline-card/streamline_templates.yaml";
  const urls = [
    `/hacsfiles/${filename}`,
    `/local/${filename}`,
    `/local/community/${filename}`,
  ];
  loadPromise = (async () => {
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        remoteTemplates = evaluateYaml(await res.text());
        return;
      } catch { /* try next */ }
    }
  })();
  return loadPromise;
};
```

---

### BUG-3 · `getTemplates()` re-attaches `.then()` on every `setConfig` call
**File:** `streamline-card.js` · lines 198–207

```js
if (isTemplateLoaded instanceof Promise) {
  isTemplateLoaded.then(() => {        // new callback added on EVERY call
    isTemplateLoaded = true;
    if (this._card === undefined) {
      this.setConfig(this._originalConfig);
      this.queueUpdate("hass");
    }
  });
}
```

`setConfig → prepareConfig → getTemplates` runs once per card during initial load. With 30 cards initialising while the fetch is in-flight, 30 separate `.then()` callbacks attach to the same Promise. On resolution, 30 `setConfig` + `queueUpdate("hass")` calls fire simultaneously — redundant work and unpredictable ordering.

**Fix:** track registration with a per-instance flag, or use the unified template-registry subscriber pattern (see Phase 1 plan).

---

### BUG-4 · Editor sort comparator always returns `NaN`
**File:** `streamline-card-editor.js` · lines 158–167

```js
return Object.keys(variables).sort((left, right) => {
  const leftIndex = Object.keys(this._config.variables).find((key) =>
    Object.hasOwn(this._config.variables[key] ?? "", left),  // always false
  );  // find() returns a string key or undefined — never a number
  const rightIndex = …;
  return leftIndex - rightIndex;  // undefined - undefined = NaN
});
```

- `Object.hasOwn("light.bedroom", "someVariableName")` → always `false` for primitive values.
- `find()` always returns `undefined`.
- `undefined - undefined = NaN`.
- A comparator returning `NaN` makes `Array.sort` non-deterministic (engine-defined behaviour).

**Fix:**
```js
const configKeys = Object.keys(this._config.variables);
return Object.keys(variables).sort((a, b) => {
  const ai = configKeys.indexOf(a);
  const bi = configKeys.indexOf(b);
  return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
});
```

---

### BUG-5 · Editor `getVariablesForTemplate` hard-throws inside `render()`
**File:** `streamline-card-editor.js` · lines 145–148

```js
if (typeof templateConfig === "undefined") {
  throw new Error(`The template "${template}" doesn't exist…`);
}
```

`render()` is called from `set hass`. If a template is renamed or deleted while the editor is open, every subsequent hass update throws an uncaught exception and crashes the editor entirely.

**Fix:** `return []` and emit a `console.warn` instead of throwing.

---

### BUG-6 · Editor constructor crashes when `lovelace` is `null`
**File:** `streamline-card-editor.js` · lines 19–35

```js
const lovelace = getLovelace() || getLovelaceCast();  // can be null

// later, no null guard:
...lovelace.config.streamline_templates,  // TypeError
```

The `_templates === null` check on line 38 is dead code — `_templates` is always `{ ...exampleTile }` at that point, never `null`. It provides zero protection.

**Fix:** `lovelace?.config?.streamline_templates ?? {}`.

---

### BUG-7 · `evaluateJavascript` mutates its input object
**File:** `evaluateJavascript-helper.js` · lines 54–65

```js
template[key.replace("_javascript", "")] = processedValue;
delete template[key];
```

Works today by accident because `evaluateVariables` returns `JSON.parse(…)` — a fresh clone. But the function is impure. Any future caching that reuses the config reference will silently corrupt state: `_javascript` keys disappear on first call, all subsequent calls return wrong results with no error.

**Fix:** build and return a new object instead of mutating in-place.

---

### BUG-8 · `setVariablesDefault` crashes when `_hass` is `undefined`
**File:** `streamline-card-editor.js` · line 94

```js
const entityList = Object.keys(this._hass.states);  // TypeError if _hass undefined
```

`setConfig` is called by HA before `set hass`. If a variable name contains `"entity"` and has an empty value, this crashes.

**Fix:** guard with `this._hass?.states ?? {}`.

---

### BUG-9 · Two independent template-loading systems with no shared state
`streamline-card.js` declares its own `isTemplateLoaded` (line 9), `remoteTemplates` (line 10), and `fetchTemplate()` (line 164). `templateLoader.js` declares identical state. The main card never imports `templateLoader.js`; the editor never uses the card's loader. Remote templates loaded by one system are invisible to the other.

---

## 2. Performance Issues

### PERF-1 · `JSON.stringify` of entire template on every hass update
**File:** `evaluateVariables-helper.js` · line 53

```js
const cacheKey = JSON.stringify({ templateConfig, variables });
```

Called inside `parseConfig()` which runs on every `set hass`. For 30 cards, this is 30 × `JSON.stringify(fullTemplate + variables)` per HA state push, all synchronous, all on the main thread. For non-JS static cards, variables never change — the result is always a cache hit, so the only effect is wasted serialisation.

**Fix:** in `set hass`, skip `parseConfig()` entirely when `_hasJavascriptTemplate === false`:
```js
set hass(hass) {
  this._hass = hass;
  if (this._hasJavascriptTemplate) {
    const changed = this.parseConfig();
    if (changed) this.queueUpdate("config");
  }
  this.queueUpdate("hass");
}
```

---

### PERF-2 · Unconditional `requestAnimationFrame` on every hass update
**File:** `streamline-card.js` · line 161

```js
this.queueUpdate("hass");  // always, no guard
```

Even when the card isn't connected or `_card` isn't ready, an rAF is scheduled. With 30 cards this is 30 rAF registrations per state push delivering nothing.

**Fix:** guard: `if (this._isConnected && this._card) this.queueUpdate("hass")`.

---

### PERF-3 · Editor fully re-renders on every hass update
**File:** `streamline-card-editor.js` · lines 57–60

```js
set hass(hass) {
  this._hass = hass;
  this.render();  // full schema rebuild on every state update
}
```

`render()` runs `JSON.stringify(templateConfig)` + regex `matchAll`, then sets `form.schema` and `form.data`. The editor UI is driven by `_config`, not hass state.

**Fix:** in `set hass`, only push hass to the form (needed for entity pickers):
```js
set hass(hass) {
  this._hass = hass;
  if (this.elements?.form) this.elements.form.hass = hass;
}
```

---

### PERF-4 · `variableCache` is unbounded and leaks forever
**File:** `evaluateVariables-helper.js` · line 7

Module-level `new Map()`, never evicted. In long sessions with dynamic variables (counters, sliders), every unique `(template, variables)` combination adds a permanent entry.

**Fix:** replace with a bounded LRU (e.g. 100 entries), or scope the cache to each card instance so it is GC'd on removal.

---

### PERF-5 · Cache-busting defeats all HTTP caching in production
**File:** `streamline-card.js:165`, `templateLoader.js:10`

```js
fetch(`${url}?t=${new Date().getTime()}`)
```

Forces a network request on every page load. Template YAML is static.

**Fix:** remove the `?t=…` suffix. Gate it behind a `?debug=true` URL flag if needed for development.

---

## 3. Architecture Issues

### ARCH-1 · Dual template loaders (root cause of BUG-2, BUG-3, BUG-9)
Delete the inline loader from `streamline-card.js`. Import `loadRemoteTemplates` / `getRemoteTemplates` from the unified `templateLoader.js` in both files. Introduce a `subscribe(callback)` API to notify all waiting card instances when remote templates arrive.

### ARCH-2 · `_accessedProperties` is dead code
`streamline-card.js:33` — `new Set()`, never used. Remove it.

### ARCH-3 · `_isConnected` duplicates the native DOM property
`HTMLElement.isConnected` exists natively. The manual flag can drift. Replace `_isConnected` with `this.isConnected` throughout (with the understanding that `disconnectedCallback` already cancels pending rAFs, so the rAF flush is already safe).

### ARCH-4 · Filename typo: `evaluteConfig-helper.js`
Missing the letter `a`. Rename to `evaluateConfig-helper.js` and update all imports.

### ARCH-5 · Naming inconsistency: `getLovelace.helper.js`
All helpers use `*-helper.js`; this one uses `.helper.js`. Rename to `getLovelace-helper.js`.

### ARCH-6 · `fireEvent` uses `Event` instead of `CustomEvent`
`event.detail` is typed only on `CustomEvent`. Use `new CustomEvent(type, { bubbles, cancelable, composed, detail })`.

---

## 4. Summary Table

| ID | File | Category | Severity |
|----|------|----------|----------|
| BUG-1 | `streamline-card.js:178` | Null crash + wrong `&&` operator | 🔴 Critical |
| BUG-2 | `templateLoader.js:20` | Fallback URLs never tried | 🔴 Critical |
| BUG-3 | `streamline-card.js:199` | `.then()` re-attached per `setConfig` | 🔴 Critical |
| BUG-4 | `streamline-card-editor.js:158` | Sort comparator always `NaN` | 🟠 High |
| BUG-5 | `streamline-card-editor.js:146` | Hard throw in render hot path | 🟠 High |
| BUG-6 | `streamline-card-editor.js:19` | No null guard on `lovelace` | 🟠 High |
| BUG-7 | `evaluateJavascript-helper.js:54` | Mutates input object | 🟡 Medium |
| BUG-8 | `streamline-card-editor.js:94` | Crashes when `_hass` undefined | 🟠 High |
| BUG-9 | both files | Dual independent loaders | 🟠 High |
| PERF-1 | `evaluateVariables-helper.js:53` | `JSON.stringify` per hass update × 30 cards | 🔴 Critical |
| PERF-2 | `streamline-card.js:161` | Unconditional rAF per update | 🟡 Medium |
| PERF-3 | `streamline-card-editor.js:59` | Full re-render per hass update | 🟡 Medium |
| PERF-4 | `evaluateVariables-helper.js:7` | Unbounded global cache | 🟡 Medium |
| PERF-5 | both files | Cache-busting in production | 🟡 Medium |
| ARCH-1 | both files | Dual template loaders | 🟠 High |
| ARCH-2 | `streamline-card.js:33` | Dead `_accessedProperties` | 🟢 Low |
| ARCH-3 | `streamline-card.js:25` | Redundant `_isConnected` | 🟢 Low |
| ARCH-4 | `evaluteConfig-helper.js` | Filename typo | 🟢 Low |
| ARCH-5 | `getLovelace.helper.js` | Dot instead of dash in filename | 🟢 Low |
| ARCH-6 | `fireEvent-helper.js` | `Event` instead of `CustomEvent` | 🟢 Low |

---

## 5. Implementation Plan

### Phase 1 — Unified template registry (eliminates BUG-2, BUG-9, ARCH-1, PERF-5)

1. Rewrite `templateLoader.js` as a sequential async loader with proper fallback (see BUG-2 fix). Remove `?t=Date.now()`.
2. Add a `subscribe(callback)` export so card instances can register to be notified when remote templates finish loading.
3. Delete inline `isTemplateLoaded`, `remoteTemplates`, `fetchTemplate()` from `streamline-card.js`.
4. Import and use the shared loader in `streamline-card.js`.

### Phase 2 — Crash fixes (BUG-1, BUG-3, BUG-5, BUG-6, BUG-8)

5. `streamline-card.js:178` — add `lovelace?.config?.streamline_templates` null guard (BUG-1).
6. `streamline-card.js:199` — replace per-call `.then()` attachment with subscriber pattern from Phase 1 (BUG-3).
7. `streamline-card-editor.js:146` — change throw → `return []` + `console.warn` (BUG-5).
8. `streamline-card-editor.js:19` — add null guard on `lovelace` (BUG-6).
9. `streamline-card-editor.js:94` — guard `this._hass?.states ?? {}` (BUG-8).

### Phase 3 — Main-thread performance (PERF-1, PERF-2, PERF-3, PERF-4)

10. `set hass` on card — skip `parseConfig()` when `_hasJavascriptTemplate === false` (PERF-1).
11. `set hass` on card — guard `queueUpdate("hass")` on `_isConnected && _card` (PERF-2).
12. `set hass` on editor — only update `form.hass`, skip full `render()` (PERF-3).
13. `evaluateVariables-helper.js` — add LRU eviction (max 100 entries) to `variableCache` (PERF-4).

### Phase 4 — Correctness fixes (BUG-4, BUG-7)

14. `streamline-card-editor.js:158` — fix sort comparator with `indexOf` (BUG-4).
15. `evaluateJavascript-helper.js` — make `processConfig` return a new object, not mutate (BUG-7).

### Phase 5 — Cleanup (ARCH-2 through ARCH-6)

16. Remove `_accessedProperties` dead field.
17. Replace `_isConnected` with `this.isConnected`.
18. Rename `evaluteConfig-helper.js` → `evaluateConfig-helper.js`, update all imports.
19. Rename `getLovelace.helper.js` → `getLovelace-helper.js`, update all imports.
20. Replace `new Event + event.detail =` with `new CustomEvent(…, { detail })`.

---

### Proposed target file layout

```
src/
  streamline-card.js            ← card element only
  streamline-card-editor.js     ← editor element only
  template-registry.js          ← NEW: unified loader + subscriber API
  evaluate-config-helper.js     ← renamed (typo fixed)
  evaluate-javascript-helper.js ← now non-mutating
  evaluate-variables-helper.js  ← bounded LRU cache
  evaluate-yaml-helper.js
  format-variables-helper.js
  deep-equal-helper.js
  fire-event-helper.js          ← CustomEvent
  get-lovelace-helper.js        ← renamed (dash fixed)
  templates/
    exampleTile.js
```

The key structural change is `template-registry.js`, which owns the single `isTemplateLoaded` state, the sequential fallback fetch, the merged template object (exampleTile + remote + inline), and a `subscribe(callback)` API — replacing the fragile per-call `.then()` re-attachment pattern and eliminating the dual-loader split.
