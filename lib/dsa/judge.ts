/**
 * @file
 *
 * Test evaluation for `DsaCodeRunner`.
 *
 * ## Why this file exists
 *
 * The first version of the runner appended `console.log(<input>)` to the
 * learner's code and compared the captured output to `expected` with `===`.
 * That could never pass, for two reasons that both hid behind a green-looking
 * UI:
 *
 * 1. **The starter's own demo log is still in the buffer.** Every lesson's
 *    starter ends with `console.log(insertionSort([5, 2, 4, 6, 1, 3]))`, so
 *    `output` is that line *plus* the test's line, joined with `\n`. Comparing
 *    a two-line string to `"[]"` fails no matter what the learner wrote.
 * 2. **`String()` is not a value notation.** `lib/editor.ts` captures with
 *    `args.map(String).join(" ")`, so `console.log([1, 2, 3])` prints
 *    `"1,2,3"` — never `"[1,2,3]"`, which is what the content fixtures say.
 *    Every array-returning test was therefore unsatisfiable by construction.
 *
 * ## The contract
 *
 * The probe is wrapped in a marker so earlier output is ignored, and the value
 * is serialised with `JSON.stringify` — one notation, shared by the probe and
 * by `normalizeExpected`, so the two sides cannot describe the same array
 * differently.
 *
 * `eval` is used deliberately: a fixture may be an expression
 * (`insertionSort([])`) *or* a statement list ending in one
 * (`const s = new MinStack(); s.push(5); s.getMin()`), and only a direct eval
 * yields the completion value of both. It does **not** widen the security
 * boundary — learner code already runs arbitrary JavaScript inside a Web
 * Worker that shadows `fetch`, `XMLHttpRequest`, `navigator` and friends
 * (`lib/editor.ts`), and a direct eval inside that function body inherits the
 * same shadowed scope.
 *
 * KEEP THIS FILE DEPENDENCY-FREE (I.9): it is imported by a client component.
 */

export const PROBE_MARKER = "__CP_PROBE__";

export type TestCase = { input: string; expected: string };

export type TestVerdict = {
  input: string;
  expected: string;
  actual: string;
  pass: boolean;
  /** True when the probe threw or the runner returned an error. */
  errored: boolean;
};

/**
 * Source appended to a learner's file to evaluate one fixture.
 *
 * `JSON.stringify(x) ?? "undefined"` is not pedantry: `JSON.stringify(undefined)`
 * returns the *value* `undefined`, so string concatenation would emit
 * `"__CP_PROBE__undefined"` from one path and a missing marker from another.
 * Spelling it out keeps `undefined` distinguishable from `null`.
 */
export function buildProbeSource(input: string): string {
  return [
    ";(() => {",
    "  try {",
    `    const __cpValue = eval(${JSON.stringify(input)});`,
    `    console.log(${JSON.stringify(PROBE_MARKER)} + (JSON.stringify(__cpValue) ?? "undefined"));`,
    "  } catch (__cpError) {",
    `    console.log(${JSON.stringify(PROBE_MARKER)} + JSON.stringify({ "__cpThrown": String(__cpError && __cpError.message || __cpError) }));`,
    "  }",
    "})();",
  ].join("\n");
}

/**
 * The value the probe printed, or `null` when it never ran.
 *
 * `lastIndexOf` because a learner might print the marker themselves — the
 * probe runs last, so the final occurrence is the one that counts.
 */
export function extractProbeValue(output: string): string | null {
  const at = output.lastIndexOf(PROBE_MARKER);
  if (at === -1) return null;
  const rest = output.slice(at + PROBE_MARKER.length);
  const firstLine = rest.split("\n")[0].trim();
  return firstLine.length > 0 ? firstLine : null;
}

/**
 * Canonical form of an authored `expected` string.
 *
 * Content fixtures are written the way a person reads them — `[1,2,3]`, `-1`,
 * `'a'` — and the probe prints canonical JSON. Round-tripping through
 * `JSON.parse` and back is what makes the two meet, without rewriting 27
 * fixtures and without a second serialiser that can drift from the first.
 *
 * The single-quote branch exists because `JSON.parse("'a'")` throws and two
 * fixtures use that spelling. Anything else falls through unchanged, which
 * keeps a non-JSON expectation comparable to a printed string rather than
 * silently normalising it to something neither side produced.
 */
export function normalizeExpected(expected: string): string {
  const trimmed = expected.trim();
  try {
    return JSON.stringify(JSON.parse(trimmed));
  } catch {
    const singleQuoted = /^'([^']*)'$/.exec(trimmed);
    if (singleQuoted) return JSON.stringify(singleQuoted[1]);
    return trimmed;
  }
}

function decodeThrown(probe: string): string | null {
  if (!probe.startsWith('{"__cpThrown":')) return null;
  try {
    const parsed = JSON.parse(probe) as { __cpThrown?: unknown };
    return typeof parsed.__cpThrown === "string" ? parsed.__cpThrown : "threw";
  } catch {
    return "threw";
  }
}

/**
 * Compare one run against one fixture.
 *
 * An errored run is a failure with the reason attached, never a silent `false`:
 * "expected 5, got nothing" and "expected 5, got `ReferenceError`" are different
 * problems and the learner can only fix the second one by reading the message.
 */
export function judge(
  output: string,
  expected: string,
  runnerError: string | null = null,
): Omit<TestVerdict, "input"> {
  if (runnerError) {
    return { expected, actual: runnerError, pass: false, errored: true };
  }

  const probe = extractProbeValue(output);
  if (probe === null) {
    const printed = output.trim();
    return {
      expected,
      actual: printed.length > 0 ? printed : "no value returned",
      pass: false,
      errored: false,
    };
  }

  const thrown = decodeThrown(probe);
  if (thrown !== null) {
    return { expected, actual: `threw ${thrown}`, pass: false, errored: true };
  }

  return {
    expected,
    actual: probe,
    pass: probe === normalizeExpected(expected),
    errored: false,
  };
}
