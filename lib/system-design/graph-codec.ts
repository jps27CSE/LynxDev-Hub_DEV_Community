import { SdGraphSchema } from "./validation";
import type { SdGraph } from "@/config/system-design/types";

/** Maximum encoded payload size for share links (bytes). */
const MAX_PAYLOAD_BYTES = 8_000;

/**
 * Share-link codec.
 *
 * Encodes a graph as base64url so it can live in `?d=<payload>`.
 * Decodes and validates with `SdGraphSchema` so a hand-edited URL cannot
 * inject a malformed graph.
 *
 * The node cap in `SdGraphSchema` (40 nodes, 120 edges) bounds the URL length.
 * A 40-node graph base64url-encoded is ~1.5 KB — well within comfortable URL
 * limits. If a real lab ever exceeds ~1800 chars we degrade to storing the
 * graph in the DB and sharing an id (see plan §9.4).
 */

/** Encode a graph to a base64url string. */
export function encodeGraph(graph: SdGraph): string {
  // Validate size before encoding to prevent DoS
  if (graph.nodes.length > 40 || graph.edges.length > 120) {
    throw new Error("Graph exceeds maximum size for share link");
  }
  const json = JSON.stringify(graph);
  const bytes = new TextEncoder().encode(json);
  if (bytes.length > MAX_PAYLOAD_BYTES) {
    throw new Error("Encoded graph exceeds maximum payload size");
  }
  return base64UrlEncode(bytes);
}

/** Decode a base64url string back to a graph, validating the shape. */
export function decodeGraph(payload: string): { success: true; data: SdGraph } | { success: false; error: string } {
  let bytes: Uint8Array;
  try {
    bytes = base64UrlDecode(payload);
  } catch {
    return { success: false, error: "Invalid base64url payload" };
  }

  let json: string;
  try {
    json = new TextDecoder().decode(bytes);
  } catch {
    return { success: false, error: "Payload is not valid UTF-8" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { success: false, error: "Payload is not valid JSON" };
  }

  const validation = SdGraphSchema.safeParse(parsed);
  if (!validation.success) {
    const issues = validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { success: false, error: `Invalid graph: ${issues}` };
  }

  return { success: true, data: validation.data };
}

/** base64url encode (RFC 4648 §5) — no padding, `-` `_` instead of `+` `/`. */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** base64url decode — restores padding, swaps alphabet back. */
function base64UrlDecode(str: string): Uint8Array {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}