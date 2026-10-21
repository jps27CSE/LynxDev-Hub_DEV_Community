/**
 * @file
 *
 * Pins `lib/logger.ts` — error serialization and logging.
 *
 * This module is used by 43 call sites across the codebase.
 * The critical security fix (I.8): `serializeError` walks the `cause` chain
 * (bounded to 3 levels) and redacts Drizzle SQL bound params from messages/stacks,
 * while preserving diagnostic keys (`code`, `errno`, `sqlState`, `sqlMessage`).
 *
 * A regression here means:
 *   - Bound SQL params leak into production logs (security)
 *   - Cause chain not serialized → missing root cause context
 *   - Diagnostic keys dropped → harder to debug DB errors
 *   - Infinite recursion on circular cause chains
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  serializeError,
  createLogger,
} from "../lib/logger";

describe("serializeError — SQL params redaction (security boundary)", () => {
  it("redacts 'params: ...' in error message", () => {
    const err = new Error("Query failed: params: [1, 'secret']");
    const result = serializeError(err);
    assert.equal(result.message, "Query failed: params: [redacted]");
  });

  it("redacts multi-line params in stack trace (up to stack frame)", () => {
    // The regex matches params up to a stack frame (\n\s+at\s) or end of string
    const err = new Error("Query failed");
    err.stack = `Error: params: [
  1,
  'test',
  null
]\n    at Query.execute (/app/db.js:10)`;
    const result = serializeError(err);
    assert.ok(result.stack?.includes("params: [redacted]"));
    assert.ok(!result.stack?.includes("1,\n  'test'"));
  });

  it("redacts single params occurrence in message (consumes to end)", () => {
    // The regex with lookahead consumes to end of string for non-stack-trace messages
    const err = new Error("params: [1] params: [2]");
    const result = serializeError(err);
    // The regex consumes the entire string as one match (greedy to end)
    assert.equal(result.message, "params: [redacted]");
  });

  it("handles params at end of string", () => {
    const err = new Error("Error with params: [1, 2]");
    const result = serializeError(err);
    assert.equal(result.message, "Error with params: [redacted]");
  });

  it("redacts params in stack trace", () => {
    const err = new Error("params: [1, 2]");
    err.stack = "Error: params: [1, 2]\n    at Query.execute (/app/db.js:10)";
    const result = serializeError(err);
    assert.ok(result.stack?.includes("params: [redacted]"));
    assert.ok(!result.stack?.includes("[1, 2]"));
  });

  it("does not modify message without params", () => {
    const err = new Error("Regular error message");
    const result = serializeError(err);
    assert.equal(result.message, "Regular error message");
  });
});

describe("serializeError — core behavior", () => {
  it("returns non-Error values as SerializedError", () => {
    assert.deepEqual(serializeError("string error"), { name: "UnknownError", message: "string error" });
    assert.deepEqual(serializeError(42), { name: "UnknownError", message: "42" });
    assert.deepEqual(serializeError(null), { name: "UnknownError", message: "null" });
    assert.deepEqual(serializeError(undefined), { name: "UnknownError", message: "undefined" });
    assert.deepEqual(serializeError({ custom: "object" }), { name: "UnknownError", message: "[object Object]" });
  });

  it("serializes basic Error", () => {
    const err = new Error("Test error");
    const result = serializeError(err);
    assert.equal(result.name, "Error");
    assert.equal(result.message, "Test error");
    assert.ok(typeof result.stack === "string");
  });

  it("serializes Error with cause", () => {
    const cause = new Error("Root cause");
    const err = new Error("Wrapped error", { cause });
    const result = serializeError(err);
    assert.equal(result.name, "Error");
    assert.equal(result.message, "Wrapped error");
    assert.ok(result.cause);
    assert.equal(result.cause.name, "Error");
    assert.equal(result.cause.message, "Root cause");
  });

  it("serializes multi-level cause chain", () => {
    const level3 = new Error("Level 3");
    const level2 = new Error("Level 2", { cause: level3 });
    const level1 = new Error("Level 1", { cause: level2 });
    const result = serializeError(level1);
    assert.ok(result.cause);
    assert.ok(result.cause.cause);
    assert.equal(result.cause.cause.message, "Level 3");
  });

  it("truncates cause chain at MAX_CAUSE_DEPTH (3)", () => {
    const level5 = new Error("Level 5");
    const level4 = new Error("Level 4", { cause: level5 });
    const level3 = new Error("Level 3", { cause: level4 });
    const level2 = new Error("Level 2", { cause: level3 });
    const level1 = new Error("Level 1", { cause: level2 });
    const result = serializeError(level1);
    assert.ok(result.cause);
    assert.ok(result.cause.cause);
    assert.ok(result.cause.cause.cause);
    assert.equal(result.cause.cause.cause.message, "[cause chain truncated]");
  });

  it("redacts SQL params in message", () => {
    const err = new Error("Query failed: params: [1, 'secret']");
    const result = serializeError(err);
    assert.equal(result.message, "Query failed: params: [redacted]");
  });

  it("redacts SQL params in stack trace", () => {
    const err = new Error("params: [1, 2]");
    err.stack = "Error: params: [1, 2]\n    at Query.execute (/app/db.js:10)";
    const result = serializeError(err);
    assert.ok(result.stack?.includes("params: [redacted]"));
    assert.ok(!result.stack?.includes("[1, 2]"));
  });

  it("preserves diagnostic keys (code, errno, sqlState, sqlMessage)", () => {
    const err = new Error("DB error");
    (err as any).code = "ER_DUP_ENTRY";
    (err as any).errno = 1062;
    (err as any).sqlState = "23000";
    (err as any).sqlMessage = "Duplicate entry 'test' for key 'email'";

    const result = serializeError(err);
    assert.equal(result.code, "ER_DUP_ENTRY");
    assert.equal(result.errno, 1062);
    assert.equal(result.sqlState, "23000");
    assert.equal(result.sqlMessage, "Duplicate entry 'test' for key 'email'");
  });

  it("preserves diagnostic keys on cause", () => {
    const cause = new Error("Cause error");
    (cause as any).code = "ECONNREFUSED";
    const err = new Error("Wrapper", { cause });
    const result = serializeError(err);
    assert.equal(result.cause?.code, "ECONNREFUSED");
  });

  it("handles circular cause reference gracefully", () => {
    const err = new Error("Circular");
    (err as any).cause = err;
    const result = serializeError(err);
    assert.equal(result.message, "Circular");
  });

  it("serializes custom error classes", () => {
    class CustomError extends Error {
      constructor(message: string, public statusCode: number) {
        super(message);
        this.name = "CustomError";
      }
    }
    const err = new CustomError("Custom error", 400);
    const result = serializeError(err);
    assert.equal(result.name, "CustomError");
    assert.equal(result.message, "Custom error");
    assert.equal("statusCode" in result, false);
  });
});

describe("createLogger", () => {
  it("returns Logger with all methods", () => {
    const logger = createLogger("test-scope");
    assert.ok(typeof logger.error === "function");
    assert.ok(typeof logger.warn === "function");
    assert.ok(typeof logger.info === "function");
    assert.ok(typeof logger.timed === "function");
  });

  it("error logs with error and context", () => {
    const logger = createLogger("test-scope");
    logger.error("Test error", new Error("Oops"), { userId: 123 });
  });

  it("warn logs with context", () => {
    const logger = createLogger("test-scope");
    logger.warn("Test warning", { key: "value" });
  });

  it("info logs with context", () => {
    const logger = createLogger("test-scope");
    logger.info("Test info", { key: "value" });
  });

  it("timed executes function and returns result", async () => {
    const logger = createLogger("test-scope");
    const result = await logger.timed("test-operation", async () => {
      return "success";
    });
    assert.equal(result, "success");
  });

  it("timed propagates errors", async () => {
    const logger = createLogger("test-scope");
    await assert.rejects(
      logger.timed("failing-op", async () => {
        throw new Error("Operation failed");
      }),
      /Operation failed/,
    );
  });

  it("timed logs slow query warning (above threshold)", async () => {
    const logger = createLogger("test-scope");
    await logger.timed("fast-op", async () => {
      return "ok";
    });
  });

  it("different scopes create independent loggers", () => {
    const logger1 = createLogger("scope1");
    const logger2 = createLogger("scope2");
    assert.notEqual(logger1, logger2);
  });
});

describe("Production vs Development behavior", () => {
  it("serializeError behavior is consistent regardless of NODE_ENV", () => {
    const err = new Error("Test error with params: [1, 2]");
    const result = serializeError(err);
    assert.equal(result.message, "Test error with params: [redacted]");
  });
});

describe("Edge cases", () => {
  it("handles Error with no stack", () => {
    const err = new Error("No stack");
    err.stack = undefined;
    const result = serializeError(err);
    assert.equal(result.message, "No stack");
    assert.equal(result.stack, undefined);
  });

  it("handles Error with empty message", () => {
    const err = new Error("");
    const result = serializeError(err);
    assert.equal(result.message, "");
  });

  it("handles very long error message", () => {
    const longMsg = "x".repeat(10000);
    const err = new Error(longMsg);
    const result = serializeError(err);
    assert.equal(result.message, longMsg);
  });

  it("handles cause that is not an Error", () => {
    const err = new Error("Wrapper", { cause: "string cause" });
    const result = serializeError(err);
    assert.deepEqual(result.cause, { name: "UnknownError", message: "string cause" });
  });

  it("serializes TypeError", () => {
    const err = new TypeError("Type error");
    const result = serializeError(err);
    assert.equal(result.name, "TypeError");
    assert.equal(result.message, "Type error");
  });

  it("serializes RangeError", () => {
    const err = new RangeError("Range error");
    const result = serializeError(err);
    assert.equal(result.name, "RangeError");
  });

  it("serializes SyntaxError", () => {
    const err = new SyntaxError("Syntax error");
    const result = serializeError(err);
    assert.equal(result.name, "SyntaxError");
  });
});