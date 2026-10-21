import type { LucideIcon } from "lucide-react";
import {
  Monitor,
  Globe,
  Scale,
  Server,
  Cpu,
  Zap,
  Database,
  HardDrive,
  ListOrdered,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  monitor: Monitor,
  globe: Globe,
  scale: Scale,
  server: Server,
  cpu: Cpu,
  zap: Zap,
  database: Database,
  "hard-drive": HardDrive,
  "list-ordered": ListOrdered,
};

export function createLucideIcon(key: string): LucideIcon {
  return iconMap[key] ?? Monitor;
}