/**
 * Geometry utilities for the system-design canvas.
 *
 * Pure mathematical functions for Bézier curves, control points, etc.
 * No React dependencies, no side effects.
 */

export const NODE_WIDTH = 160;
export const NODE_HEIGHT = 72;

export interface Point {
  x: number;
  y: number;
}

export function getPortPosition(
  node: { x: number; y: number },
  pan: { x: number; y: number },
  scale: number,
  isOutput: boolean,
): Point {
  const nodeCenterX = pan.x + node.x * scale + (NODE_WIDTH * scale) / 2;
  const nodeCenterY = pan.y + node.y * scale + (NODE_HEIGHT * scale) / 2;

  if (isOutput) {
    return {
      x: nodeCenterX + (NODE_WIDTH * scale) / 2,
      y: nodeCenterY,
    };
  } else {
    return {
      x: nodeCenterX - (NODE_WIDTH * scale) / 2,
      y: nodeCenterY,
    };
  }
}

export function getControlPoints(
  from: Point,
  to: Point,
): { cp1: Point; cp2: Point } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(distance * 0.3, 100);

  const midX = from.x + dx / 2;
  const midY = from.y + dy / 2;

  const perpX = (-dy / distance) * offset;
  const perpY = (dx / distance) * offset;

  return {
    cp1: { x: midX + perpX, y: midY + perpY },
    cp2: { x: midX - perpX, y: midY - perpY },
  };
}

export function getPointOnBezier(
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
): Point {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;

  const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
  const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

  return { x, y };
}

export function getTangentOnBezier(
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
): Point {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;

  const x =
    3 * uu * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * tt * (p3.x - p2.x);
  const y =
    3 * uu * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * tt * (p3.y - p2.y);

  return { x, y };
}

export function buildBezierPath(
  from: Point,
  cp1: Point,
  cp2: Point,
  to: Point,
): string {
  return `M${from.x} ${from.y} C${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${to.x} ${to.y}`;
}

export function getPointOnPathAtProgress(
  progress: number,
  from: Point,
  cp1: Point,
  cp2: Point,
  to: Point,
): { point: Point; angle: number } {
  const point = getPointOnBezier(progress, from, cp1, cp2, to);
  const tangent = getTangentOnBezier(progress, from, cp1, cp2, to);
  const angle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;
  return { point, angle };
}
