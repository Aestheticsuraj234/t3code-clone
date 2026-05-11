import type { SidebarItem } from "../libs/mock-projects";

export function sidebarRowKey(section: string, item: SidebarItem) {
  return `${section}:${item.id}`;
}
