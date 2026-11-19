"use client";

import { isSection } from "@/config/roadmaps/utils";
import type { RoadmapNode } from "@/config/roadmaps/types";
import RoadmapNodeCard, { type RoadmapNodeEvents } from "./RoadmapNodeCard";

type Props = RoadmapNodeEvents & {
  node: RoadmapNode;
};

/**
 * One stage of the roadmap: the section card sits on the vertical spine and its
 * children fan out to the right. Deeper levels recurse into a nested fan.
 */
export default function RoadmapStage({ node, ...events }: Props) {
  const children = node.children ?? [];

  return (
    <div className="rm-stage">
      <div className="rm-stage-pin">
        <RoadmapNodeCard node={node} variant="section" {...events} />
      </div>
      {children.length > 0 && <RoadmapFan nodes={children} {...events} />}
    </div>
  );
}

function RoadmapFan({ nodes, ...events }: RoadmapNodeEvents & { nodes: RoadmapNode[] }) {
  return (
    <ul className="rm-fan">
      {nodes.map((child) => (
        <li key={child.id}>
          <RoadmapNodeCard
            node={child}
            variant={isSection(child) ? "section" : "topic"}
            {...events}
          />
          {isSection(child) && <RoadmapFan nodes={child.children ?? []} {...events} />}
        </li>
      ))}
    </ul>
  );
}
