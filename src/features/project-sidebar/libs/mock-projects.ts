export type SidebarItem = {
  id: string;
  label: string;
};

export type SidebarSection = {
  heading: string;
  items: SidebarItem[];
};

export const MOCK_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    heading: "t3code-clone",
    items: [
      { id: "t3-1", label: "Prisma plugin functionality" },
      { id: "t3-2", label: "auth proxy setup" },
    ],
  },
  {
    heading: "chaicodeclaw",
    items: [{ id: "cha-1", label: "agent hooks experiment" }],
  },
  {
    heading: "openclaw build",
    items: [{ id: "ocb-1", label: "split layout polish" }],
  },
  {
    heading: "Home",
    items: [{ id: "home-1", label: "dashboard shell mock" }],
  },
  {
    heading: "openclaw clone",
    items: [{ id: "occ-1", label: "resizable workspaces" }],
  },
];
