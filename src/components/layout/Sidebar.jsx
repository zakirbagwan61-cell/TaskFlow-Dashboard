
import { useState } from "react";

const sections = [
  { name: "Dashboard", icon: "dashboard", children: ["Overview", "My Tasks", "Activity"] },
  { name: "Projects", icon: "projects", children: ["All Projects", "My Projects"] },
  { name: "Tasks", icon: "tasks", children: ["All Tasks", "My Tasks"] },
  { name: "Calendar", icon: "calendar", children: ["My Calendar"] },
  { name: "Analytics", icon: "analytics", children: ["Reports", "Progress"] },
  { name: "Team", icon: "team", children: ["All Members"] },
  { name: "Files", icon: "files", children: ["All Files"] },
  { name: "Integrations", icon: "integrations", children: ["Connected Apps"] },
  { name: "Settings", icon: "settings", children: ["General", "Preferences"] },
];

function SidebarIcon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    case "projects":
      return <svg {...common}><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 10h18" /></svg>;
    case "tasks":
      return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m8 9 1.5 1.5L12 8" /><path d="M14 10h2M8 15h8" /></svg>;
    case "calendar":
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>;
    case "analytics":
      return <svg {...common}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>;
    case "team":
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "files":
      return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></svg>;
    case "integrations":
      return <svg {...common}><path d="M9 12a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M15 12a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
    

case "settings":
  return (
   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings preview-icon"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
  );

    default:
      return null;
  }
}

export default function Sidebar({
  activeItem,
  setActiveItem,
  isCollapsed = false,
}) {
  const [openSections, setOpenSections] = useState([
    "Dashboard",
    "Projects",
    "Tasks",
    "Team",
  ]);

  function toggleSection(name) {
    setOpenSections((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  }

  function handleSectionClick(section) {
    if (!isCollapsed) toggleSection(section.name);

    const defaultPages = {
      Dashboard: "Overview",
      Projects: "All Projects",
      Tasks: "All Tasks",
      Calendar: "My Calendar",
      Analytics: "Reports",
      Team: "All Members",
      Files: "All Files",
      Integrations: "Connected Apps",
      Settings: "General",
    };

    setActiveItem(defaultPages[section.name] || section.name);
  }

  return (
    <aside className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="brand" title="Atlas">
        <span className="brand-logo">◈</span>
        {!isCollapsed && <span>Atlas</span>}
      </div>

      <nav>
        {sections.map((section) => {
          const isOpen = openSections.includes(section.name);

          const sectionIsActive =
            (section.name === "Dashboard" &&
              ["Overview", "My Tasks", "Activity"].includes(activeItem)) ||
            (section.name === "Projects" &&
              ["Projects", "All Projects", "My Projects"].includes(activeItem)) ||
            (section.name === "Tasks" &&
              ["All Tasks", "My Tasks"].includes(activeItem)) ||
            (section.name === "Team" &&
              ["Team", "All Members"].includes(activeItem)) ||
            section.name === activeItem;

          return (
            <div className="sidebar-section" key={section.name}>
              <button
                type="button"
                title={isCollapsed ? section.name : undefined}
                className={`sidebar-heading sidebar-single ${
                  isOpen ? "section-open" : ""
                } ${sectionIsActive ? "section-active" : ""}`}
                onClick={() => handleSectionClick(section)}
                aria-label={section.name}
                aria-expanded={isCollapsed ? undefined : isOpen}
              >
                <span className="sidebar-section-icon">
                  <SidebarIcon name={section.icon} />
                </span>

                {!isCollapsed && <span>{section.name}</span>}

                {!isCollapsed && (
                  <span
                    className={`arrow ${isOpen ? "arrow-open" : ""}`}
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                )}
              </button>

              {!isCollapsed && isOpen &&
                section.children.map((item) => (
                  <button
                    type="button"
                    key={`${section.name}-${item}`}
                    title={item}
                    className={`sidebar-link ${
                      activeItem === item ? "active" : ""
                    }`}
                    onClick={() => setActiveItem(item)}
                  >
                    <span>{item}</span>
                    {item === "My Tasks" && (
                      <span className="sidebar-count">6</span>
                    )}
                  </button>
                ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
